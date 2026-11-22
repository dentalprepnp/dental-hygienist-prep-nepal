import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://jrivojhpdupxnpefevzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const form = $("accountForm");
const status = $("accountStatus");
const authPanel = $("accountPanel");
const signedInPanel = $("signedInPanel");
const accountAccessButton = $("accountAccessButton");
const topLoginButton = $("topLoginButton");
topLoginButton?.addEventListener("click", () => {
  authPanel?.classList.remove("hidden");
  authPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
  $("accountEmail")?.focus({ preventScroll: true });
});
accountAccessButton?.addEventListener("click", () => {
  authPanel?.classList.remove("hidden");
  authPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
  $("accountEmail")?.focus({ preventScroll: true });
});

function message(text, kind = "info") {
  if (!status) return;
  status.textContent = text;
  status.dataset.kind = kind;
  status.classList.remove("hidden");
}
function setBusy(busy) {
  document.querySelectorAll("#accountPanel button").forEach((button) => {
    button.disabled = busy;
  });
}
function showUser(user) {
  window.HLPAuthUser = user || null;
  if (!user) {
    document.querySelectorAll(".view").forEach((view) => view.classList.add("hidden"));
    document.getElementById("homeView")?.classList.remove("hidden");
    document.body.classList.remove("study-screen-open");
    if (topLoginButton) topLoginButton.classList.remove("hidden");
    authPanel?.classList.add("hidden");
    signedInPanel?.classList.add("hidden");
    window.dispatchEvent(new Event("dhpn-auth-changed"));
    return;
  }
  authPanel?.classList.add("hidden");
  if (topLoginButton) topLoginButton.classList.add("hidden");
  signedInPanel?.classList.remove("hidden");
  const email = $("signedInEmail");
  if (email) email.textContent = user.email || "Signed in";
  const name = user.user_metadata?.name || "";
  const phoneField = $("studentPhoneUpdate");
  if (phoneField) phoneField.value = user.user_metadata?.phone || "";
  const greeting = $("accountGreeting");
  if (greeting) greeting.textContent = name ? `नमस्ते, ${name}! तपाईं Login हुनुहुन्छ।` : "तपाईं सफलतापूर्वक Login हुनुभयो।";
  window.dispatchEvent(new Event("dhpn-auth-changed"));
}
async function refreshSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) message("Session जाँच गर्दा समस्या आयो: " + error.message, "error");
  showUser(data?.session?.user || null);
}

$("resetPasswordForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = $("resetNewPassword")?.value || "";
  if (password.length < 8) return message("नयाँ Password कम्तीमा 8 अक्षरको राख्नुहोस्।", "error");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return message(error.message, "error");
  $("resetPasswordForm")?.classList.add("hidden");
  message("Password सफलतापूर्वक परिवर्तन भयो। अब नयाँ Password बाट Login गर्न सक्नुहुन्छ।", "success");
});

// Use explicit buttons instead of relying on event.submitter, which is unreliable
// in some Android/in-app browsers. Enter-key submission always means Login.
let selectedAuthAction = "login";
function setAuthMode(mode) {
  selectedAuthAction = mode;
  const signup = mode === "signup";
  ["accountNameLabel","accountName","accountPhoneLabel","accountPhone","confirmPasswordLabel","confirmPassword"].forEach((id) => {
    $(id)?.classList.toggle("hidden", !signup);
  });
  if ($("accountName")) $("accountName").required = signup;
  if ($("accountPhone")) $("accountPhone").required = signup;
  if ($("confirmPassword")) $("confirmPassword").required = signup;
  if ($("accountPassword")) $("accountPassword").autocomplete = signup ? "new-password" : "current-password";
  if ($("accountModeHelp")) $("accountModeHelp").textContent = signup
    ? "नयाँ Account बनाउनुहोस्। Signup पछि Email verification गरेर Login गर्नुहोस्।"
    : "पहिलेबाट Account छ भने Login गर्नुहोस्। नयाँ विद्यार्थीले Signup थिच्नुहोस्।";
  $("loginButton")?.classList.toggle("secondary", signup);
  $("loginButton")?.classList.toggle("primary", !signup);
  $("signupButton")?.classList.toggle("primary", signup);
  $("signupButton")?.classList.toggle("secondary", !signup);
}
setAuthMode("login");
$("loginButton")?.addEventListener("click", () => { setAuthMode("login"); });
$("signupButton")?.addEventListener("click", () => {
  setAuthMode("signup");
  if (!form) return;
  if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
  if (typeof form.requestSubmit === "function") form.requestSubmit();
  else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
});
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const action = selectedAuthAction;
  selectedAuthAction = "login";
  const email = $("accountEmail")?.value.trim();
  const password = $("accountPassword")?.value || "";
  const name = $("accountName")?.value.trim() || "";
  const phone = $("accountPhone")?.value.trim() || "";
  if (!email || !password) return message("Email र Password दुवै भर्नुहोस्।", "error");
  if (action === "signup") {
    const domain = (email.split("@")[1] || "").toLowerCase();
    const domainFixes = { "gmial.com":"gmail.com", "gmai.com":"gmail.com", "gamil.com":"gmail.com", "gmail.co":"gmail.com", "yaho.com":"yahoo.com", "yahooo.com":"yahoo.com", "hotmial.com":"hotmail.com", "outlok.com":"outlook.com" };
    if (domainFixes[domain]) return message("Email मा spelling mistake हुन सक्छ: " + email.split("@")[0] + "@" + domainFixes[domain] + " । सही Email आफैँ जाँचेर सच्याउनुहोस्; AI/Auto-correct ले Email परिवर्तन गर्दैन।", "error");
  }
  if (action === "signup" && password.length < 8) return message("Password कम्तीमा 8 अक्षरको राख्नुहोस्।", "error");
  const confirmPassword = $("confirmPassword")?.value || "";
  if (action === "signup" && password !== confirmPassword) return message("दुवै Password मिलेनन्। दुवै ठाउँमा एउटै Password लेख्नुहोस्।", "error");
  if (action === "signup" && phone.replace(/[^0-9]/g, "").length < 7) return message("सही मोबाइल नम्बर लेख्नुहोस्।", "error");
  setBusy(true);
  try {
    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: "https://dentalprepnp.github.io/dental-hygienist-prep-nepal/", data: { name, phone } }
      });
      if (error) throw error;
      if (data.session?.user) {
        showUser(data.session.user);
        message("Account तयार भयो। स्वागत छ!", "success");
      } else {
        message("Signup सफल भयो! तपाईंले राखेको Email र Password सम्झेर राख्नुहोस्। Email Inbox/Spam मा आएको Verification Link खोल्नुहोस्। Verify भएपछि Login गर्दा Signup कै उही Email र Password प्रयोग गर्नुहोस्।", "success");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showUser(data.user);
      message("Login सफल भयो। स्वागत छ!", "success");
    }
  } catch (error) {
    const raw = String(error?.message || "");
    const lower = raw.toLowerCase();
    let friendly = raw || "काम पूरा हुन सकेन। फेरि प्रयास गर्नुहोस्।";
    if (lower.includes("invalid login credentials")) friendly = "Email वा Password मिलेन। Signup गर्दा राखेको ठ्याक्कै उही Email र Password प्रयोग गर्नुहोस्। Email verify गर्नुभएको छ कि जाँच्नुहोस्। Verification Email नआए “Verification Email फेरि पठाउनुहोस्” थिच्नुहोस्। Password बिर्सनुभएको भए Forgot Password प्रयोग गर्नुहोस्।";
    else if (lower.includes("email not confirmed")) friendly = "Email verify भएको छैन। Inbox/Spam मा verification link खोल्नुहोस् वा Verification Email फेरि पठाउनुहोस्। Verify गरेपछि Login गर्नुहोस्।";
    else if (lower.includes("already registered") || lower.includes("user already registered")) friendly = "यो Email बाट Account पहिल्यै बनेको छ। नयाँ Account नबनाई Login गर्नुहोस् वा Forgot Password थिच्नुहोस्।";
    else if (lower.includes("password should be at least")) friendly = "Password कम्तीमा 8 अक्षरको हुनुपर्छ।";
    else if (lower.includes("fetch") || lower.includes("network")) friendly = "Internet connection कमजोर छ। Net जाँचेर फेरि प्रयास गर्नुहोस्।";
    message(friendly, "error");
  } finally {
    setBusy(false);
  }
});

