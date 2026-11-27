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
  const [students,events,progress,feedback,payments]=await Promise.all([
   supabase.from("admin_student_directory").select("user_id,email,display_name,phone,created_at",{count:"exact"}).order("created_at",{ascending:false}).limit(500),
   supabase.from("app_events").select("session_id,user_id,event_type,faculty,details,created_at").order("created_at",{ascending:false}).limit(2000),
   supabase.from("user_progress").select("user_id,progress_key,progress_data,updated_at").order("updated_at",{ascending:false}).limit(3000),
   supabase.from("student_feedback").select("id,user_id,category,message,status,admin_reply,replied_at,created_at").order("created_at",{ascending:false}).limit(500),
   supabase.from("manual_payment_requests").select("id,user_id,plan_code,amount_paisa,transaction_reference,payer_name,payer_phone,status,admin_note,created_at").order("created_at",{ascending:false}).limit(500)
  ]);
  const failure=students.error||events.error||progress.error||feedback.error||payments.error;if(failure)throw failure;
  const s=students.data||[],e=events.data||[],p=progress.data||[],byId=new Map(s.map(x=>[x.user_id,x]));
  const today=new Date();today.setHours(0,0,0,0);
  $("totalStudents").textContent=students.count??s.length;
  $("activeToday").textContent=new Set(e.filter(x=>new Date(x.created_at)>=today).map(x=>x.session_id)).size;
  $("activeAll").textContent=new Set(e.map(x=>x.session_id)).size;
  $("mockCount").textContent=e.filter(x=>x.event_type==="mock_completed").length;
  $("progressCount").textContent=p.length;
  $("studentRows").innerHTML=s.map(x=>'<tr><td>'+esc(x.display_name||"—")+'</td><td>'+esc(x.email)+'</td><td>'+esc(x.phone||"—")+'</td><td>'+date(x.created_at)+'</td></tr>').join("")||'<tr><td colspan="4">विद्यार्थी Account छैन।</td></tr>';
  $("progressRows").innerHTML=p.map(x=>{const st=byId.get(x.user_id)||{};return '<tr><td>'+esc(st.display_name||"नाम उपलब्ध छैन")+'</td><td>'+esc(st.email||"")+'</td><td>'+esc(progressLabel(x.progress_key))+'</td><td>'+esc(progressSummary(x.progress_key,x.progress_data))+'</td><td>'+date(x.updated_at)+'</td></tr>';}).join("")||'<tr><td colspan="5">Cloud Progress Sync भएको छैन।</td></tr>';
  const counts={};e.forEach(x=>counts[x.faculty||"अन्य"]=(counts[x.faculty||"अन्य"]||0)+1);
  $("facultyStats").innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<p><b>'+esc(k)+'</b> — '+v+' गतिविधि</p>').join("")||"अहिलेसम्म गतिविधि छैन।";
  const facultyVisits=new Map();
  e.filter(x=>x.user_id&&x.event_type==="faculty_open").forEach(x=>{
   const key=x.user_id+"::"+(x.faculty||"unknown");
   const item=facultyVisits.get(key)||{user_id:x.user_id,faculty:x.faculty||"—",opens:0,last:x.created_at};
   item.opens++;if(new Date(x.created_at)>new Date(item.last))item.last=x.created_at;
   facultyVisits.set(key,item);
  });
  const visitRows=[...facultyVisits.values()].sort((a,b)=>new Date(b.last)-new Date(a.last));
  $("facultyStudentRows").innerHTML=visitRows.map(x=>{const st=byId.get(x.user_id)||{};return '<tr><td>'+esc(st.display_name||"नाम उपलब्ध छैन")+'</td><td>'+esc(st.email||"")+'</td><td>'+esc(st.phone||"—")+'</td><td>'+esc(x.faculty)+'</td><td>'+x.opens+'</td><td>'+date(x.last)+'</td></tr>';}).join("")||'<tr><td colspan="6">अहिलेसम्म Login भएको विद्यार्थीको Faculty खोल्ने गतिविधि छैन।</td></tr>';
  const interestMap=new Map();
  const sectionNames={notes:"Study Notes",practice:"MCQ Practice",mock:"Mock Test",home:"Home"};
  e.filter(x=>x.user_id&&["faculty_open","subject_open","section_open","learning_section_open","study_action","topic_activity","mock_completed"].includes(x.event_type)).forEach(x=>{
   const d=x.details&&typeof x.details==="object"?x.details:{};
   const action=d.action&&typeof d.action==="object"?d.action:{};
   let interest=d.subject||d.topic||d.module||"";
   if(!interest&&x.event_type==="learning_section_open")interest=sectionNames[d.section]||d.section||"";
   if(!interest&&x.event_type==="study_action")interest=Object.values(action).find(v=>typeof v==="string"&&v.trim())||"";
   if(!interest)interest=x.faculty||"अन्य";
   interest=String(interest).slice(0,100);
   const key=x.user_id+"::"+interest;
   const item=interestMap.get(key)||{user_id:x.user_id,interest,count:0,types:new Set(),last:x.created_at};
   item.count++;item.types.add(x.event_type);if(new Date(x.created_at)>new Date(item.last))item.last=x.created_at;
   interestMap.set(key,item);
  });
  const interestRows=[...interestMap.values()].sort((a,b)=>b.count-a.count||new Date(b.last)-new Date(a.last)).slice(0,500);
  $("studentInterestRows").innerHTML=interestRows.map(x=>{const st=byId.get(x.user_id)||{};return '<tr><td>'+esc(st.display_name||"नाम उपलब्ध छैन")+'</td><td>'+esc(st.email||"")+'</td><td>'+esc(x.interest)+'</td><td>'+x.count+'</td><td>'+esc([...x.types].join(", "))+'</td><td>'+date(x.last)+'</td></tr>';}).join("")||'<tr><td colspan="6">अहिलेसम्म रुचि अनुमान गर्न पर्याप्त गतिविधि छैन।</td></tr>';

  const paymentRows=payments.data||[];
  const planNames={premium_30:"१ महिना",premium_90:"३ महिना",premium_180:"६ महिना",premium_365:"१ वर्ष"};
  $("paymentRequestRows").innerHTML=paymentRows.map(x=>'<tr><td>'+date(x.created_at)+'</td><td>'+esc(x.user_id)+'</td><td>'+esc(planNames[x.plan_code]||x.plan_code)+'</td><td>रु. '+(Number(x.amount_paisa||0)/100).toLocaleString("en-IN")+'</td><td>'+esc(x.transaction_reference)+'</td><td>'+esc(x.payer_name||"—")+' / '+esc(x.payer_phone||"—")+'</td><td>'+esc(x.status==="approved"?"स्वीकृत":x.status==="rejected"?"अस्वीकृत":"Pending")+'</td><td>'+(x.status==="pending"?'<button type="button" data-payment-approve="'+esc(x.id)+'">Approve</button> <button type="button" data-payment-reject="'+esc(x.id)+'">Reject</button>':'—')+'</td></tr>').join("")||'<tr><td colspan="8">अहिलेसम्म Payment Request आएको छैन।</td></tr>';
  const feedbackRows=feedback.data||[];
  $("feedbackRows").innerHTML=feedbackRows.map(x=>{const st=byId.get(x.user_id)||{};return '<tr><td>'+date(x.created_at)+'</td><td>'+esc(st.display_name||"नाम उपलब्ध छैन")+'</td><td>'+esc(st.email||"")+'</td><td>'+esc(x.category)+'</td><td style="white-space:pre-wrap;min-width:220px">'+esc(x.message)+'</td><td><select data-feedback-status="'+esc(x.id)+'"><option value="new" '+(x.status==="new"?"selected":"")+' >नयाँ</option><option value="reviewed" '+(x.status==="reviewed"?"selected":"")+' >हेरिएको</option><option value="resolved" '+(x.status==="resolved"?"selected":"")+' >समाधान</option></select><textarea data-feedback-reply="'+esc(x.id)+'" rows="3" maxlength="2000" placeholder="विद्यार्थीलाई जवाफ लेख्नुहोस्..." style="display:block;min-width:220px;width:100%;margin:6px 0;padding:8px">'+esc(x.admin_reply||"")+'</textarea><button type="button" data-feedback-save="'+esc(x.id)+'">स्थिति र जवाफ सुरक्षित गर्नुहोस्</button></td></tr>';}).join("")||'<tr><td colspan="6">अहिलेसम्म Feedback आएको छैन।</td></tr>';

  $("eventRows").innerHTML=e.slice(0,50).map(x=>{const st=byId.get(x.user_id)||{};return '<tr><td>'+date(x.created_at)+'</td><td>'+esc(st.display_name||(x.user_id?"विद्यार्थी नाम उपलब्ध छैन":"Guest"))+'</td><td>'+esc(x.event_type)+'</td><td>'+esc(x.faculty||"—")+'</td></tr>';}).join("")||'<tr><td colspan="4">रेकर्ड छैन।</td></tr>';
  $("dashboardStatus").textContent="अन्तिम अपडेट: "+date(new Date())+" • "+p.length+" Progress records (अधिकतम ३,०००)";
 }catch(error){console.error("Admin portal data error",error);$("dashboardStatus").textContent="डेटा लोड हुन सकेन: "+(error.message||"Database policy/schema जाँच्नुहोस्।");}
}
$("adminLoginForm").addEventListener("submit",async e=>{
 e.preventDefault();const button=$("adminLoginButton");button.disabled=true;say("Login र Admin अनुमति जाँच हुँदैछ...");
 try{const {data,error}=await supabase.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});if(error)throw error;await verifyAdmin(data.user);say("Admin Login सफल भयो।");}
 catch(error){console.error(error);await supabase.auth.signOut();say(error.message||"Login सफल भएन। Email र Password जाँच्नुहोस्।");}
 finally{button.disabled=false;}
});
$("paymentRequestRows").addEventListener("click",async event=>{
 const approve=event.target.closest("[data-payment-approve]"),reject=event.target.closest("[data-payment-reject]");
 const button=approve||reject;if(!button)return;
 const id=button.dataset.paymentApprove||button.dataset.paymentReject;
 const isApprove=!!approve;
 const note=prompt(isApprove?"बैंकमा रकम आएको पुष्टि गर्नुभयो? टिप्पणी (ऐच्छिक):":"Reject गर्नुको कारण (ऐच्छिक):");
 if(note===null)return;
 if(isApprove&&!confirm("बैंक खातामा सही रकम आएको पुष्टि गर्नुभयो? पुष्टि भए मात्र Approve गर्नुहोस्।"))return;
 button.disabled=true;
 try{
  const {error}=await supabase.rpc("review_manual_payment_request",{p_request_id:id,p_approve:isApprove,p_admin_note:note||null});
  if(error)throw error;
  say(isApprove?"Payment स्वीकृत भयो र Premium सक्रिय गरियो।":"Payment Request अस्वीकृत भयो।");
  await loadDashboard();
 }catch(error){console.error(error);say("Payment निर्णय सफल भएन: "+error.message);button.disabled=false;}
});
$("feedbackRows").addEventListener("click",async event=>{const button=event.target.closest("[data-feedback-save]");if(!button)return;const id=button.dataset.feedbackSave;const row=button.closest("tr");const statusValue=row.querySelector("[data-feedback-status]").value;const reply=row.querySelector("[data-feedback-reply]").value.trim();button.disabled=true;button.textContent="सुरक्षित हुँदैछ...";try{const {error}=await supabase.from("student_feedback").update({status:statusValue,admin_reply:reply,replied_at:reply?new Date().toISOString():null}).eq("id",id);if(error)throw error;await loadDashboard();say("विद्यार्थीलाई जवाफ सुरक्षित भयो।");}catch(error){console.error(error);say("जवाफ सुरक्षित भएन: "+error.message);}finally{button.disabled=false;button.textContent="स्थिति र जवाफ सुरक्षित गर्नुहोस्";}});
$("portalRefresh").addEventListener("click",loadDashboard);
$("portalLogout").addEventListener("click",async()=>{await supabase.auth.signOut();adminUser=null;dashboard.classList.add("hidden");loginCard.classList.remove("hidden");$("adminPassword").value="";say("Logout हुनुभयो।");});
(async()=>{try{const {data,error}=await supabase.auth.getSession();if(error)throw error;if(data.session?.user)await verifyAdmin(data.session.user);}catch(error){console.warn("Existing portal session not authorized",error.message);await supabase.auth.signOut();say("Admin Login गर्नुहोस्।");}})();
