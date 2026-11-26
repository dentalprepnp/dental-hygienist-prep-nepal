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
const scriptRefs = [...html.matchAll(/<script\\b[^>]*\\bsrc=["']([^"']+)["']/gi)].map(m => m[1]);
for (const ref of scriptRefs) {
  if (/^(https?:)?\\/\\//i.test(ref) || ref.startsWith("data:")) continue;
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
const subjectMetaBlock = app.match(/const subjectMeta\\s*=\\s*\\{[\\s\\S]*?\\n\\};/);
if (!subjectMetaBlock) fail("subjectMeta registry not found in app.js");
else {
  const ids = [...subjectMetaBlock[0].matchAll(/^\\s*([A-Za-z0-9_]+)\\s*:/gm)].map(m => m[1]);
  for (const id of ids) {
    if (!html.includes('id="' + id + 'View"')) fail("subject target view missing from index.html: " + id + "View");
  }
  if (failures.length === 0) ok("subject hub registry targets are present (" + ids.length + ")");
}

// Parse-check every first-party root JavaScript file without executing browser code.
const jsFiles = fs.readdirSync(root).filter(f => f.endsWith(".js"));
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) fail("JavaScript syntax error in " + file + ": " + (result.stderr || result.stdout).trim());
}
if (failures.length === 0) ok("JavaScript syntax check passed (" + jsFiles.length + " files)");

if (failures.length) {
  console.error("\\nREGRESSION CHECK FAILED:");
  for (const message of failures) console.error("- " + message);
  process.exit(1);
}
console.log("\\nRegression guard passed. This is a static integrity check; it does not replace real phone/browser testing or payment-access testing.");
