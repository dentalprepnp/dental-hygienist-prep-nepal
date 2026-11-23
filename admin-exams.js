import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const sb=createClient("https://jrivojhpdupxnpefevzm.supabase.co","sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u");
const $=id=>document.getElementById(id),status=$("examAdminStatus");
let faculties=[],drafts=[];
const say=s=>{if(status)status.textContent=s};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function nepalNextSaturday(){const n=new Date(Date.now()+345*60000),day=n.getUTCDay(),days=(6-day+7)%7+(day===6&&n.getUTCHours()>=12?7:0),d=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()+days,18,0,0));return d.toISOString().slice(0,16)}
async function adminCheck(){const {data:{session}}=await sb.auth.getSession();if(!session){say("Admin login आवश्यक छ।");return false}const {data,error}=await sb.rpc("hlp_is_live_exam_admin");if(error||!data){say("Admin अनुमति छैन वा जाँच गर्न सकिएन।");return false}return true}
async function loadFaculty(){const {data,error}=await sb.from("live_exam_faculties").select("faculty_code,faculty_name,exam_duration_minutes,exam_question_count,exam_marks_per_question,exam_negative_marks,exam_pass_marks").eq("is_active",true).order("faculty_name");if(error){say("Faculty load error: "+error.message);return}faculties=data||[];const options='<option value="">Faculty छान्नुहोस्</option>'+faculties.map(f=>'<option value="'+esc(f.faculty_code)+'">'+esc(f.faculty_name)+' ('+esc(f.faculty_code)+')</option>').join("");["examFaculty","questionFaculty"].forEach(id=>{if($(id))$(id).innerHTML=options});if($("settingsFaculty")){$("settingsFaculty").innerHTML=faculties.map(f=>'<option value="'+esc(f.faculty_code)+'">'+esc(f.faculty_name)+' ('+esc(f.faculty_code)+')</option>').join("");fillFacultySettings()}}
async function loadDrafts(){const {data,error}=await sb.from("live_exams").select("exam_id,faculty_code,title,starts_at,week_number,question_count,status").eq("status","draft").order("starts_at");if(error){say("Draft exam load error: "+error.message);return}drafts=data||[];$("examDraftSelect").innerHTML='<option value="">Draft exam छान्नुहोस्</option>'+drafts.map(e=>'<option value="'+e.exam_id+'">'+esc(e.faculty_code)+' • Week '+e.week_number+' • '+esc(e.title)+' • '+new Date(e.starts_at).toLocaleString("ne-NP")+'</option>').join("")}
$("examDraftSelect")?.addEventListener("change",()=>{const e=drafts.find(x=>x.exam_id===$("examDraftSelect").value);$("draftInfo").textContent=e?"Faculty: "+e.faculty_code+" | प्रश्न: "+e.question_count+" | Paper Build गरेर Schedule गर्नुहोस्.":""});
$("examScheduleForm")?.addEventListener("submit",async ev=>{ev.preventDefault();if(!await adminCheck())return;const faculty=$("examFaculty").value,title=$("examTitle").value.trim(),startLocal=$("examStarts").value;if(!faculty||!startLocal){say("Faculty र exam date/time भर्नुहोस्।");return}const starts=new Date(startLocal+':00+05:45'),args={p_faculty_code:faculty,p_exam_year:starts.getFullYear(),p_exam_month:starts.getMonth()+1,p_week_number:Number($("examWeek").value),p_title:title,p_starts_at:starts.toISOString(),p_duration_minutes:Number($("examDuration").value),p_question_count:Number($("examCount").value),p_marks_per_question:Number($("examMarks").value),p_negative_marks:Number($("examNegative").value),p_pass_marks:Number($("examPass").value)};const {data,error}=await sb.rpc("hlp_admin_schedule_live_exam",args);if(error){say("Exam draft बनाउन सकेन: "+error.message);return}say("Draft exam बन्यो। अब Question Bank मा प्रश्न थप्नुहोस्। Exam ID: "+data);$("examScheduleForm").reset();$("examStarts").value=nepalNextSaturday();await loadDrafts()});
$("questionForm")?.addEventListener("submit",async ev=>{ev.preventDefault();if(!await adminCheck())return;const v=id=>$(id).value.trim(),row={faculty_code:v("questionFaculty"),subject:v("questionSubject"),topic:v("questionTopic"),difficulty:v("questionDifficulty"),question_en:v("questionEN"),question_ne:v("questionNE")||null,option_a:v("optionA"),option_b:v("optionB"),option_c:v("optionC"),option_d:v("optionD"),correct_option:v("correctOption"),explanation_en:v("explanationEN"),explanation_ne:v("explanationNE")||null,source_note:v("questionSource")||null,status:"draft"};const {error}=await sb.from("live_exam_question_bank").insert(row);if(error){say("Question save error: "+error.message);return}say("प्रश्न Draft रूपमा सुरक्षित भयो। Review गरेर मात्र Approve गर्नुहोस्।");$("questionForm").reset()});
$("buildPaperBtn")?.addEventListener("click",async()=>{if(!await adminCheck())return;const id=$("examDraftSelect").value;if(!id){say("पहिले draft exam छान्नुहोस्।");return}const {data,error}=await sb.rpc("hlp_admin_build_live_exam_paper",{p_exam_id:id});if(error){say("Paper बनाउन सकेन: "+error.message);return}say("Paper तयार भयो: "+data+" प्रश्न। अब Schedule Exam थिच्नुहोस्।")});
$("publishExamBtn")?.addEventListener("click",async()=>{if(!await adminCheck())return;const id=$("examDraftSelect").value;if(!id){say("पहिले draft exam छान्नुहोस्।");return}const {error}=await sb.rpc("hlp_admin_publish_live_exam_schedule",{p_exam_id:id});if(error){say("Schedule गर्न सकेन: "+error.message);return}say("Exam schedule भयो। विद्यार्थीले Faculty छानेर देख्न सक्छन्।");await loadDrafts()});
$("examAdminRefresh")?.addEventListener("click",async()=>{if(await adminCheck()){await loadFaculty();await loadDrafts();say("Exam Management refresh भयो।")}});
(async()=>{if(await adminCheck()){await loadFaculty();await loadDrafts();$("examStarts").value=nepalNextSaturday();say("Exam Management तयार छ। समय Nepal time (UTC+5:45) अनुसार छान्नुहोस्।")}})();
function fillFacultySettings(){const f=faculties.find(x=>x.faculty_code===$("settingsFaculty")?.value)||faculties[0];if(!f)return;$("settingsDuration").value=f.exam_duration_minutes??60;$("settingsCount").value=f.exam_question_count??50;$("settingsMarks").value=f.exam_marks_per_question??1;$("settingsNegative").value=f.exam_negative_marks??0;$("settingsPass").value=f.exam_pass_marks??25}
$("settingsFaculty")?.addEventListener("change",fillFacultySettings);
$("facultySettingsForm")?.addEventListener("submit",async ev=>{ev.preventDefault();if(!await adminCheck())return;const code=$("settingsFaculty").value;const vals={exam_duration_minutes:Number($("settingsDuration").value),exam_question_count:Number($("settingsCount").value),exam_marks_per_question:Number($("settingsMarks").value),exam_negative_marks:Number($("settingsNegative").value),exam_pass_marks:Number($("settingsPass").value)};const {error}=await sb.from("live_exam_faculties").update(vals).eq("faculty_code",code);if(error){say("Faculty exam settings save error: "+error.message);return}const f=faculties.find(x=>x.faculty_code===code);if(f)Object.assign(f,vals);say(code+" को exam format सुरक्षित भयो।")});
function currentNepalMonth(){const n=new Date(Date.now()+345*60000);return n.getUTCFullYear()+"-"+String(n.getUTCMonth()+1).padStart(2,"0")}
if($("batchMonth"))$("batchMonth").value=currentNepalMonth();
$("batchScheduleBtn")?.addEventListener("click",async()=>{if(!await adminCheck())return;const m=$("batchMonth").value;if(!m){say("Exam month छान्नुहोस्।");return}const [year,month]=m.split("-").map(Number);if(!confirm(year+"/"+month+" का लागि सबै active faculty का ४ वटा शनिबार ६ बजे exam schedule गर्ने? पहिल्यै भएका exam परिवर्तन हुँदैनन्।"))return;say("सबै faculty का exam तयार हुँदैछन्...");const {data,error}=await sb.rpc("hlp_admin_schedule_all_faculties",{p_exam_year:year,p_exam_month:month});if(error){say("Batch schedule error: "+error.message);return}const rows=data||[],ok=rows.filter(x=>x.result==="scheduled").length,failed=rows.filter(x=>x.result==="failed").length,skip=rows.filter(x=>x.result!=="scheduled"&&x.result!=="failed").length;const details=rows.filter(x=>x.result!=="scheduled").map(x=>x.faculty_code+" W"+x.week_number+": "+x.details).slice(0,12).join(" | ");say("Batch सकियो: "+ok+" exam scheduled, "+failed+" failed, "+skip+" skipped/existing."+(details?" Details: "+details:""));await loadDrafts()});


