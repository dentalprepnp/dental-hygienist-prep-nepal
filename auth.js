import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://jrivojhpdupxnpefevzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const form = $("accountForm");
const status = $("accountStatus");
const authPanel = $("accountPanel");
const signedInPanel = $("signedInPanel");

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
  if (!user) {
    authPanel?.classList.remove("hidden");
    signedInPanel?.classList.add("hidden");
    return;
  }
  authPanel?.classList.add("hidden");
  signedInPanel?.classList.remove("hidden");
  const email = $("signedInEmail");
  if (email) email.textContent = user.email || "Signed in";
  const name = user.user_metadata?.name || "";
  const greeting = $("accountGreeting");
  if (greeting) greeting.textContent = name ? `नमस्ते, ${name}! तपाईं Login हुनुहुन्छ।` : "तपाईं सफलतापूर्वक Login हुनुभयो।";
}
async function refreshSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) message("Session जाँच गर्दा समस्या आयो: " + error.message, "error");
  showUser(data?.session?.user || null);
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const action = event.submitter?.value || "login";
  const email = $("accountEmail")?.value.trim();
  const password = $("accountPassword")?.value || "";
  const name = $("accountName")?.value.trim() || "";
  if (!email || !password) return message("Email र Password दुवै भर्नुहोस्।", "error");
  if (action === "signup" && password.length < 8) return message("Password कम्तीमा 8 अक्षरको राख्नुहोस्।", "error");
  setBusy(true);
  try {
    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: "https://dentalprepnp.github.io/dental-hygienist-prep-nepal/", data: { name } }
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

$("signOutButton")?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return message(error.message, "error");
  showUser(null);
  message("तपाईं Logout हुनुभयो।", "success");
});

supabase.auth.onAuthStateChange((_event, session) => showUser(session?.user || null));
refreshSession();
