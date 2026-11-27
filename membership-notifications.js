// Student-friendly in-app membership expiry notice.
const NOTICE_ID = "membershipExpiryNotice";
let expiryTimer = null;

function ensureNotice() {
  let node = document.getElementById(NOTICE_ID);
  if (node) return node;
  node = document.createElement("section");
  node.id = NOTICE_ID;
  node.setAttribute("role", "status");
  node.setAttribute("aria-live", "polite");
  node.style.cssText = "display:none;margin:12px 0;padding:16px;border:1px solid #bfdbfe;border-radius:14px;background:#eff6ff;color:#1e3a8a";
  const panel = document.getElementById("membershipPanel");
  if (panel?.parentNode) panel.parentNode.insertBefore(node, panel);
  return node;
}

function hideNotice() {
  const node = ensureNotice();
  node.style.display = "none";
  node.replaceChildren();
}

function showNotice(title, message, expired) {
  const node = ensureNotice();
  node.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = title;
  heading.style.cssText = "margin:0 0 8px;font-size:1.05rem";
  const body = document.createElement("p");
  body.textContent = message;
  body.style.cssText = "margin:0 0 12px;line-height:1.6";
  node.append(heading, body);
  const link = document.createElement("a");
  link.href = "#membershipPanel";
  link.textContent = expired ? "Membership नवीकरण गर्नुहोस्" : "Membership विवरण हेर्नुहोस्";
  link.style.cssText = "display:inline-block;padding:10px 14px;border-radius:8px;background:#2563eb;color:white;text-decoration:none;font-weight:600";
  node.append(link);
  node.style.display = "block";
}

function updateNotice(row) {
  if (expiryTimer) clearTimeout(expiryTimer);
  expiryTimer = null;
  if (!window.HLPAuthUser || !row) {
    hideNotice();
    return;
  }
  const now = Date.now();
  let expiry = null;
  let type = "";
  if (row.membership_type === "trial") {
    expiry = row.trial_ends_at ? new Date(row.trial_ends_at).getTime() : null;
    type = "Trial";
  } else if (row.membership_type === "premium") {
    expiry = row.paid_until ? new Date(row.paid_until).getTime() : null;
    type = "Premium Membership";
  }
  if (!expiry || !Number.isFinite(expiry)) {
    hideNotice();
    return;
  }
  const remaining = expiry - now;
  if (remaining <= 0 || row.status === "expired") {
    showNotice("तपाईंको अध्ययन अवधि समाप्त भएको छ", "तपाईंको " + type + " अवधि समाप्त भएको छ। पढाइलाई निरन्तरता दिन Membership नवीकरण गर्न सक्नुहुन्छ। तपाईंको तयारी र सफलतालाई हामी प्राथमिकता दिन्छौँ।", true);
    return;
  }
  if (remaining <= 24 * 60 * 60 * 1000) {
    showNotice("तपाईंको तयारी राम्रो हुँदैछ!", "तपाईंको " + type + " २४ घण्टाभित्र समाप्त हुँदैछ। आफ्नो अभ्यासलाई निरन्तरता दिन Membership नवीकरण गर्न सक्नुहुन्छ।", false);
  } else {
    hideNotice();
  }
  expiryTimer = setTimeout(() => updateNotice(row), Math.min(remaining + 1000, 2147480000));
}

window.addEventListener("dhpn-membership-updated", (event) => {
  updateNotice(event.detail?.membership || null);
});
window.addEventListener("dhpn-auth-changed", () => {
  if (!window.HLPAuthUser) updateNotice(null);
});