// Free bulk question import: questions are prepared offline/by ChatGPT and inserted as drafts.
const aiStatus=$("aiQuestionStatus"),draftReview=$("questionDraftReview");
const aiSay=s=>{if(aiStatus)aiStatus.textContent=s;};
async function loadQuestionDrafts(){
  if(!await adminCheck())return;
  const code=$("questionFaculty").value;
  if(!code){aiSay("पहिले Faculty छान्नुहोस्।");return;}
  const {data,error}=await sb.from("live_exam_question_bank")
    .select("question_id,subject,topic,difficulty,question_en,option_a,option_b,option_c,option_d,correct_option,explanation_en,source_note,created_at")
    .eq("faculty_code",code).eq("status","draft").order("created_at",{ascending:false}).limit(250);
  if(error){aiSay("Draft load error: "+error.message);return;}
  const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  if(draftReview)draftReview.innerHTML=(data||[]).map((q,i)=>'<details style="border:1px solid #dbeafe;border-radius:10px;padding:10px;margin:8px 0"><summary><b>'+(i+1)+'. '+e(q.question_en)+'</b><small> — '+e(q.subject)+' / '+e(q.topic)+' / '+e(q.difficulty)+'</small></summary><p>A. '+e(q.option_a)+'<br>B. '+e(q.option_b)+'<br>C. '+e(q.option_c)+'<br>D. '+e(q.option_d)+'</p><p><b>Correct:</b> '+e(q.correct_option)+' | <b>Explanation:</b> '+e(q.explanation_en)+'</p><small>'+e(q.source_note)+'</small></details>').join("")||"यस Faculty मा Draft प्रश्न छैन।";
  aiSay((data||[]).length+" वटा Draft प्रश्न देखाइयो। सबै प्रश्न जाँचेर मात्र Approve गर्नुहोस्।");
}
$("loadQuestionDraftsBtn")?.addEventListener("click",loadQuestionDrafts);
$("importQuestionDraftsBtn")?.addEventListener("click",async()=>{
  const btn=$("importQuestionDraftsBtn");
  const aiSayBoth=s=>{aiSay(s);say(s);};
  aiSayBoth("Import button चल्यो — Admin अनुमति जाँच हुँदैछ...");
  try{
    if(!await adminCheck()){aiSayBoth("Admin login/permission जाँच असफल भयो। माथिको Admin status हेर्नुहोस्।");return;}
    const code=$("questionFaculty")?.value;
    if(!code){aiSayBoth("पहिले Question Bank मा Faculty छान्नुहोस्।");return;}
    const raw=$("questionImportJSON")?.value?.trim()||"";
    if(!raw){aiSayBoth("JSON बाकस खाली छ। प्रश्नहरूको JSON paste गर्नुहोस्।");return;}
    let items;
    try{items=JSON.parse(raw);}catch(err){aiSayBoth("JSON parse error: "+err.message);return;}
    if(!Array.isArray(items)||!items.length||items.length>200){aiSayBoth("१ देखि २०० प्रश्न भएको JSON array राख्नुहोस्।");return;}
    const rows=items.map(q=>({
      faculty_code:code,subject:String(q.subject||"General").trim().slice(0,120),
      topic:String(q.topic||"").trim().slice(0,160),
      difficulty:["easy","medium","hard"].includes(String(q.difficulty).toLowerCase())?String(q.difficulty).toLowerCase():"medium",
      question_en:String(q.question_en||"").trim(),question_ne:String(q.question_ne||"").trim()||null,
      option_a:String(q.option_a||"").trim(),option_b:String(q.option_b||"").trim(),
      option_c:String(q.option_c||"").trim(),option_d:String(q.option_d||"").trim(),
      correct_option:String(q.correct_option||"").trim().toUpperCase(),
      explanation_en:String(q.explanation_en||"").trim(),explanation_ne:String(q.explanation_ne||"").trim()||null,
      source_note:"Imported by admin; pending review.",status:"draft"
    }));
    const bad=rows.findIndex(q=>!q.question_en||!q.option_a||!q.option_b||!q.option_c||!q.option_d||!["A","B","C","D"].includes(q.correct_option)||!q.explanation_en);
    if(bad>=0){aiSayBoth("प्रश्न "+(bad+1)+" मा question, चार options, सही उत्तर A-D र English explanation अनिवार्य छ। केही पनि import भएन।");return;}
    if(!confirm(code+" का "+rows.length+" प्रश्न Draft रूपमा import गर्ने?")){aiSayBoth("Import रद्द गरियो।");return;}
    btn.disabled=true;
    aiSayBoth("Supabase मा "+rows.length+" प्रश्न पठाउँदैछौँ...");
    const {error}=await sb.from("live_exam_question_bank").insert(rows);
    if(error){aiSayBoth("Import असफल: "+error.message+" ("+(error.code||"no code")+")");return;}
    $("questionImportJSON").value="";
    aiSayBoth(rows.length+" प्रश्न Draft मा सुरक्षित भए। Review गरेर मात्र Approve गर्नुहोस्।");
    await loadQuestionDrafts();
  }catch(err){
    aiSayBoth("Import मा unexpected error: "+(err?.message||String(err)));
  }finally{
    if(btn)btn.disabled=false;
  }
});
$("approveFacultyDraftsBtn")?.addEventListener("click",async()=>{
  if(!await adminCheck())return;
  const code=$("questionFaculty").value;
  if(!code){aiSay("Faculty छान्नुहोस्।");return;}
  if(!confirm(code+" का सबै Draft प्रश्न Approved गर्ने? सबै Draft जाँचिसकेको निश्चित गर्नुहोस्।"))return;
  const {data:userData}=await sb.auth.getUser();
  const {data,error}=await sb.from("live_exam_question_bank").update({status:"approved",reviewed_by:userData.user.id,reviewed_at:new Date().toISOString()}).eq("faculty_code",code).eq("status","draft").select("question_id");
  if(error){aiSay("Approve गर्न सकेन: "+error.message);return;}
  aiSay((data||[]).length+" प्रश्न Approved भए।");
  await loadQuestionDrafts();
});
