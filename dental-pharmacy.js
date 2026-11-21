/* Dental Pharmacy — secure Supabase content module */
(() => {
  const root = document.getElementById("dentalPharmacyView");
  if (!root) return;
  root.innerHTML = `
    <button class="module-back" type="button" data-back-subjects>← सबै विषयहरूमा फर्कनुहोस्</button>
    <div class="section-head"><div><p class="eyebrow">MODULE 07 • BILINGUAL LEARNING</p><h2>Dental Pharmacy</h2></div><span class="pill">Secure content</span></div>
    <p class="muted">Basic pharmacology, analgesics, antibiotics, local anaesthetics, antiseptics र medicine safety।</p>
    <div id="dpSecureStatus" class="notice">Dental Pharmacy सामग्री सुरक्षित रूपमा लोड हुँदैछ...</div>
    <div id="dpSecureApp" class="hidden">
      <div class="feature-grid module-actions">
        <button class="feature-card" data-dp="notes"><span class="feature-icon">📘</span><b>Study Notes</b><small id="dpNotesCount">Notes</small></button>
        <button class="feature-card" data-dp="practice"><span class="feature-icon">📝</span><b>MCQ Practice</b><small id="dpPracticeCount">Practice questions</small></button>
        <button class="feature-card" data-dp="mock"><span class="feature-icon">⏱️</span><b>Mock Test</b><small id="dpMockCount">Timed test</small></button>
      </div>
      <div class="toolbar"><label for="dpLanguage">Question language</label><select id="dpLanguage"><option value="both">English + नेपाली</option><option value="en">English only</option><option value="ne">नेपाली मात्र</option></select></div>
      <div id="dpNotes" class="op-panel hidden"><h2>Dental Pharmacy Notes</h2><div id="dpNotesList" class="notes-list"></div></div>
      <div id="dpPractice" class="op-panel hidden"><div class="section-head"><h2>MCQ Practice</h2><span class="pill" id="dpCount"></span></div><div id="dpQuestion"></div></div>
      <div id="dpMock" class="op-panel hidden"><h2>Dental Pharmacy Mock Test</h2><p class="muted" id="dpMockIntroText"></p><div id="dpMockIntro" class="notice"><p>सबै प्रश्नको उत्तर दिएपछि वा समय सकिएपछि नतिजा देखिनेछ।</p><button class="primary" id="dpStart">Start Mock Test</button></div><div id="dpMockArea"></div></div>
    </div>
    <p class="disclaimer">यो स्वतन्त्र शैक्षिक अभ्यास सामग्री हो; आधिकारिक NHPC प्रश्नपत्र वा prescribing guide होइन। औषधिको मात्रा, छनोट र प्रयोगमा हालको राष्ट्रिय guideline तथा अधिकृत prescriber को निर्देशन पालना गर्नुहोस्।</p>`;
  const status = document.getElementById("dpSecureStatus");
  const app = document.getElementById("dpSecureApp");
  let questions=[], practiceQuestions=[], mockBankQuestions=[], notes=[];
  let pi=0, answers={}, mock=[], ma={}, mi=0, timer=null, remaining=0;

  function statusMessage(message, kind="info") {
    status.textContent=message;
    status.dataset.kind=kind;
    status.classList.remove("hidden");
    app.classList.add("hidden");
  }
  function shuffledQuestion(row) {
    const q=[row.question,row.translation,[...row.options],Number(row.correctIndex),row.explanation||"",row.explanationNe||""];
    const pairs=q[2].map((option,index)=>({option,index}));
    for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]];}
    q[2]=pairs.map(x=>x.option);
    q[3]=pairs.findIndex(x=>x.index===q[3]);
    return q;
  }
  function convertRows(rows) {
    notes=rows.filter(x=>x.content_type==="note").map(x=>x.content_data);
    practiceQuestions=rows.filter(x=>x.content_type==="mcq").sort((a,b)=>a.display_order-b.display_order).map(x=>shuffledQuestion(x.content_data));
    mockBankQuestions=rows.filter(x=>x.content_type==="mock").sort((a,b)=>a.display_order-b.display_order).map(x=>shuffledQuestion(x.content_data));
  }
  function showApp() {
    status.classList.add("hidden"); app.classList.remove("hidden");
    document.getElementById("dpNotesCount").textContent=notes.length+" वटा विषय";
    document.getElementById("dpPracticeCount").textContent=practiceQuestions.length+" अभ्यास प्रश्न";
    document.getElementById("dpMockCount").textContent=mockBankQuestions.length+" प्रश्न • "+mockBankQuestions.length+" मिनेट";
    document.getElementById("dpMockIntroText").textContent=mockBankQuestions.length+" प्रश्न • "+mockBankQuestions.length+" मिनेट • प्रत्येक प्रश्नको १ अंक";
    document.getElementById("dpNotesList").innerHTML=notes.map(n=>`<article class="note"><h3>${n.title}</h3><p>${n.english}</p><p class="np">${n.nepali}</p></article>`).join("");
    root.querySelectorAll("[data-dp]").forEach(b=>b.addEventListener("click",()=>{panel(b.dataset.dp);if(b.dataset.dp==="practice")renderPractice();}));
    document.getElementById("dpLanguage").addEventListener("change",()=>{if(!document.getElementById("dpPractice").classList.contains("hidden"))renderPractice();if(!document.getElementById("dpMock").classList.contains("hidden")&&mock.length)renderMock();});
    document.getElementById("dpStart").addEventListener("click",startMock);
  }
  function panel(name){root.querySelectorAll(".op-panel").forEach(x=>x.classList.add("hidden"));document.getElementById("dp"+name[0].toUpperCase()+name.slice(1)).classList.remove("hidden");}
  function bilingual(q){const mode=document.getElementById("dpLanguage").value;return `${mode==="ne"?"":`<h3>${q[0]}</h3>`}${mode==="en"?"":`<p class="translation">${q[1]}</p>`}`;}
  function renderPractice(){
    if(!practiceQuestions.length){document.getElementById("dpQuestion").textContent="यस Membership मा MCQ उपलब्ध छैन।";return;}
    const q=practiceQuestions[pi], chosen=answers[pi], area=document.getElementById("dpQuestion");
    document.getElementById("dpCount").textContent=`${pi+1} / ${practiceQuestions.length}`;
    area.innerHTML=`<article class="question"><div class="qtop"><span>DENTAL PHARMACY • MCQ ${pi+1}</span><span>${chosen===undefined?"Not answered":"Answered"}</span></div>${bilingual(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${chosen!==undefined&&i===q[3]?"correct":chosen===i?"wrong":""}" data-dpa="${i}" ${chosen!==undefined?"disabled":""}>${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>${chosen!==undefined?`<div class="feedback ${chosen===q[3]?"good":"bad"}"><b>${chosen===q[3]?"Correct!":"Correct answer: "+q[2][q[3]]}</b><br>${q[4]}<br><br>${q[5]}</div>`:""}<div class="nextrow"><button class="smallbtn" id="dpPrev" ${pi===0?"disabled":""}>Previous</button><button class="smallbtn" id="dpNext">${pi===practiceQuestions.length-1?"Restart":"Next question"}</button></div></article>`;
    area.querySelectorAll("[data-dpa]").forEach(b=>b.addEventListener("click",()=>{if(answers[pi]!==undefined)return;answers[pi]=Number(b.dataset.dpa);window.DHPNProgress?.recordMCQ("Dental Pharmacy",practiceQuestions[pi],answers[pi]);renderPractice();}));
    document.getElementById("dpPrev").addEventListener("click",()=>{pi=Math.max(0,pi-1);renderPractice();});
    document.getElementById("dpNext").addEventListener("click",()=>{if(pi===practiceQuestions.length-1){pi=0;answers={};}else pi++;renderPractice();});
  }
  function startMock(){
    clearInterval(timer);mock=mockBankQuestions.map(q=>[...q]);for(let i=mock.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mock[i],mock[j]]=[mock[j],mock[i]];}
    ma={};mi=0;remaining=mock.length*60;
    document.getElementById("dpMockIntro").classList.add("hidden");renderMock();
    timer=setInterval(()=>{remaining--;const t=document.getElementById("dpTimer");if(t)t.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}`;if(remaining<=0)finish();},1000);
  }
  function renderMock(){
    if(mi>=mock.length){finish();return;}
    const q=mock[mi],area=document.getElementById("dpMockArea"),mode=document.getElementById("dpLanguage").value;
    area.innerHTML=`<div class="qtop"><span>QUESTION ${mi+1} OF ${mock.length}</span><span class="timer" id="dpTimer">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}</span></div><article class="question">${bilingual(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${ma[mi]!==undefined&&i===q[3]?"correct":ma[mi]===i&&i!==q[3]?"wrong":""}" data-dpm="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div><div class="nextrow"><span class="muted">Choose one answer</span><button class="smallbtn" id="dpMockNext">${mi===mock.length-1?"Submit test":"Next"}</button></div></article>`;
    area.querySelectorAll("[data-dpm]").forEach(b=>b.addEventListener("click",()=>{ma[mi]=Number(b.dataset.dpm);area.querySelectorAll("[data-dpm]").forEach(x=>{x.classList.toggle("correct",Number(x.dataset.dpm)===q[3]);x.classList.toggle("wrong",Number(x.dataset.dpm)===ma[mi]&&ma[mi]!==q[3])});}));
    document.getElementById("dpMockNext").addEventListener("click",()=>{mi++;if(mi>=mock.length)finish();else renderMock();});
  }
  function finish(){
    clearInterval(timer);if(!mock.length)return;
    const score=mock.reduce((s,q,i)=>s+(ma[i]===q[3]?1:0),0);
    window.DHPNProgress?.recordMock("Dental Pharmacy",score,mock.length);
    const area=document.getElementById("dpMockArea");
    area.innerHTML=`<div class="result"><p>MOCK TEST COMPLETED</p><strong>${score}/${mock.length}</strong><b>${Math.round(score/mock.length*100)}%</b><p>${score>=Math.ceil(mock.length*.8)?"Excellent effort!":score>=Math.ceil(mock.length*.5)?"Good attempt. Review the notes.":"Keep practising and revise the notes."}</p><button class="primary" id="dpReview">Review answers</button> <button class="secondary" id="dpAgain">Try again</button></div><div id="dpReviewList"></div>`;
    document.getElementById("dpReview").addEventListener("click",()=>{document.getElementById("dpReviewList").innerHTML=mock.map((q,i)=>`<article class="note"><h3>${i+1}. ${q[0]}</h3><p>Your answer: ${ma[i]===undefined?"Not answered":q[2][ma[i]]}</p><p><b>Correct: ${q[2][q[3]]}</b></p><p>${q[4]} ${q[5]}</p></article>`).join("");});
    document.getElementById("dpAgain").addEventListener("click",()=>{document.getElementById("dpMockIntro").classList.remove("hidden");area.innerHTML="";mock=[];});
  }
  async function loadSecureContent(){
    statusMessage("Supabase बाट सुरक्षित Dental Pharmacy सामग्री लोड हुँदैछ...");
    try{
      const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      const client=createClient("https://jrivojhpdupxnpefevzm.supabase.co","sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u");
      const {data:{session},error:sessionError}=await client.auth.getSession();
      if(sessionError)throw sessionError;
      if(!session?.user){
        statusMessage("Dental Pharmacy सामग्री हेर्न पहिले Login गर्नुहोस्। तलको Login / Create Account भाग खोल्नुहोस्।","warning");
        const btn=document.createElement("button");btn.className="primary";btn.textContent="Login / Create Account";btn.addEventListener("click",()=>document.getElementById("accountPanel")?.scrollIntoView({behavior:"smooth",block:"center"}));status.appendChild(btn);
        return;
      }
      const {data,error}=await client.rpc("get_learning_content",{p_subject:"Dental Pharmacy",p_content_type:null});
      if(error)throw error;
      if(!data?.length){statusMessage("अहिले तपाईंको Membership मा Dental Pharmacy सामग्री उपलब्ध छैन। Trial वा Premium Membership जाँच गर्नुहोस्।","warning");return;}
      convertRows(data);showApp();
    }catch(error){
      console.error("Secure Dental Pharmacy:",error);
      statusMessage("सुरक्षित सामग्री लोड हुन सकेन। Login र Supabase SQL जाँच्नुहोस्। विवरण: "+(error.message||"Unknown error"),"error");
    }
  }
  loadSecureContent();
  // Re-load after sign-in without exposing the content in the public JavaScript file.
  window.addEventListener("dhpn-auth-changed",loadSecureContent);
})();