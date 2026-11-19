import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const supabase=createClient("https://jrivojhpdupxnpefevzm.supabase.co","sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u");
const $=id=>document.getElementById(id);
const panel=$("adminDashboard"),openBtn=$("adminDashboardButton"),status=$("adminStatus");
let user=null,isAdmin=false,sessionId="";
try{sessionId=localStorage.getItem("hlp-analytics-session")||crypto.randomUUID();localStorage.setItem("hlp-analytics-session",sessionId)}catch{sessionId="session-"+Date.now()}
function say(t){if(status)status.textContent=t}
function currentFaculty(){const v=[...document.querySelectorAll(".view:not(.hidden)")].find(x=>x.id!=="homeView");return v?.id?.replace(/View$/,"")||"home"}
async function track(eventType,faculty=currentFaculty(),details={}){try{await supabase.from("app_events").insert({session_id:sessionId,user_id:user?.id||null,event_type:eventType,faculty,details})}catch(e){console.warn("Analytics event not saved",e.message)}}
async function refreshAccess(){
 // Hide privileged UI first; reveal it only after the server confirms admin membership.
 isAdmin=false;user=null;
 openBtn?.classList.add("hidden");
 panel?.classList.add("hidden");
 try{
  const {data,error:sessionError}=await supabase.auth.getSession();
  if(sessionError)throw sessionError;
  user=data?.session?.user||null;isAdmin=false;
  if(user){
   const {data:row,error}=await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
   if(error)throw error;
   isAdmin=!!row;
  }
  openBtn?.classList.toggle("hidden",!isAdmin);
  if(!isAdmin&&panel)panel.classList.add("hidden");
  return isAdmin;
 }catch(error){
  user=null;isAdmin=false;
  openBtn?.classList.add("hidden");
  panel?.classList.add("hidden");
  console.error("Admin access check failed:",error);
  say("Admin अनुमति जाँच हुन सकेन। Internet जाँच गरी Refresh गर्नुहोस्।");
  return false;
 }
}
async function loadDashboard(){
 if(!panel)return;
 panel.classList.remove("hidden");
 panel.scrollIntoView({behavior:"smooth",block:"start"});
 say("तथ्याङ्क लोड हुँदैछ...");
 if(!isAdmin){say("Admin अनुमति जाँच हुँदैछ...");if(!await refreshAccess()){panel.classList.add("hidden");return;}}
 try{
 const [students,events]=await Promise.all([
  supabase.from("admin_student_directory").select("user_id,email,display_name,phone,created_at,last_sign_in_at").order("created_at",{ascending:false}).limit(500),
  supabase.from("app_events").select("session_id,user_id,event_type,faculty,details,created_at").order("created_at",{ascending:false}).limit(2000)
 ]);
 if(students.error||events.error){say("डेटाबेस तयार छैन वा अनुमति मिलेको छैन। Supabase SQL setup पूरा गर्नुहोस्।");return;}
 const s=students.data||[],e=events.data||[],today=new Date();today.setHours(0,0,0,0);
 const activeToday=new Set(e.filter(x=>new Date(x.created_at)>=today).map(x=>x.session_id)).size;
 const activeAll=new Set(e.map(x=>x.session_id)).size;
 const counts={};e.forEach(x=>counts[x.faculty]=(counts[x.faculty]||0)+1);
 const mocks=e.filter(x=>x.event_type==="mock_completed").length;
 $("adminTotalStudents").textContent=s.length;$("adminActiveToday").textContent=activeToday;$("adminActiveAll").textContent=activeAll;$("adminMockCount").textContent=mocks;
 $("adminFacultyStats").innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<div class="admin-stat-row"><b>'+k.replace(/[&<>"]/g,"")+'</b><span>'+v+' गतिविधि</span></div>').join("")||"<p>अहिलेसम्म गतिविधि छैन।</p>";
 $("adminRecentEvents").innerHTML=e.slice(0,40).map(x=>'<tr><td>'+new Date(x.created_at).toLocaleString("ne-NP")+'</td><td>'+String(x.event_type).replace(/[&<>"]/g,"")+'</td><td>'+String(x.faculty).replace(/[&<>"]/g,"")+'</td><td>'+(x.user_id?"Login":"Guest")+'</td></tr>').join("")||'<tr><td colspan="4">रेकर्ड छैन।</td></tr>';
 $("adminStudentRows").innerHTML=s.map(x=>'<tr><td>'+String(x.display_name||"—").replace(/[&<>"]/g,"")+'</td><td>'+String(x.email||"").replace(/[&<>"]/g,"")+'</td><td>'+String(x.phone||"—").replace(/[&<>"]/g,"")+'</td><td>'+new Date(x.created_at).toLocaleDateString("ne-NP")+'</td></tr>').join("")||'<tr><td colspan="4">अहिलेसम्म विद्यार्थी Account छैन।</td></tr>';
 say("अन्तिम अपडेट: "+new Date().toLocaleString("ne-NP")+" • हालका २,००० गतिविधि सम्म");
 }catch(error){console.error("Dashboard load failed:",error);say("Dashboard लोड हुन सकेन। Internet जाँच गरी Refresh थिच्नुहोस्।");}
}
if(openBtn){
 openBtn.onclick=async event=>{
  event.preventDefault();
  panel?.classList.add("hidden");
  say("Admin अनुमति जाँच हुँदैछ...");
  if(await refreshAccess())await loadDashboard();
  else {panel?.classList.add("hidden");say("यो Email लाई Admin अनुमति दिइएको छैन।");}
 };
}
$("adminRefresh")?.addEventListener("click",loadDashboard);
$("adminClose")?.addEventListener("click",()=>panel?.classList.add("hidden"));
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.matches(".track-card[data-tab]"))track("faculty_open",b.dataset.tab);
 else if(b.matches("[data-go]"))track("section_open",b.dataset.go);
 else if(b.matches("[data-ha]"))track("ha_"+b.dataset.ha,"ha");
 else if(b.matches("[data-nhpc],[data-dha],[data-mlt],[data-oph],[data-pt],[data-rad],[data-ott],[data-rt],[data-op],[data-dm],[data-oa],[data-dph],[data-dr],[data-dp],[data-de],[data-fn],[data-ec]"))track("study_action",currentFaculty(),{action:b.dataset});
},true);
window.addEventListener("dhpn:mock-history-updated",()=>{const rows=JSON.parse(localStorage.getItem("dhpn-mock-history")||"[]");const r=rows.at(-1);if(r)track("mock_completed",currentFaculty(),{module:r.module,score:r.score,total:r.total,percent:r.percent})});
window.addEventListener("dhpn-auth-changed",refreshAccess);
supabase.auth.onAuthStateChange(()=>setTimeout(refreshAccess,0));
refreshAccess();
track("app_visit");
