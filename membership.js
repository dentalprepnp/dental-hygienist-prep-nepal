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

// Supabase stores plan prices in paisa (100 paisa = NPR 1).
const PREMIUM_PLANS = {
  premium_30: { name: "१ महिना", days: 30, pricePaisa: 50000 },
  premium_90: { name: "३ महिना", days: 90, pricePaisa: 100000 },
  premium_180: { name: "६ महिना", days: 180, pricePaisa: 150000 },
  premium_365: { name: "१ वर्ष", days: 365, pricePaisa: 200000 }
};
function formatNPRFromPaisa(pricePaisa) {
  const rupees = Math.round(Number(pricePaisa || 0) / 100);
  return "रु. " + rupees.toLocaleString("en-IN");
}


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


function setupPlanCheckout() {
  const grid = document.getElementById("membershipPlanGrid");
  const checkout = document.getElementById("membershipCheckout");
  if (!grid || !checkout || grid.dataset.bound === "true") return;
  grid.dataset.bound = "true";
  const qrImageUrl = "";
  async function loadMyPaymentRequests() {
    const target = document.getElementById("myPaymentRequests");
    if (!target) return;
    if (!activeUserId) { target.textContent = "आफ्ना Payment Request हेर्न Login गर्नुहोस्।"; return; }
    const { data, error } = await supabase.from("manual_payment_requests")
      .select("id,plan_code,amount_paisa,transaction_reference,status,created_at,admin_note")
      .order("created_at", { ascending: false }).limit(20);
    if (error) { target.textContent = "Payment विवरण लोड हुन सकेन।"; console.error(error); return; }
    target.innerHTML = (data || []).map(row => {
      const plan = PREMIUM_PLANS[row.plan_code];
      const status = row.status === "approved" ? "स्वीकृत" : row.status === "rejected" ? "अस्वीकृत" : "जाँच हुँदैछ";
      return '<div class="checkout-pending" style="margin:8px 0"><strong>' +
        (plan ? plan.name : row.plan_code) + ' • ' + formatNPRFromPaisa(row.amount_paisa) +
        '</strong><p>Transaction ID: ' + escapeHtml(row.transaction_reference) +
        '<br>स्थिति: ' + status + '<br>पठाएको मिति: ' + formatDate(row.created_at) +
        (row.admin_note ? '<br>Admin टिप्पणी: ' + escapeHtml(row.admin_note) : '') + '</p></div>';
    }).join("") || "अहिलेसम्म Payment Request पठाइएको छैन।";
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-plan-code]");
    if (!button) return;
    const plan = PREMIUM_PLANS[button.dataset.planCode];
    if (!plan) return;
    grid.querySelectorAll(".membership-plan-card").forEach(card => card.classList.toggle("selected", card === button));
    checkout.innerHTML = [
      '<div class="checkout-heading"><div><p class="eyebrow">MANUAL QR PAYMENT</p><h3>Payment विवरण</h3></div><span class="checkout-lock" aria-hidden="true">🔒</span></div>',
      '<div class="checkout-summary"><div><span>छानिएको योजना</span><strong>' + plan.name + ' Premium</strong></div>',
      '<div><span>अवधि</span><strong>' + plan.days + ' दिन</strong></div>',
      '<div class="checkout-total"><span>जम्मा तिर्नुपर्ने</span><strong>' + formatNPRFromPaisa(plan.pricePaisa) + '</strong></div></div>',
      qrImageUrl ? '<div style="text-align:center"><img src="' + qrImageUrl + '" alt="Premium payment QR" style="max-width:260px;width:100%;height:auto"></div>' :
        '<div class="checkout-pending"><strong>भुक्तानी QR चाँडै उपलब्ध हुनेछ</strong><p>QR Code जडान नभएसम्म कृपया रकम नपठाउनुहोस्।</p></div>',
      '<form id="manualPaymentForm" class="portal-form" style="max-width:560px;margin:12px auto">',
      '<label for="paymentReference">Transaction ID / Reference Number</label><input id="paymentReference" maxlength="120" minlength="4" required placeholder="बैंक / Wallet बाट आएको Reference ID">',
      '<label for="paymentPayerName">भुक्तानी गर्ने व्यक्तिको नाम (ऐच्छिक)</label><input id="paymentPayerName" maxlength="100" placeholder="नाम">',
      '<label for="paymentPayerPhone">सम्पर्क नम्बर (ऐच्छिक)</label><input id="paymentPayerPhone" maxlength="30" inputmode="tel" placeholder="मोबाइल नम्बर">',
      '<button class="checkout-pay-button" type="submit" ' + (!qrImageUrl ? 'disabled' : '') + '>' + (qrImageUrl ? 'Payment Request पठाउनुहोस्' : 'QR जडान भएपछि खुल्नेछ') + '</button>',
      '<p id="manualPaymentMessage" role="status" aria-live="polite"></p></form>',
      '<p class="portal-muted">Admin ले बैंकमा वास्तविक रकम आएको जाँच गरेपछि मात्र Premium खुल्नेछ। Screenshot मात्रले Premium खुल्दैन।</p>',
      '<button class="checkout-back-button" type="button" id="backToMembershipPlans">← अर्को योजना छान्नुहोस्</button>'
    ].join("");
    checkout.classList.remove("hidden");
    checkout.scrollIntoView({ behavior: "smooth", block: "nearest" });
    document.getElementById("manualPaymentForm")?.addEventListener("submit", async (submitEvent) => {
      submitEvent.preventDefault();
      const form = submitEvent.currentTarget;
      const submitButton = form.querySelector('button[type="submit"]');
      const message = document.getElementById("manualPaymentMessage");
      if (!activeUserId) { message.textContent = "पहिले Login गर्नुहोस्।"; return; }
      submitButton.disabled = true; submitButton.textContent = "Request पठाउँदै...";
      const { error } = await supabase.rpc("submit_manual_payment_request", {
        p_plan_code: button.dataset.planCode,
        p_transaction_reference: document.getElementById("paymentReference").value.trim(),
        p_payer_name: document.getElementById("paymentPayerName").value.trim() || null,
        p_payer_phone: document.getElementById("paymentPayerPhone").value.trim() || null
      });
      if (error) {
        message.textContent = error.message || "Payment Request पठाउन सकिएन।";
        submitButton.disabled = false; submitButton.textContent = "Payment Request पठाउनुहोस्"; return;
      }
      message.textContent = "Payment Request सुरक्षित भयो। Admin ले बैंकमा रकम जाँच गरेपछि निर्णय हुनेछ।";
      form.reset(); submitButton.textContent = "Request पठाइयो";
      await loadMyPaymentRequests();
    });
    document.getElementById("backToMembershipPlans")?.addEventListener("click", () => {
      checkout.classList.add("hidden"); checkout.innerHTML = "";
      grid.querySelectorAll(".membership-plan-card").forEach(card => card.classList.remove("selected"));
      grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
  loadMyPaymentRequests();
}
setupPlanCheckout();
