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
    const guideHost=document.getElementById("dpNotesList");
    if(window.DHPNStudyGuide){
      guideHost.innerHTML=window.DHPNStudyGuide.render({
        title:"Dental Pharmacy • दन्त औषधि विज्ञान",
        notes:notes.map(n=>({title:n.title,en:n.english,ne:n.nepali})),
        points:[
          {title:"Prescription safety",en:"Check patient, allergies, medicine, strength, route, frequency, duration and prescriber instructions.",ne:"बिरामी, एलर्जी, औषधि, शक्ति, मार्ग, आवृत्ति, अवधि र prescriber निर्देशन जाँच्नुहोस्।"},
          {title:"Dose is patient-specific",en:"Never guess a dose. Verify current guideline, age, weight, organ function and authorized prescription.",ne:"मात्रा अनुमान नगर्नुहोस्; guideline, उमेर, तौल, अंगको अवस्था र prescription पुष्टि गर्नुहोस्।"},
          {title:"Antibiotic stewardship",en:"Antibiotics are not needed for every dental pain; use only when clinically indicated and prescribed.",ne:"हरेक दाँत दुखाइमा antibiotic चाहिँदैन; indication र prescription अनुसार मात्र।"},
          {title:"Severe adverse reaction",en:"Breathing difficulty, facial swelling or collapse needs immediate emergency response.",ne:"सास फेर्न गाह्रो, अनुहार सुन्निने वा बेहोस हुनेमा तुरुन्त emergency सहायता।"},
          {title:"Storage and expiry",en:"Follow label storage, secure medicines, check expiry and rotate stock.",ne:"लेबलअनुसार भण्डारण, सुरक्षित राख्ने, expiry जाँच्ने र stock rotation गर्ने।"}
        ],
        tricks:[
          {title:"7 rights",en:"Right patient, medicine, dose, route, time, documentation and reason.",ne:"सही बिरामी, औषधि, मात्रा, मार्ग, समय, अभिलेख र कारण।"},
          {title:"ADR",en:"Recognize, respond, report and record adverse drug reactions.",ne:"औषधिको प्रतिकूल प्रतिक्रिया पहिचान, सहायता, रिपोर्ट र अभिलेख।"},
          {title:"FEFO",en:"First Expiry, First Out: use earliest-expiring stock first.",ne:"पहिले म्याद सकिने औषधि पहिले प्रयोग/वितरण।"}
        ],
        diagrams:[
          {title:"Safe medication workflow",en:"A safety sequence",html:'<svg viewBox="0 0 300 150" role="img" aria-label="Medication workflow"><g font-family="Arial" font-size="12" text-anchor="middle" fill="#17435b"><rect x="55" y="5" width="190" height="28" rx="7" fill="#e0f2fe" stroke="#0284c7"/><text x="150" y="23">Verify patient + allergy</text><path d="M150 33v15" stroke="#0284c7" stroke-width="2"/><rect x="55" y="48" width="190" height="28" rx="7" fill="#dcfce7" stroke="#16a34a"/><text x="150" y="66">Check prescription</text><path d="M150 76v15" stroke="#0284c7" stroke-width="2"/><rect x="55" y="91" width="190" height="28" rx="7" fill="#fef3c7" stroke="#d97706"/><text x="150" y="109">Prepare + double-check</text><text x="150" y="140">Document and monitor</text></g></svg>'},
          {title:"Therapeutic and adverse effects",en:"Observe the intended response and any unwanted effect.",html:'<svg viewBox="0 0 300 100" role="img" aria-label="Drug effects"><g font-family="Arial" font-size="12" text-anchor="middle" fill="#17435b"><rect x="85" y="5" width="130" height="25" rx="7" fill="#e0f2fe" stroke="#0284c7"/><text x="150" y="22">Medicine</text><path d="M150 30v15H75v12M150 45h75v12" stroke="#0284c7" fill="none" stroke-width="2"/><rect x="5" y="57" width="140" height="30" rx="7" fill="#dcfce7" stroke="#16a34a"/><text x="75" y="76">Desired effect</text><rect x="155" y="57" width="140" height="30" rx="7" fill="#fee2e2" stroke="#dc2626"/><text x="225" y="76">Adverse effect</text></g></svg>'}
        ],
        examples:[
          {title:"Before dental treatment",en:"Ask about allergies and current medicines; verify the dentist’s prescription before preparing medicine.",ne:"एलर्जी र हालका औषधि सोध्नुहोस्; औषधि तयार गर्नुअघि dentist को prescription पुष्टि गर्नुहोस्।"},
          {title:"Possible severe allergy",en:"Breathing difficulty or rapidly increasing swelling after medicine requires immediate emergency response.",ne:"औषधिपछि सास फेर्न गाह्रो वा छिटो बढ्दो सुन्निनेमा तुरुन्त emergency response।"},
          {title:"Stock check",en:"Separate expired or damaged products, document them and follow the approved disposal policy.",ne:"म्याद सकिएका/बिग्रिएका औषधि छुट्याई अभिलेख र approved disposal policy पालना।"}
        ]
      });
    }else{
      guideHost.innerHTML=notes.map(n=>`<article class="note"><h3>${n.title}</h3><p>${n.english}</p><p class="np">${n.nepali}</p></article>`).join("");
    }
    root.querySelectorAll("[data-dp]").forEach(b=>b.addEventListener("click",()=>{panel(b.dataset.dp);if(b.dataset.dp==="practice")renderPractice();}));
    document.getElementById("dpLanguage").addEventListener("change",()=>{if(!document.getElementById("dpPractice").classList.contains("hidden"))renderPractice();if(!document.getElementById("dpMock").classList.contains("hidden")&&mock.length)renderMock();});
    document.getElementById("dpStart").addEventListener("click",startMock);
  }
  function panel(name){root.querySelectorAll(".op-panel").forEach(x=>x.classList.add("hidden"));const target=document.getElementById("dp"+name[0].toUpperCase()+name.slice(1));target.classList.remove("hidden");target.style.scrollMarginTop="90px";target.scrollIntoView({behavior:"smooth",block:"start"});}
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
      const {data,error}=await client.rpc("get_learning_content_by_faculty",{p_faculty:"Dental Hygiene",p_subject:"Dental Pharmacy",p_content_type:null});
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