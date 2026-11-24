/* BMLT NHPC Licensing — secure Supabase content module */
(() => {
  const root = document.getElementById("bmltView");
  if (!root) return;
  root.innerHTML = `
    <button class="module-back" type="button" data-back-subjects>← सबै विषयहरूमा फर्कनुहोस्</button>
    <div class="section-head"><div><p class="eyebrow">BMLT MODULE • BILINGUAL LEARNING</p><h2>BMLT NHPC Licensing</h2></div><span class="pill">Secure content</span></div>
    <p class="muted">Medical Microbiology • Clinical Biochemistry • Hematology • Laboratory Diagnostics।</p>
    <div id="bmltSecureStatus" class="notice">BMLT NHPC Licensing सामग्री सुरक्षित रूपमा लोड हुँदैछ...</div>
    <div id="bmltSecureApp" class="hidden">
      <div class="feature-grid module-actions">
        <button class="feature-card" data-bmlt="notes"><span class="feature-icon">📘</span><b>Study Notes</b><small id="bmltNotesCount">Notes</small></button>
        <button class="feature-card" data-bmlt="practice"><span class="feature-icon">📝</span><b>MCQ Practice</b><small id="bmltPracticeCount">Practice questions</small></button>
        <button class="feature-card" data-bmlt="mock"><span class="feature-icon">⏱️</span><b>Mock Test</b><small id="bmltMockCount">Timed test</small></button>
      </div>
      <div class="toolbar"><label for="bmltLanguage">Question language</label><select id="bmltLanguage"><option value="both">English + नेपाली</option><option value="en">English only</option><option value="ne">नेपाली मात्र</option></select></div>
      <div id="bmltNotes" class="op-panel hidden"><h2>BMLT NHPC Licensing Notes</h2><div id="bmltNotesList" class="notes-list"></div></div>
      <div id="bmltPractice" class="op-panel hidden"><div class="section-head"><h2>MCQ Practice</h2><span class="pill" id="bmltCount"></span></div><div id="bmltQuestion"></div></div>
      <div id="bmltMock" class="op-panel hidden"><h2>BMLT NHPC Licensing Mock Test</h2><p class="muted" id="bmltMockIntroText"></p><div id="bmltMockIntro" class="notice"><p>सबै प्रश्नको उत्तर दिएपछि वा समय सकिएपछि नतिजा देखिनेछ।</p><button class="primary" id="bmltStart">Start Mock Test</button></div><div id="bmltMockArea"></div></div>
    </div>
    <p class="disclaimer">यो स्वतन्त्र शैक्षिक अभ्यास सामग्री हो; आधिकारिक NHPC प्रश्नपत्र वा prescribing guide होइन। औषधिको मात्रा, छनोट र प्रयोगमा हालको राष्ट्रिय guideline तथा अधिकृत prescriber को निर्देशन पालना गर्नुहोस्।</p>`;
  const status = document.getElementById("bmltSecureStatus");
  const app = document.getElementById("bmltSecureApp");
  let questions=[], practiceQuestions=[], mockBankQuestions=[], notes=[];
  let contentLoaded=false, loadPromise=null;
  let pi=0, answers={}, mock=[], ma={}, mi=0, timer=null, remaining=0;

  function statusMessage(message, kind="info") {
    status.textContent=message;
    status.dataset.kind=kind;
    status.classList.remove("hidden");
    app.classList.add("hidden");
  }
  function addRetryButton(label="फेरि Load गर्नुहोस्") {
    const button=document.createElement("button");
    button.className="primary";
    button.textContent=label;
    button.addEventListener("click",loadSecureContent);
    status.appendChild(button);
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
    document.getElementById("bmltNotesCount").textContent=notes.length+" वटा Notes";
    document.getElementById("bmltPracticeCount").textContent=practiceQuestions.length+" अभ्यास प्रश्न";
    document.getElementById("bmltMockCount").textContent=mockBankQuestions.length+" प्रश्न • "+mockBankQuestions.length+" मिनेट";
    document.getElementById("bmltMockIntroText").textContent=mockBankQuestions.length+" प्रश्न • "+mockBankQuestions.length+" मिनेट • प्रत्येक प्रश्नको १ अंक";
    document.getElementById("bmltNotesList").innerHTML=notes.map(n=>`<article class="note"><h3>${n.title}</h3><p>${n.english}</p><p class="np">${n.nepali}</p></article>`).join("");
    root.querySelectorAll("[data-bmlt]").forEach(b=>b.addEventListener("click",()=>{panel(b.dataset.bmlt);if(b.dataset.bmlt==="practice")renderPractice();}));
    document.getElementById("bmltLanguage").addEventListener("change",()=>{if(!document.getElementById("bmltPractice").classList.contains("hidden"))renderPractice();if(!document.getElementById("bmltMock").classList.contains("hidden")&&mock.length)renderMock();});
    document.getElementById("bmltStart").addEventListener("click",startMock);
  }
  function panel(name){root.querySelectorAll(".op-panel").forEach(x=>x.classList.add("hidden"));document.getElementById("bmlt"+name[0].toUpperCase()+name.slice(1)).classList.remove("hidden");}
  function bilingual(q){const mode=document.getElementById("bmltLanguage").value;return `${mode==="ne"?"":`<h3>${q[0]}</h3>`}${mode==="en"?"":`<p class="translation">${q[1]}</p>`}`;}
  function renderPractice(){
    if(!practiceQuestions.length){document.getElementById("bmltQuestion").textContent="यस Membership मा MCQ उपलब्ध छैन।";return;}
    const q=practiceQuestions[pi], chosen=answers[pi], area=document.getElementById("bmltQuestion");
    document.getElementById("bmltCount").textContent=`${pi+1} / ${practiceQuestions.length}`;
    area.innerHTML=`<article class="question"><div class="qtop"><span>BMLT NHPC • MCQ ${pi+1}</span><span>${chosen===undefined?"Not answered":"Answered"}</span></div>${bilingual(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${chosen!==undefined&&i===q[3]?"correct":chosen===i?"wrong":""}" data-bmlta="${i}" ${chosen!==undefined?"disabled":""}>${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>${chosen!==undefined?`<div class="feedback ${chosen===q[3]?"good":"bad"}"><b>${chosen===q[3]?"Correct!":"Correct answer: "+q[2][q[3]]}</b><br>${q[4]}<br><br>${q[5]}</div>`:""}<div class="nextrow"><button class="smallbtn" id="bmltPrev" ${pi===0?"disabled":""}>Previous</button><button class="smallbtn" id="bmltNext">${pi===practiceQuestions.length-1?"Restart":"Next question"}</button></div></article>`;
    area.querySelectorAll("[data-bmlta]").forEach(b=>b.addEventListener("click",()=>{if(answers[pi]!==undefined)return;answers[pi]=Number(b.dataset.bmlta);window.DHPNProgress?.recordMCQ("BMLT NHPC Licensing",practiceQuestions[pi],answers[pi]);renderPractice();}));
    document.getElementById("bmltPrev").addEventListener("click",()=>{pi=Math.max(0,pi-1);renderPractice();});
    document.getElementById("bmltNext").addEventListener("click",()=>{if(pi===practiceQuestions.length-1){pi=0;answers={};}else pi++;renderPractice();});
  }
  function startMock(){
    clearInterval(timer);mock=mockBankQuestions.map(q=>[...q]);for(let i=mock.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mock[i],mock[j]]=[mock[j],mock[i]];}
    ma={};mi=0;remaining=mock.length*60;
    document.getElementById("bmltMockIntro").classList.add("hidden");renderMock();
    timer=setInterval(()=>{remaining--;const t=document.getElementById("bmltTimer");if(t)t.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}`;if(remaining<=0)finish();},1000);
  }
  function renderMock(){
    if(mi>=mock.length){finish();return;}
    const q=mock[mi],area=document.getElementById("bmltMockArea"),mode=document.getElementById("bmltLanguage").value;
    area.innerHTML=`<div class="qtop"><span>QUESTION ${mi+1} OF ${mock.length}</span><span class="timer" id="bmltTimer">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}</span></div><article class="question">${bilingual(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${ma[mi]!==undefined&&i===q[3]?"correct":ma[mi]===i&&i!==q[3]?"wrong":""}" data-bmltm="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div><div class="nextrow"><span class="muted">Choose one answer</span><button class="smallbtn" id="bmltMockNext">${mi===mock.length-1?"Submit test":"Next"}</button></div></article>`;
    area.querySelectorAll("[data-bmltm]").forEach(b=>b.addEventListener("click",()=>{ma[mi]=Number(b.dataset.bmltm);area.querySelectorAll("[data-bmltm]").forEach(x=>{x.classList.toggle("correct",Number(x.dataset.bmltm)===q[3]);x.classList.toggle("wrong",Number(x.dataset.bmltm)===ma[mi]&&ma[mi]!==q[3])});}));
    document.getElementById("bmltMockNext").addEventListener("click",()=>{mi++;if(mi>=mock.length)finish();else renderMock();});
  }
  function finish(){
    clearInterval(timer);if(!mock.length)return;
    const score=mock.reduce((s,q,i)=>s+(ma[i]===q[3]?1:0),0);
    window.DHPNProgress?.recordMock("BMLT NHPC Licensing",score,mock.length);
    const area=document.getElementById("bmltMockArea");
    area.innerHTML=`<div class="result"><p>MOCK TEST COMPLETED</p><strong>${score}/${mock.length}</strong><b>${Math.round(score/mock.length*100)}%</b><p>${score>=Math.ceil(mock.length*.8)?"Excellent effort!":score>=Math.ceil(mock.length*.5)?"Good attempt. Review the notes.":"Keep practising and revise the notes."}</p><button class="primary" id="bmltReview">Review answers</button> <button class="secondary" id="bmltAgain">Try again</button></div><div id="bmltReviewList"></div>`;
    document.getElementById("bmltReview").addEventListener("click",()=>{document.getElementById("bmltReviewList").innerHTML=mock.map((q,i)=>`<article class="note"><h3>${i+1}. ${q[0]}</h3><p>Your answer: ${ma[i]===undefined?"Not answered":q[2][ma[i]]}</p><p><b>Correct: ${q[2][q[3]]}</b></p><p>${q[4]} ${q[5]}</p></article>`).join("");});
    document.getElementById("bmltAgain").addEventListener("click",()=>{document.getElementById("bmltMockIntro").classList.remove("hidden");area.innerHTML="";mock=[];});
  }
  async function performSecureContentLoad(){
    status.replaceChildren();
    statusMessage("BMLT सामग्री लोड हुँदैछ...");
    try{
      const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      const client=createClient(
        "https://jrivojhpdupxnpefevzm.supabase.co",
        "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u",
        {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
      );
      const {data:sessionData,error:sessionError}=await client.auth.getSession();
      if(sessionError)throw new Error("Session: "+sessionError.message);
      if(!sessionData?.session?.user){
        statusMessage("BMLT सामग्री हेर्न पहिले Login गर्नुहोस्।","warning");
        const btn=document.createElement("button");
        btn.className="primary";btn.textContent="Login / Create Account";
        btn.addEventListener("click",()=>{
          const panel=document.getElementById("accountPanel");
          panel?.classList.remove("hidden");
          panel?.scrollIntoView({behavior:"smooth",block:"center"});
        });
        status.appendChild(btn);
        return;
      }
      const {data,error}=await client.rpc("get_learning_content",{
        p_subject:"BMLT NHPC Licensing",
        p_content_type:null
      });
      if(error){
        const code=error.code?(" ["+error.code+"]"):"";
        throw new Error("Supabase RPC"+code+": "+(error.message||"Request failed"));
      }
      if(!Array.isArray(data)){
        throw new Error("RPC ले list फर्काएन। Supabase function को return type जाँच्नुहोस्।");
      }
      if(!data.length){
        statusMessage("Login सफल छ, तर RPC ले BMLT का लागि कुनै row फर्काएन। Published/access_tier र get_learning_content function जाँच आवश्यक छ।","warning");
        addRetryButton();return;
      }
      const valid=data.filter(row=>row&&["note","mcq","mock"].includes(row.content_type)&&row.content_data);
      if(!valid.length){
        const shape=Object.keys(data[0]||{}).join(", ")||"empty row";
        throw new Error("RPC data structure मिलेन। प्राप्त fields: "+shape);
      }
      convertRows(valid);
      if(!practiceQuestions.length&&!mockBankQuestions.length&&!notes.length){
        throw new Error("Rows आए, तर Note/MCQ/Mock data parse भएन।");
      }
      showApp();
      contentLoaded=true;
    }catch(error){
      console.error("BMLT secure content load failed:",error);
      statusMessage("BMLT load error: "+(error.message||String(error)),"error");
      addRetryButton();
    }
  }
  function loadSecureContent(){
    if(contentLoaded)return Promise.resolve();
    if(loadPromise)return loadPromise;
    loadPromise=performSecureContentLoad().finally(()=>{loadPromise=null;});
    return loadPromise;
  }
  loadSecureContent();
  // Ignore duplicate auth events once BMLT content has loaded.
  window.addEventListener("dhpn-auth-changed",()=>{if(!contentLoaded)loadSecureContent();});
})();