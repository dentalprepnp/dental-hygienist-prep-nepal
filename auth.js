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
    if (topLoginButton) topLoginButton.classList.remove("hidden");
    authPanel?.classList.add("hidden");
    signedInPanel?.classList.add("hidden");
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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const action = event.submitter?.value || "login";
  const email = $("accountEmail")?.value.trim();
  const password = $("accountPassword")?.value || "";
  const name = $("accountName")?.value.trim() || "";
  const phone = $("accountPhone")?.value.trim() || "";
  if (!email || !password) return message("Email र Password दुवै भर्नुहोस्।", "error");
  if (action === "signup" && password.length < 8) return message("Password कम्तीमा 8 अक्षरको राख्नुहोस्।", "error");
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
        message("Registration अनुरोध सफल भयो। आफ्नो Email Inbox खोल्नुहोस् र Supabase बाट आएको verification link थिच्नुहोस्। त्यसपछि Login गर्नुहोस्।", "success");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showUser(data.user);
      message("Login सफल भयो। स्वागत छ!", "success");
    }
  } catch (error) {
    message(error.message || "काम पूरा हुन सकेन। फेरि प्रयास गर्नुहोस्।", "error");
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