$("resendVerification")?.addEventListener("click", async () => {
  const email = $("accountEmail")?.value.trim();
  if (!email) return message("पहिले Signup गरेको Email लेख्नुहोस्।", "error");
  setBusy(true);
  try {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
    message("Verification Email पठाउने अनुरोध सफल भयो। Inbox र Spam जाँच्नुहोस्; link खोलेपछि Login गर्नुहोस्।", "success");
  } catch (error) {
    const raw = String(error?.message || "");
    const lower = raw.toLowerCase();
    let friendly = "Verification Email पठाउन सकिएन। Email जाँचेर केही समयपछि फेरि प्रयास गर्नुहोस्।";
    if (lower.includes("rate limit")) friendly = "धेरै पटक अनुरोध भयो। केही समय पर्खेर फेरि प्रयास गर्नुहोस्।";
    else if (lower.includes("network") || lower.includes("fetch")) friendly = "Internet जाँचेर फेरि प्रयास गर्नुहोस्।";
    message(friendly, "error");
  } finally {
    setBusy(false);
  }
});

$("forgotPassword")?.addEventListener("click", async () => {
  const email = $("accountEmail")?.value.trim();
  if (!email) return message("पहिले Email लेख्नुहोस्, त्यसपछि Forgot Password थिच्नुहोस्।", "error");
  setBusy(true);
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://dentalprepnp.github.io/dental-hygienist-prep-nepal/"
    });
    if (error) throw error;
    message("Password reset link तपाईंको Email मा पठाइयो। Inbox र Spam दुवै जाँच्नुहोस्।", "success");
  } catch (error) {
    message(error.message || "Reset link पठाउन सकिएन।", "error");
  } finally {
    setBusy(false);
  }
});

$("saveStudentPhone")?.addEventListener("click", async () => {
  const phone = $("studentPhoneUpdate")?.value.trim() || "";
  if (phone.replace(/[^0-9]/g, "").length < 7) return message("सही मोबाइल नम्बर लेख्नुहोस्।", "error");
  const { error } = await supabase.auth.updateUser({ data: { phone } });
  if (error) return message(error.message, "error");
  message("मोबाइल नम्बर सुरक्षित भयो। Admin Dashboard मा देखिन केही क्षण लाग्न सक्छ।", "success");
});

$("signOutButton")?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return message(error.message, "error");
  showUser(null);
  authPanel?.classList.add("hidden");
  message("तपाईं Logout हुनुभयो।", "success");
});

supabase.auth.onAuthStateChange((event, session) => {
  showUser(session?.user || null);
  window.dispatchEvent(new Event("dhpn-auth-changed"));
  if (event === "PASSWORD_RECOVERY") {
    $("resetPasswordForm")?.classList.remove("hidden");
    $("accountPanel")?.classList.remove("hidden");
    $("signedInPanel")?.classList.add("hidden");
    message("नयाँ Password राख्नुहोस्।", "info");
  }
});
refreshSession();
