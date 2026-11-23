import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://jrivojhpdupxnpefevzm.supabase.co",
  "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u"
);
const $ = (id) => document.getElementById(id);
const panel = $("weeklyLiveExam");
const status = $("weeklyExamStatus");
const facultySelect = $("weeklyExamFaculty");
const examList = $("weeklyExamList");
let currentUser = null;
let faculties = [];

function say(message, kind = "info") {
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
}
function dateLabel(value) {
  try {
    return new Intl.DateTimeFormat("ne-NP", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kathmandu"
    }).format(new Date(value)) + " (नेपाल समय)";
  } catch { return value; }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function renderLoginState() {
  if (!panel) return;
  panel.classList.toggle("weekly-exam-locked", !currentUser);
  if (!currentUser) {
    examList.innerHTML = '<p class="muted">Weekly Live Exam मा दर्ता गर्न पहिले Login गर्नुहोस्।</p>';
    say("Login गरेपछि आफ्नो Faculty छानेर exam मा दर्ता गर्न सक्नुहुन्छ।");
  } else {
    say("Faculty छान्नुहोस्। उपलब्ध exam हरू यहाँ देखिनेछन्।");
    if (faculties.length && !facultySelect.options.length) fillFaculties();
  }
}
function fillFaculties() {
  facultySelect.innerHTML = '<option value="">— Faculty छान्नुहोस् —</option>' +
    faculties.map((f) => '<option value="' + escapeHtml(f.faculty_code) + '">' +
      escapeHtml(f.faculty_name) + '</option>').join("");
}
async function loadFaculties() {
  const { data, error } = await supabase.from("live_exam_faculties")
    .select("faculty_code,faculty_name").eq("is_active", true).order("faculty_name");
  if (error) {
    say("Faculty list load भएन: " + error.message, "error");
    return;
  }
  faculties = data || [];
  fillFaculties();
}
async function loadExams() {
  const facultyCode = facultySelect.value;
  examList.innerHTML = "";
  if (!currentUser) return renderLoginState();
  if (!facultyCode) {
    examList.innerHTML = '<p class="muted">Exam हेर्न Faculty छान्नुहोस्।</p>';
    return;
  }
  say("Exam खोज्दै...");
  const { data, error } = await supabase.from("live_exams")
    .select("exam_id,faculty_code,exam_year,exam_month,week_number,title,starts_at,duration_minutes,question_count,marks_per_question,pass_marks,status")
    .eq("faculty_code", facultyCode)
    .in("status", ["scheduled", "live"])
    .order("starts_at", { ascending: true });
  if (error) {
    say("Exam load भएन: " + error.message, "error");
    examList.innerHTML = '<p class="muted">Exam विवरण लोड गर्न समस्या भयो।</p>';
    return;
  }
  if (!data?.length) {
    say("यस Faculty का लागि अहिले exam schedule गरिएको छैन।");
    examList.innerHTML = '<p class="muted">अहिले exam उपलब्ध छैन। Admin ले schedule गरेपछि यहाँ देखिन्छ।</p>';
    return;
  }
  say("उपलब्ध exam छान्नुहोस्।");
  examList.innerHTML = data.map((exam) => `
    <article class="weekly-exam-card">
      <div class="weekly-exam-card-head">
        <div><p class="eyebrow">WEEK ${exam.week_number} • ${escapeHtml(exam.exam_month)}/${escapeHtml(exam.exam_year)}</p>
          <h3>${escapeHtml(exam.title)}</h3></div>
        <span class="weekly-exam-status">${exam.status === "live" ? "LIVE" : "Scheduled"}</span>
      </div>
      <p><strong>Exam:</strong> ${dateLabel(exam.starts_at)}</p>
      <p><strong>समय:</strong> ${exam.duration_minutes} मिनेट • <strong>प्रश्न:</strong> ${exam.question_count}</p>
      <p><strong>Pass marks:</strong> ${exam.pass_marks}</p>
      <button class="primary weekly-exam-register" type="button" data-exam-id="${escapeHtml(exam.exam_id)}">Register / Symbol Number लिनुहोस्</button>
      <p class="weekly-exam-symbol hidden" aria-live="polite"></p>
    </article>`).join("");
}
async function registerExam(button) {
  if (!currentUser) {
    say("पहिले Login गर्नुहोस्।", "error");
    $("accountPanel")?.classList.remove("hidden");
    $("accountPanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const examId = button.dataset.examId;
  button.disabled = true;
  button.textContent = "दर्ता हुँदैछ...";
  const { data, error } = await supabase.rpc("hlp_register_live_exam", { p_exam_id: examId });
  button.disabled = false;
  button.textContent = "Register / Symbol Number लिनुहोस्";
  if (error) {
    say("दर्ता हुन सकेन: " + error.message, "error");
    return;
  }
  const row = Array.isArray(data) ? data[0] : data;
  const symbol = row?.symbol_number;
  if (!symbol) {
    say("दर्ता भयो तर symbol number भेटिएन। कृपया फेरि जाँच गर्नुहोस्।", "error");
    return;
  }
  const card = button.closest(".weekly-exam-card");
  const symbolEl = card?.querySelector(".weekly-exam-symbol");
  if (symbolEl) {
    symbolEl.textContent = "तपाईंको Symbol Number: " + symbol;
    symbolEl.classList.remove("hidden");
  }
  button.textContent = "दर्ता सफल • Symbol सुरक्षित";
  button.disabled = true;
  say("Exam मा सफलतापूर्वक दर्ता भयो। तपाईंको Symbol Number: " + symbol, "success");
}
facultySelect?.addEventListener("change", loadExams);
examList?.addEventListener("click", (event) => {
  const button = event.target.closest(".weekly-exam-register");
  if (button) registerExam(button);
});
window.addEventListener("dhpn-auth-changed", () => {
  currentUser = window.HLPAuthUser || null;
  renderLoginState();
  if (currentUser && facultySelect.value) loadExams();
});
supabase.auth.getSession().then(({ data }) => {
  currentUser = data?.session?.user || window.HLPAuthUser || null;
  renderLoginState();
});
loadFaculties();
