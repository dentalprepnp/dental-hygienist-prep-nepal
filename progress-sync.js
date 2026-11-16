import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL = "https://jrivojhpdupxnpefevzm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const KEYS = ["dhpn-progress","dhpn-mock-history","dhpn-mcq-history","dhpn-student-profile","dhpn-study-goal"];
let currentUser = null, syncTimer = null, syncing = false;
function status(text) {
  let el = document.getElementById("cloudSyncStatus");
  const panel = document.getElementById("signedInPanel");
  if (!el && panel) { el=document.createElement("p");el.id="cloudSyncStatus";el.className="muted";el.setAttribute("role","status");panel.appendChild(el); }
  if (el) el.textContent=text;
}
function parseLocal(key) { const raw=localStorage.getItem(key);if(raw===null)return null;try{return JSON.parse(raw)}catch{return raw} }
function mergeHistory(localRows,cloudRows,key) {
  const all=[...(Array.isArray(cloudRows)?cloudRows:[]),...(Array.isArray(localRows)?localRows:[])],seen=new Set();
  return all.filter(row=>{
    const signature=key==="dhpn-mock-history"?[row.date,row.module,row.score,row.total].join("|"):[row.date,row.module,row.question,row.selected].join("|");
    if(seen.has(signature))return false;seen.add(signature);return true;
  }).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))).slice(key==="dhpn-mock-history"?-200:-500);
}
function mergeValue(key,localValue,cloudValue) {
  if(localValue===null)return cloudValue;if(cloudValue===null)return localValue;
  if(key==="dhpn-mock-history"||key==="dhpn-mcq-history")return mergeHistory(localValue,cloudValue,key);
  if(key==="dhpn-progress")return {attempted:Math.max(Number(localValue.attempted)||0,Number(cloudValue.attempted)||0),correct:Math.max(Number(localValue.correct)||0,Number(cloudValue.correct)||0),best:Math.max(Number(localValue.best)||0,Number(cloudValue.best)||0)};
  if(key==="dhpn-student-profile")return localValue.name||localValue.target?localValue:cloudValue;
  return localValue;
}
async function syncNow() {
  if(!currentUser||syncing)return;syncing=true;status("⏳ पढाइको Progress Cloud मा Sync हुँदैछ...");
  try {
    const {data:rows,error:readError}=await supabase.from("user_progress").select("progress_key,progress_data").eq("user_id",currentUser.id);
    if(readError)throw readError;
    const cloud=new Map((rows||[]).map(row=>[row.progress_key,row.progress_data])),updates=[];
    for(const key of KEYS){const merged=mergeValue(key,parseLocal(key),cloud.has(key)?cloud.get(key):null);if(merged!==null){localStorage.setItem(key,JSON.stringify(merged));updates.push({user_id:currentUser.id,progress_key:key,progress_data:merged,updated_at:new Date().toISOString()});}}
    if(updates.length){const {error:writeError}=await supabase.from("user_progress").upsert(updates,{onConflict:"user_id,progress_key"});if(writeError)throw writeError;}
    window.dispatchEvent(new CustomEvent("dhpn:cloud-data-loaded"));status("✓ Progress सुरक्षित छ र Cloud सँग Sync भयो।");
  } catch(error){console.error("Dental Prep cloud sync:",error);status("⚠️ Cloud Sync हुन सकेन। इन्टरनेट जाँचेर फेरि प्रयास गर्नुहोस्।");}
  finally{syncing=false;}
}
function scheduleSync(){if(!currentUser)return;clearTimeout(syncTimer);syncTimer=setTimeout(syncNow,900);}
window.addEventListener("dhpn:data-changed",scheduleSync);
window.addEventListener("dhpn:cloud-data-loaded",()=>{window.location.reload()});
supabase.auth.onAuthStateChange((event,session)=>{currentUser=session?.user||null;if(currentUser&&(event==="SIGNED_IN"||event==="INITIAL_SESSION"||event==="TOKEN_REFRESHED"))setTimeout(syncNow,0);else if(!currentUser)status("");});
const {data:sessionData}=await supabase.auth.getSession();currentUser=sessionData?.session?.user||null;if(currentUser)await syncNow();
