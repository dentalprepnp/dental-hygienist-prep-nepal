#!/usr/bin/env node
// Lightweight regression guard: protects the app's local script links and core faculty files.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();
const failures = [];
const ok = (message) => console.log("PASS " + message);
const fail = (message) => failures.push(message);

const indexPath = path.join(root, "index.html");
const appPath = path.join(root, "app.js");
if (!fs.existsSync(indexPath) || !fs.existsSync(appPath)) {
  console.error("Required app entry files are missing.");
  process.exit(1);
}
const html = fs.readFileSync(indexPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");

// Every local script linked from index.html must exist.
const scriptRefs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1]);
for (const ref of scriptRefs) {
  if (/^(https?:)?\/\//i.test(ref) || ref.startsWith("data:")) continue;
  const local = decodeURIComponent(ref.split("?")[0].split("#")[0]);
  if (!fs.existsSync(path.join(root, local))) fail("index.html references missing script: " + ref);
}
if (failures.length === 0) ok("all local index.html script references exist (" + scriptRefs.length + ")");

// Check core faculties are present and non-empty; this catches accidental removal/blank files.
const coreFacultyFiles = [
  "nhpc.js", "ha-module-v2.js", "physiotherapy.js", "bmlt.js", "mlt.js",
  "dha.js", "dental-pharmacy.js", "dental-materials.js", "oral-pathology.js",
  "oral-anatomy.js", "dental-public-health.js", "dental-radiology.js",
  "dental-ethics.js", "food-nutrition.js", "epidemiology-community.js",
  "ophthalmic-science.js", "radiography.js", "radiotherapy.js", "ott.js",
  "bsc-anesthesia.js"
];
for (const file of coreFacultyFiles) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) fail("core faculty file missing: " + file);
  else if (fs.statSync(p).size < 1000) fail("core faculty file unexpectedly small: " + file);
}
if (failures.length === 0) ok("all " + coreFacultyFiles.length + " core faculty files exist and are non-empty");

// Ensure each subject hub's target view is present in the HTML.
const subjectMetaBlock = app.match(/const subjectMeta\s*=\s*\{[\s\S]*?\n\};/);
if (!subjectMetaBlock) fail("subjectMeta registry not found in app.js");
else {
  const ids = [...subjectMetaBlock[0].matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map(m => m[1]);
  for (const id of ids) {
    if (!html.includes('id="' + id + 'View"')) fail("subject target view missing from index.html: " + id + "View");
  }
  if (failures.length === 0) ok("subject hub registry targets are present (" + ids.length + ")");
}


// Faculty navigation integrity: every visible faculty card must have a real view
// and a lazy-loader entry, and every lazy-loaded script must exist locally.
const viewIds = new Set([...html.matchAll(/id=["']([^"']+View)["']/g)].map(m => m[1].replace(/View$/, "")));
const tabKeys = new Set([...html.matchAll(/class=["\'][^"\']*track-card[^"\']*["\'][^>]*data-tab=["\']([^"\']+)["\']/g)].map(m => m[1]));
const lazyBlock = html.match(/const byDestination\s*=\s*\{([\s\S]*?)\n \};/);
if (!lazyBlock) fail("faculty lazy-loader registry not found in index.html");
else {
  const lazyKeys = new Set([...lazyBlock[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map(m => m[1]));
  for (const key of tabKeys) {
    if (!viewIds.has(key)) fail("faculty card has no matching view: " + key + "View");
    if (!lazyKeys.has(key)) fail("faculty card has no lazy-loader registry entry: " + key);
  }
  for (const key of lazyKeys) {
    const target = key === "basicPeriodontology" ? "nhpc" : key;
    if (!viewIds.has(target)) fail("lazy-loader destination view missing: " + target + "View");
  }
  const lazyScripts = [...lazyBlock[1].matchAll(/["']([^"']+\.js(?:\?[^"']*)?)["']/g)].map(m => m[1]);
  for (const ref of lazyScripts) {
    const local = decodeURIComponent(ref.split("?")[0].split("#")[0]);
    if (!fs.existsSync(path.join(root, local))) fail("lazy-loader references missing faculty script: " + ref);
  }
  if (failures.length === 0) ok("faculty cards, destination views, and lazy-loaded scripts are connected (" + tabKeys.size + " cards)");
}
if (!html.includes("Universal navigation recovery after lazy module loading")) {
  fail("universal faculty view recovery fallback missing from index.html");
}

// HA in-module navigation must offer a real step-back action and load the versioned module.
const haModule = fs.readFileSync(path.join(root, "ha-module-v2.js"), "utf8");
if (!haModule.includes("function backScreen()") || !haModule.includes('data-ha2="back"')) {
  fail("HA step-by-step Back navigation handler/button missing");
} else ok("HA study screens include an in-module Back action");
if (!lazyBlock || !lazyBlock[1].includes('ha:["ha-module-v2.js?v=46"]')) fail("HA navigation module is not registered for on-demand loading");
const swPath = path.join(root, "sw.js");
const sw = fs.readFileSync(swPath, "utf8");
const precacheBlock = sw.match(/const ASSETS=\[([\s\S]*?)\];/);
if (!precacheBlock || /ha-module-v2\.js/.test(precacheBlock[1])) fail("HA module is still precached during app installation");
else ok("HA module is excluded from install precache and is fetched on demand");

// Student Help must not disclose administrative or private platform information.
const helpPath = path.join(root, "supabase", "functions", "student-help", "index.ts");
const helpSource = fs.readFileSync(helpPath, "utf8");
if (!/Never reveal, infer, enumerate, or provide access to admin dashboards/.test(helpSource) || !/student records, payment records, internal settings/.test(helpSource)) fail("Student Help privacy guard for admin-only and private information is missing");
else ok("Student Help prompt blocks disclosure of admin-only and private information");

// Parse-check every first-party root JavaScript file without executing browser code.
const jsFiles = fs.readdirSync(root).filter(f => f.endsWith(".js"));
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) fail("JavaScript syntax error in " + file + ": " + (result.stderr || result.stdout).trim());
}
if (failures.length === 0) ok("JavaScript syntax check passed (" + jsFiles.length + " files)");

if (failures.length) {
  console.error("\nREGRESSION CHECK FAILED:");
  for (const message of failures) console.error("- " + message);
  process.exit(1);
}
console.log("\nRegression guard passed. This is a static integrity check; it does not replace real phone/browser testing or payment-access testing.");
