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


// AI-generated question sets: four weeks for the selected faculty, saved as drafts.
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
  const escHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  if(draftReview)draftReview.innerHTML=(data||[]).map((q,i)=>'<details style="border:1px solid #dbeafe;border-radius:10px;padding:10px;margin:8px 0"><summary><b>'+(i+1)+'. '+escHtml(q.question_en)+'</b><small> — '+escHtml(q.subject)+' / '+escHtml(q.topic)+' / '+escHtml(q.difficulty)+'</small></summary><p>A. '+escHtml(q.option_a)+'<br>B. '+escHtml(q.option_b)+'<br>C. '+escHtml(q.option_c)+'<br>D. '+escHtml(q.option_d)+'</p><p><b>Correct:</b> '+escHtml(q.correct_option)+' | <b>Explanation:</b> '+escHtml(q.explanation_en)+'</p><small>'+escHtml(q.source_note)+'</small></details>').join("")||"यस Faculty मा Draft प्रश्न छैन।";
  aiSay((data||[]).length+" वटा Draft प्रश्न देखाइयो। सबै प्रश्न जाँचेर मात्र Approve गर्नुहोस्।");
}
$("loadQuestionDraftsBtn")?.addEventListener("click",loadQuestionDrafts);
$("generateFacultyQuestionsBtn")?.addEventListener("click",async()=>{
  if(!await adminCheck())return;
  const code=$("questionFaculty").value;
  const f=faculties.find(x=>x.faculty_code===code);
  if(!f){aiSay("पहिले Faculty छान्नुहोस्।");return;}
  const count=Number(f.exam_question_count||50);
  if(!confirm(f.faculty_name+" का Week 1–4 का लागि प्रत्येक हप्ता "+count+" प्रश्न (जम्मा "+(count*4)+") AI बाट Draft बनाउने? AI usage cost लाग्न सक्छ।"))return;
  $("generateFacultyQuestionsBtn").disabled=true;
  try{
    for(let week=1;week<=4;week++){
      aiSay(f.faculty_code+" — Week "+week+"/4 का "+count+" प्रश्न तयार हुँदैछन्...");
      const {data,error}=await sb.functions.invoke("admin-generate-exam-questions",{body:{faculty_code:code,week_number:week,count,subject:"Core syllabus topics"}});
      if(error||data?.error)throw new Error(data?.error||error?.message||"AI generation failed");
      aiSay("Week "+week+" पूरा: "+data.generated+" Draft प्रश्न सुरक्षित।");
    }
    aiSay("सम्पन्न! "+f.faculty_name+" का चार हप्ताका Draft प्रश्न तयार भए। अब Load Draft Questions गरेर review गर्नुहोस्।");
    await loadQuestionDrafts();
  }catch(e){aiSay("Generation रोकियो: "+(e.message||"त्रुटि")+". पहिले बनेका Draft सुरक्षित छन्; फेरि चलाउँदा दोहोरिन सक्छन्।");}
  finally{$("generateFacultyQuestionsBtn").disabled=false;}
});
$("approveFacultyDraftsBtn")?.addEventListener("click",async()=>{
  if(!await adminCheck())return;
  const code=$("questionFaculty").value;
  if(!code){aiSay("Faculty छान्नुहोस्।");return;}
  if(!confirm(code+" का सबै Draft प्रश्न Approved गर्ने? पहिले सबै Draft review गरेको निश्चित गर्नुहोस्।"))return;
  const {data,error}=await sb.from("live_exam_question_bank").update({status:"approved",reviewed_by:(await sb.auth.getUser()).data.user.id,reviewed_at:new Date().toISOString()}).eq("faculty_code",code).eq("status","draft").select("question_id");
  if(error){aiSay("Approve गर्न सकेन: "+error.message);return;}
  aiSay((data||[]).length+" प्रश्न Approved भए। अब चार हप्ताका exams Schedule गर्न सकिन्छ।");
  await loadQuestionDrafts();
});
