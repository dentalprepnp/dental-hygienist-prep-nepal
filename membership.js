import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://jrivojhpdupxnpefevzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const panel = document.getElementById("membershipPanel");
const statusEl = document.getElementById("membershipStatus");
const detailEl = document.getElementById("membershipDetail");
const expiryEl = document.getElementById("membershipExpiry");
const progressEl = document.getElementById("trialProgress");
let activeUserId = null;

function showMessage(text, kind = "info") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.dataset.kind = kind;
  statusEl.classList.remove("hidden");
}
function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ne-NP", { dateStyle: "medium", timeZone: "Asia/Kathmandu" }).format(new Date(value));
}
function renderMembership(row) {
  if (!panel) return;
  panel.classList.remove("hidden");
  if (!row) {
    detailEl.textContent = "तपाईंको Membership विवरण उपलब्ध छैन।";
    statusEl.textContent = "पहिले आफ्नो Email verify गरेर Login गर्नुहोस्।";
    expiryEl.textContent = "";
    progressEl.style.width = "0%";
    return;
  }
  const now = Date.now();
  if (row.status === "trial" && row.trial_ends_at) {
    const end = new Date(row.trial_ends_at).getTime();
    const remaining = Math.max(0, end - now);
    const days = Math.ceil(remaining / 86400000);
    detailEl.textContent = "7-Day Free Trial";
    statusEl.textContent = remaining > 0
      ? `तपाईंको Free Trial सक्रिय छ — ${days} दिन बाँकी।`
      : "तपाईंको Free Trial समाप्त भएको छ। Premium Membership लिनुहोस्।";
    statusEl.dataset.kind = remaining > 0 ? "success" : "warning";
    expiryEl.textContent = `Trial समाप्त हुने मिति: ${formatDate(row.trial_ends_at)}`;
    const total = 7 * 86400000;
    const used = Math.min(total, Math.max(0, total - remaining));
    progressEl.style.width = `${Math.round((used / total) * 100)}%`;
    return;
  }
  if (row.membership_type === "premium" && row.status === "active") {
    detailEl.textContent = "Premium Membership";
    statusEl.textContent = "तपाईंको Premium Membership सक्रिय छ।";
    statusEl.dataset.kind = "success";
    expiryEl.textContent = row.paid_until ? `Membership अवधि: ${formatDate(row.paid_until)} सम्म` : "Membership सक्रिय";
    progressEl.style.width = "100%";
    return;
  }
  detailEl.textContent = "Free Membership";
  statusEl.textContent = "Free Trial समाप्त भएको छ। Premium सामग्री खोल्न Membership आवश्यक छ।";
  statusEl.dataset.kind = "warning";
  expiryEl.textContent = row.trial_ends_at ? `Trial समाप्त मिति: ${formatDate(row.trial_ends_at)}` : "";
  progressEl.style.width = "100%";
}
async function loadMembership(user) {
  if (!user) {
    activeUserId = null;
    panel?.classList.add("hidden");
    return;
  }
  activeUserId = user.id;
  panel?.classList.remove("hidden");
  showMessage("Membership विवरण जाँच हुँदैछ...");
  if (!user.email_confirmed_at) {
    renderMembership(null);
    showMessage("Free Trial सुरु गर्न Email Verification आवश्यक छ।", "warning");
    return;
  }
  const { data: trialRows, error: trialError } = await supabase.rpc("start_membership_trial");
  if (trialError) {
    console.error("Membership trial:", trialError);
    showMessage("Membership setup बाँकी छ। Supabase मा supabase/membership.sql चलाउनुहोस्।", "error");
    detailEl.textContent = "Membership setup pending";
    return;
  }
  const trialRow = Array.isArray(trialRows) ? trialRows[0] : trialRows;
  if (trialRow) {
    renderMembership(trialRow);
    return;
  }
  const { data, error } = await supabase.from("memberships")
    .select("membership_type,status,trial_started_at,trial_ends_at,paid_started_at,paid_until")
    .eq("user_id", user.id).maybeSingle();
  if (error) {
    showMessage("Membership विवरण लोड हुन सकेन। फेरि प्रयास गर्नुहोस्।", "error");
    return;
  }
  renderMembership(data);
}
supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user || null;
  if (user?.id !== activeUserId || event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
    setTimeout(() => loadMembership(user), 0);
  }
});
const { data: sessionData } = await supabase.auth.getSession();
await loadMembership(sessionData?.session?.user || null);
