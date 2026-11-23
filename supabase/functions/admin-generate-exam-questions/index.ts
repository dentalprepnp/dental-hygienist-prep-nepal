// Admin-only AI question drafting for Weekly Live Exams.
// Required Supabase secrets: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
// Deploy with JWT verification enabled. Never expose service-role or OpenAI keys to the browser.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://dentalprepnp.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Login required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!url || !anon || !serviceKey || !openaiKey) return json({ error: "Server secrets are not configured" }, 503);

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Valid login required" }, 401);
    const { data: isAdmin, error: adminError } = await userClient.rpc("hlp_is_live_exam_admin");
    if (adminError || isAdmin !== true) return json({ error: "Admin permission required" }, 403);

    const body = await req.json();
    const facultyCode = String(body?.faculty_code || "").trim().toUpperCase();
    const count = Number(body?.count);
    const subject = String(body?.subject || "Core syllabus topics").trim().slice(0, 120);
    const week = Number(body?.week_number || 0);
    if (!/^[A-Z0-9]{2,10}$/.test(facultyCode) || !Number.isInteger(count) || count < 1 || count > 50 || !Number.isInteger(week) || week < 1 || week > 4) {
      return json({ error: "Valid faculty, week 1–4 and question count 1–50 required" }, 400);
    }

    const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: faculty, error: facultyError } = await adminClient.from("live_exam_faculties")
      .select("faculty_code,faculty_name,exam_question_count").eq("faculty_code", facultyCode).eq("is_active", true).maybeSingle();
    if (facultyError || !faculty) return json({ error: "Active faculty not found" }, 404);

    const prompt = `Create exactly ${count} original, accurate, exam-quality multiple-choice questions for Nepal's ${faculty.faculty_name} health-professional licensing preparation. Week ${week} of a four-week monthly practice series. Subject focus: ${subject}. Use broad core syllabus coverage appropriate to this faculty; do not invent Nepal-specific laws or clinical standards. Avoid duplicates and ambiguous questions. Each question must have exactly four plausible options and one best answer. Return English question and concise Nepali translation, English and Nepali explanation. Ensure correct_option is A/B/C/D and explanations justify it. Do not copy copyrighted exam questions. Return JSON object with key "questions", an array of exactly ${count} objects with keys: subject, topic, difficulty (easy|medium|hard), question_en, question_ne, option_a, option_b, option_c, option_d, correct_option, explanation_en, explanation_ne. No markdown.`;
    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + openaiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a careful health-sciences assessment writer. Accuracy and unambiguous single-best-answer questions are essential. If uncertain, choose established foundational knowledge." },
          { role: "user", content: prompt }
        ],
        temperature: 0.25,
        max_tokens: Math.min(12000, count * 240)
      })
    });
    const aiData = await ai.json();
    if (!ai.ok) return json({ error: "AI generation failed", detail: aiData?.error?.message || "Provider error" }, 502);
    const raw = aiData?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    if (questions.length !== count) return json({ error: "AI returned an unexpected question count. Please retry this week." }, 502);

    const batch = crypto.randomUUID();
    const rows = questions.map((q: Record<string, unknown>) => ({
      faculty_code: facultyCode,
      subject: String(q.subject || subject).slice(0, 120),
      topic: String(q.topic || "").slice(0, 160),
      difficulty: ["easy", "medium", "hard"].includes(String(q.difficulty)) ? q.difficulty : "medium",
      question_en: String(q.question_en || "").trim(),
      question_ne: String(q.question_ne || "").trim(),
      option_a: String(q.option_a || "").trim(),
      option_b: String(q.option_b || "").trim(),
      option_c: String(q.option_c || "").trim(),
      option_d: String(q.option_d || "").trim(),
      correct_option: String(q.correct_option || "").toUpperCase(),
      explanation_en: String(q.explanation_en || "").trim(),
      explanation_ne: String(q.explanation_ne || "").trim(),
      source_note: "AI draft; batch " + batch + "; week " + week + ". Admin review required.",
      status: "draft",
      created_by: userData.user.id
    }));
    const invalid = rows.some((q: Record<string, string>) =>
      !q.question_en || !q.option_a || !q.option_b || !q.option_c || !q.option_d ||
      !["A", "B", "C", "D"].includes(q.correct_option) || !q.explanation_en ||
      !["easy", "medium", "hard"].includes(q.difficulty)
    );
    if (invalid) return json({ error: "AI returned incomplete or invalid questions; none were saved. Please retry." }, 502);

    const { error: insertError } = await adminClient.from("live_exam_question_bank").insert(rows);
    if (insertError) return json({ error: "Could not save question drafts", detail: insertError.message }, 500);
    return json({ faculty_code: facultyCode, week_number: week, generated: rows.length, status: "draft", batch_id: batch });
  } catch (_error) {
    return json({ error: "Question generation service temporarily unavailable" }, 500);
  }
});
