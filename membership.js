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
    detailEl.textContent = row.paid_duration_days ? `Premium Membership — ${row.paid_duration_days} दिन` : "Premium Membership";
    statusEl.textContent = "तपाईंको Premium Membership सक्रिय छ।";
    statusEl.dataset.kind = "success";
    expiryEl.textContent = row.paid_until ? `Membership समाप्त हुने मिति: ${formatDate(row.paid_until)}` : "Membership सक्रिय";
    progressEl.style.width = "100%";
    return;
  }
  detailEl.textContent = "Free Membership";
  statusEl.textContent = "Free Trial समाप्त भएको छ। Premium सामग्री खोल्न Membership आवश्यक छ।";
  statusEl.dataset.kind = "warning";
  expiryEl.textContent = row.trial_ends_at ? `Trial समाप्त मिति: ${formatDate(row.trial_ends_at)}` : "";
  progressEl.style.width = "100%";
}
function showTrialConsent(user) {
  if (!panel) return;
  panel.classList.remove("hidden");
  detailEl.textContent = "७ दिनको Free Trial";
  statusEl.textContent = "तपाईंले सहमति दिएपछि मात्र Free Trial सुरु हुनेछ। कुनै पैसा स्वतः काटिँदैन।";
  statusEl.dataset.kind = "info";
  expiryEl.textContent = "Trial सुरु गरेपछि ७ दिनसम्म Premium सुविधा प्रयोग गर्न सक्नुहुन्छ।";
  progressEl.style.width = "0%";

  let box = document.getElementById("trialConsentBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "trialConsentBox";
    box.className = "trial-consent-box";
    box.innerHTML = `
      <p><strong>Free Trial सुरु गर्ने?</strong></p>
      <p>• ७ दिन निःशुल्क Premium सुविधा।</p>
      <p>• Trial पछि आफैँ पैसा काटिँदैन।</p>
      <p>• Premium जारी राख्न तपाईंले आफैँ Plan छानेर Payment गर्नुपर्छ।</p>
      <label class="trial-consent-label">
        <input id="trialConsentCheck" type="checkbox">
        मैले जानकारी पढेँ र ७ दिनको Free Trial सुरु गर्न सहमत छु।
      </label>
      <button id="startTrialButton" type="button" disabled>Start Free Trial</button>
    `;
    panel.appendChild(box);
    const check = box.querySelector("#trialConsentCheck");
    const button = box.querySelector("#startTrialButton");
    check.addEventListener("change", () => { button.disabled = !check.checked; });
    button.addEventListener("click", async () => {
      if (!check.checked || button.disabled) return;
      button.disabled = true;
      button.textContent = "Trial सुरु हुँदैछ...";
      const { data, error } = await supabase.rpc("start_membership_trial_with_consent", { p_consent: true });
      if (error) {
        console.error("Trial consent:", error);
        showMessage(error.message || "Trial सुरु हुन सकेन। फेरि प्रयास गर्नुहोस्।", "error");
        button.disabled = false;
        button.textContent = "Start Free Trial";
        return;
      }
      box.remove();
      const row = Array.isArray(data) ? data[0] : data;
      renderMembership(row);
    });
  }
  box.classList.remove("hidden");
}
async function loadMembership(user) {
  if (!user) {
    activeUserId = null;
    panel?.classList.add("hidden");
    document.getElementById("trialConsentBox")?.remove();
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
  const { data: rows, error } = await supabase.rpc("refresh_membership_status");
  const data = Array.isArray(rows) ? rows[0] : rows;
  if (error) {
    console.error("Membership lookup:", error);
    showMessage("Membership विवरण लोड हुन सकेन। फेरि प्रयास गर्नुहोस्।", "error");
    return;
  }
  if (!data) {
    showTrialConsent(user);
    return;
  }
  document.getElementById("trialConsentBox")?.remove();
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
