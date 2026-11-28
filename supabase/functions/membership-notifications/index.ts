import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendKey = Deno.env.get("RESEND_API_KEY")!;
const emailFrom = Deno.env.get("EMAIL_FROM")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch] || ch));
}

function emailContent(type: string, rawName: string) {
  const name = escapeHtml(rawName.trim() || "विद्यार्थी");
  const reminder = type.endsWith("_reminder");
  const trial = type.startsWith("trial_");
  const subject = reminder
    ? "तपाईंको अध्ययन Trial भोलि समाप्त हुँदैछ"
    : "तपाईंको अध्ययन अवधि समाप्त भएको छ";
  const headline = reminder
    ? "तपाईंको तयारी राम्रो हुँदैछ!"
    : "तपाईंको पढाइलाई निरन्तरता दिऔँ";
  const message = reminder
    ? "तपाईंको Free Trial वा Premium अवधि २४ घण्टाभित्र समाप्त हुँदैछ। आफ्नो तयारीलाई निरन्तरता दिन Membership नवीकरण गर्न सक्नुहुन्छ।"
    : "तपाईंको Free Trial वा Premium अवधि समाप्त भएको छ। तपाईंको अध्ययन र परीक्षाको तयारी निरन्तर रहोस् भन्ने उद्देश्यले यो नम्र सम्झना पठाइएको हो। पढाइ जारी राख्न Membership नवीकरण गर्न सक्नुहुन्छ।";
  const url = "https://dentalprepnp.github.io/dental-hygienist-prep-nepal/";
  const trialLine = trial ? "Free Trial" : "Premium Membership";
  return {
    subject: subject,
    html: `<!doctype html><html lang="ne"><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937"><div style="max-width:600px;margin:24px auto;padding:24px;background:#fff;border-radius:16px"><p style="color:#2563eb;font-weight:700">Dental Prep Nepal • Study Reminder</p><h2>${headline}</h2><p>नमस्कार ${name},</p><p>तपाईंको ${trialLine} सम्बन्धी जानकारी दिन यो सन्देश पठाइएको हो।</p><p>${message}</p><p style="padding:14px;background:#eff6ff;border-radius:10px">तपाईंको सफलता नै हाम्रो प्राथमिकता हो। मेहनत जारी राख्नुहोस्—तपाईंको लक्ष्य नजिकिँदैछ।</p><p><a href="${url}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:white;text-decoration:none;border-radius:8px">Membership नवीकरण गर्नुहोस्</a></p><p style="color:#64748b;font-size:13px">यो स्वचालित अध्ययन सम्झना हो। तपाईंले Membership नवीकरण गरिसक्नुभएको छ भने कृपया यो Email बेवास्ता गर्नुहोस्।<br>Dental Prep Nepal Team</p></div></body></html>`,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!supabaseUrl || !serviceRoleKey || !resendKey || !emailFrom) {
    return Response.json({ error: "Required server environment is missing." }, { status: 500 });
  }

  const { error: enqueueError } = await supabase.rpc("enqueue_membership_expiry_notifications");
  if (enqueueError) return Response.json({ error: "Could not enqueue notifications." }, { status: 500 });

  const { data: jobs, error: claimError } = await supabase.rpc("claim_membership_expiry_notifications");
  if (claimError) return Response.json({ error: "Could not claim notifications." }, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const job of jobs || []) {
    const content = emailContent(job.notification_type, job.display_name || "");
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": job.id },
        body: JSON.stringify({ from: emailFrom, to: [job.email], subject: content.subject, html: content.html }),
      });
      if (!response.ok) throw new Error(`Resend HTTP ${response.status}`);
      const { error } = await supabase.from("membership_notification_log")
        .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_error: null })
        .eq("id", job.id);
      if (error) throw new Error("Could not record delivery status.");
      sent++;
    } catch (error) {
      await supabase.from("membership_notification_log")
        .update({ status: "failed", updated_at: new Date().toISOString(), last_error: String(error).slice(0, 500) })
        .eq("id", job.id);
      failed++;
    }
  }
  return Response.json({ sent, failed });
});
