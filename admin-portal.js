import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const supabase=createClient("https://jrivojhpdupxnpefevzm.supabase.co","sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u");
const $=id=>document.getElementById(id);
const loginCard=$("loginCard"),dashboard=$("dashboard"),status=$("portalStatus");
let adminUser=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>v?new Date(v).toLocaleString("ne-NP"):"—";
function say(message){if(status)status.textContent=message;}
function progressLabel(key){return ({"dhpn-progress":"समग्र अभ्यास Progress","dhpn-mock-history":"Mock Test History","dhpn-mcq-history":"MCQ History","dhpn-student-profile":"विद्यार्थी Profile","dhpn-study-goal":"Study Goal","dhpn-nhpc-bookmarks":"Bookmarks"})[key]||key;}
function progressSummary(key,data){
 if(key==="dhpn-progress"&&data&&typeof data==="object")return "Attempted: "+(Number(data.attempted)||0)+" • Correct: "+(Number(data.correct)||0)+" • Best: "+(Number(data.best)||0);
 if(Array.isArray(data))return data.length+" वटा रेकर्ड";
 let s=typeof data==="string"?data:JSON.stringify(data??"");return s.length>220?s.slice(0,220)+"…":s;
}
async function verifyAdmin(user){
 const {data,error}=await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
 if(error)throw error;
 if(!data)throw new Error("यो Account लाई Admin अनुमति दिइएको छैन।");
 adminUser=user;
 loginCard.classList.add("hidden");dashboard.classList.remove("hidden");
 $("adminIdentity").textContent="Login: "+(user.email||"Admin");
 await loadDashboard();
}
async function loadDashboard(){
 $("dashboardStatus").textContent="तथ्याङ्क लोड हुँदैछ...";
 try{
  const [students,events,progress]=await Promise.all([
   supabase.from("admin_student_directory").select("user_id,email,display_name,phone,created_at").order("created_at",{ascending:false}).limit(500),
   supabase.from("app_events").select("session_id,user_id,event_type,faculty,created_at").order("created_at",{ascending:false}).limit(2000),
   supabase.from("user_progress").select("user_id,progress_key,progress_data,updated_at").order("updated_at",{ascending:false}).limit(3000)
  ]);
  const failure=students.error||events.error||progress.error;if(failure)throw failure;
  const s=students.data||[],e=events.data||[],p=progress.data||[],byId=new Map(s.map(x=>[x.user_id,x]));
  const today=new Date();today.setHours(0,0,0,0);
  $("totalStudents").textContent=s.length;
  $("activeToday").textContent=new Set(e.filter(x=>new Date(x.created_at)>=today).map(x=>x.session_id)).size;
  $("activeAll").textContent=new Set(e.map(x=>x.session_id)).size;
  $("mockCount").textContent=e.filter(x=>x.event_type==="mock_completed").length;
  $("progressCount").textContent=p.length;
  $("studentRows").innerHTML=s.map(x=>'<tr><td>'+esc(x.display_name||"—")+'</td><td>'+esc(x.email)+'</td><td>'+esc(x.phone||"—")+'</td><td>'+date(x.created_at)+'</td></tr>').join("")||'<tr><td colspan="4">विद्यार्थी Account छैन।</td></tr>';
  $("progressRows").innerHTML=p.map(x=>{const st=byId.get(x.user_id)||{};return '<tr><td>'+esc(st.display_name||"नाम उपलब्ध छैन")+'</td><td>'+esc(st.email||"")+'</td><td>'+esc(progressLabel(x.progress_key))+'</td><td>'+esc(progressSummary(x.progress_key,x.progress_data))+'</td><td>'+date(x.updated_at)+'</td></tr>';}).join("")||'<tr><td colspan="5">Cloud Progress Sync भएको छैन।</td></tr>';
  const counts={};e.forEach(x=>counts[x.faculty]=(counts[x.faculty]||0)+1);
  $("facultyStats").innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<p><b>'+esc(k)+'</b> — '+v+' गतिविधि</p>').join("")||"अहिलेसम्म गतिविधि छैन।";
  $("eventRows").innerHTML=e.slice(0,50).map(x=>'<tr><td>'+date(x.created_at)+'</td><td>'+esc(x.event_type)+'</td><td>'+esc(x.faculty)+'</td><td>'+(x.user_id?"Login":"Guest")+'</td></tr>').join("")||'<tr><td colspan="4">रेकर्ड छैन।</td></tr>';
  $("dashboardStatus").textContent="अन्तिम अपडेट: "+date(new Date())+" • "+p.length+" Progress records (अधिकतम ३,०००)";
 }catch(error){console.error("Admin portal data error",error);$("dashboardStatus").textContent="डेटा लोड हुन सकेन: "+(error.message||"Database policy/schema जाँच्नुहोस्।");}
}
$("adminLoginForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=$("adminLoginButton");button.disabled=true;say("Login र Admin अनुमति जाँच हुँदैछ...");
 try{const {data,error}=await supabase.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});if(error)throw error;await verifyAdmin(data.user);say("Admin Login सफल भयो।");}
 catch(error){console.error(error);await supabase.auth.signOut();say(error.message||"Login सफल भएन। Email र Password जाँच्नुहोस्।");}
 finally{button.disabled=false;}
});
$("portalRefresh").addEventListener("click",loadDashboard);
$("portalLogout").addEventListener("click",async()=>{await supabase.auth.signOut();adminUser=null;dashboard.classList.add("hidden");loginCard.classList.remove("hidden");$("adminPassword").value="";say("Logout हुनुभयो।");});
(async()=>{try{const {data,error}=await supabase.auth.getSession();if(error)throw error;if(data.session?.user)await verifyAdmin(data.session.user);}catch(error){console.warn("Existing portal session not authorized",error.message);await supabase.auth.signOut();say("Admin Login गर्नुहोस्।");}})();
