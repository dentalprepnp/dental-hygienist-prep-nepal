/* Diploma in Pharmacy and Bachelor of Pharmacy — secure bilingual learning modules */
(() => {
  const SUPABASE_URL = "https://jrivojhpdupxnpefevzm.supabase.co";
  const SUPABASE_KEY = "sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u";
  const modules = [
    { viewId:"dpharmView", subject:"Diploma in Pharmacy", short:"D.Pharm", title:"Diploma in Pharmacy", subtitle:"NPC Assistant Pharmacist Name Registration Exam • D.Pharm syllabus" },
    { viewId:"bpharmView", subject:"Bachelor of Pharmacy", short:"B.Pharm", title:"Bachelor of Pharmacy", subtitle:"NPC Pharmacist Name Registration Exam • B.Pharm syllabus" }
  ];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function init(config) {
    const root = document.getElementById(config.viewId);
    if (!root) return;
    root.innerHTML = `
      <button class="module-back" type="button" data-back-exams>← Faculty छनोटमा फर्कनुहोस्</button>
      <div class="exam-heading"><span class="track-icon">💊</span><div><p class="eyebrow">PHARMACY EDUCATION • ${config.short}</p><h2>${config.title}</h2><p class="muted">${config.subtitle}</p></div></div>
      <div class="notice"><b>सिलेबसअनुसार अध्ययन</b><p>Nepal Pharmacy Council (NPC) को Name Registration Exam syllabus मुख्य आधार हुनेछ। कलेज/विश्वविद्यालयको पाठ्यक्रमलाई आवश्यक परे पूरक स्रोतका रूपमा मात्र प्रयोग गरिनेछ। हरेक विषयमा Notes, MCQ Practice र Mock Test क्रमशः विस्तार गरिनेछ।</p><p>अहिले सुरक्षित सामग्री लोड हुँदैछ।</p></div>
      <div id="${config.short.replace(".","").toLowerCase()}Status" class="notice">Login जाँच हुँदैछ...</div>
      <div id="${config.short.replace(".","").toLowerCase()}App" class="hidden">
        <div class="feature-grid module-actions">
          <button class="feature-card" data-action="notes"><span class="feature-icon">📘</span><b>Study Notes</b><small id="notesCount">Notes</small></button>
          <button class="feature-card" data-action="practice"><span class="feature-icon">📝</span><b>MCQ Practice</b><small id="practiceCount">Questions</small></button>
          <button class="feature-card" data-action="mock"><span class="feature-icon">⏱️</span><b>Mock Test</b><small id="mockCount">Timed test</small></button>
        </div>
        <div class="toolbar"><label for="language">Question language</label><select id="language"><option value="both">English + नेपाली</option><option value="en">English only</option><option value="ne">नेपाली मात्र</option></select></div>
        <div id="notesPanel" class="op-panel hidden"><h2>Study Notes</h2><div id="notesList" class="notes-list"></div></div>
        <div id="practicePanel" class="op-panel hidden"><div class="section-head"><h2>MCQ Practice</h2><span class="pill" id="questionCount"></span></div><div id="questionArea"></div></div>
        <div id="mockPanel" class="op-panel hidden"><h2>Mock Test</h2><p class="muted" id="mockInfo"></p><div id="mockIntro" class="notice"><p>समयभित्र उत्तर दिनुहोस्। Submit गरेपछि स्कोर, नतिजा र उत्तर समीक्षा देखिनेछ।</p><button class="primary" id="startMock">Start Mock Test</button></div><div id="mockArea"></div></div>
      </div>
      <p class="disclaimer">यो स्वतन्त्र शैक्षिक अभ्यास सामग्री हो; आधिकारिक प्रश्नपत्र होइन। औषधिको प्रयोग, मात्रा र dispensing सम्बन्धी निर्णयमा लागू कानून, राष्ट्रिय guideline र अधिकृत prescriber को निर्देशन पालना गर्नुहोस्।</p>`;
    const $ = id => root.querySelector("#"+id);
    const status = $(config.short.replace(".","").toLowerCase()+"Status");
    const app = $(config.short.replace(".","").toLowerCase()+"App");
    let notes=[], practice=[], mockBank=[], answers={}, pi=0, mock=[], mockAnswers={}, mi=0, timer=null, remaining=0, client=null;
    function showStatus(message, kind="info") { status.textContent=message;status.dataset.kind=kind;status.classList.remove("hidden");app.classList.add("hidden"); }
    function panel(name) { root.querySelectorAll(".op-panel").forEach(x=>x.classList.add("hidden"));$(name+"Panel").classList.remove("hidden"); }
    function shuffled(row) {
      const q={question:row.question,translation:row.translation,options:[...(row.options||[])],correctIndex:Number(row.correctIndex),explanation:row.explanation||"",explanationNe:row.explanationNe||""};
      const pairs=q.options.map((option,index)=>({option,index}));
      for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]];}
      q.options=pairs.map(x=>x.option);q.correctIndex=pairs.findIndex(x=>x.index===q.correctIndex);return q;
    }
    function bilingual(q) { const mode=$("language").value;return (mode==="ne"?"":`<h3>${esc(q.question)}</h3>`)+(mode==="en"?"":`<p class="translation">${esc(q.translation||"")}</p>`); }
    function renderNotes() { $("notesList").innerHTML=notes.map(n=>`<article class="note"><h3>${esc(n.title)}</h3><p>${esc(n.english)}</p><p class="np">${esc(n.nepali)}</p></article>`).join("")||"<p>Notes क्रमशः थपिँदैछन्।</p>"; }
    function renderPractice() {
      if(!practice.length){$("questionArea").textContent="MCQ सामग्री थपिँदैछ।";return;}
      const q=practice[pi],chosen=answers[pi];$("questionCount").textContent=(pi+1)+" / "+practice.length;
      $("questionArea").innerHTML=`<article class="question"><div class="qtop"><span>${esc(config.short)} • MCQ ${pi+1}</span><span>${chosen===undefined?"Not answered":"Answered"}</span></div>${bilingual(q)}<div class="options">${q.options.map((o,i)=>`<button class="option ${chosen!==undefined&&i===q.correctIndex?"correct":chosen===i?"wrong":""}" data-answer="${i}" ${chosen!==undefined?"disabled":""}>${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("")}</div>${chosen!==undefined?`<div class="feedback ${chosen===q.correctIndex?"good":"bad"}"><b>${chosen===q.correctIndex?"Correct!":"Correct answer: "+esc(q.options[q.correctIndex])}</b><br>${esc(q.explanation)}<br><br>${esc(q.explanationNe)}</div>`:""}<div class="nextrow"><button class="smallbtn" id="prev" ${pi===0?"disabled":""}>Previous</button><button class="smallbtn" id="next">${pi===practice.length-1?"Restart":"Next question"}</button></div></article>`;
      $("questionArea").querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{if(answers[pi]!==undefined)return;answers[pi]=Number(b.dataset.answer);window.DHPNProgress?.recordMCQ(config.subject,q,answers[pi]);renderPractice();}));
      $("prev").addEventListener("click",()=>{pi=Math.max(0,pi-1);renderPractice();});
      $("next").addEventListener("click",()=>{if(pi===practice.length-1){pi=0;answers={};}else pi++;renderPractice();});
    }
    function finishMock() {
      clearInterval(timer);if(!mock.length)return;
      const score=mock.reduce((sum,q,i)=>sum+(mockAnswers[i]===q.correctIndex?1:0),0);
      window.DHPNProgress?.recordMock(config.subject,score,mock.length);
      $("mockArea").innerHTML=`<div class="result"><p>MOCK TEST COMPLETED</p><strong>${score}/${mock.length}</strong><b>${Math.round(score/mock.length*100)}%</b><p>${score>=Math.ceil(mock.length*.8)?"Excellent effort!":score>=Math.ceil(mock.length*.5)?"Good attempt. Revise the notes.":"Keep practising and revise the topics."}</p><button class="primary" id="review">Review answers</button> <button class="secondary" id="again">Try again</button></div><div id="reviewList"></div>`;
      $("review").addEventListener("click",()=>$("reviewList").innerHTML=mock.map((q,i)=>`<article class="note"><h3>${i+1}. ${esc(q.question)}</h3><p>Your answer: ${mockAnswers[i]===undefined?"Not answered":esc(q.options[mockAnswers[i]])}</p><p><b>Correct: ${esc(q.options[q.correctIndex])}</b></p><p>${esc(q.explanation)} ${esc(q.explanationNe)}</p></article>`).join(""));
      $("again").addEventListener("click",()=>{$("mockIntro").classList.remove("hidden");$("mockArea").innerHTML="";mock=[];});
    }
    function renderMock() {
      if(mi>=mock.length){finishMock();return;}
      const q=mock[mi];$("mockArea").innerHTML=`<div class="qtop"><span>QUESTION ${mi+1} OF ${mock.length}</span><span class="timer" id="timer">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}</span></div><article class="question">${bilingual(q)}<div class="options">${q.options.map((o,i)=>`<button class="option ${mockAnswers[mi]===i?"correct":""}" data-mock-answer="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("")}</div><div class="nextrow"><span class="muted">Choose one answer</span><button class="smallbtn" id="mockNext">${mi===mock.length-1?"Submit test":"Next"}</button></div></article>`;
      $("mockArea").querySelectorAll("[data-mock-answer]").forEach(b=>b.addEventListener("click",()=>{mockAnswers[mi]=Number(b.dataset.mockAnswer);$("mockArea").querySelectorAll("[data-mock-answer]").forEach(x=>x.classList.toggle("correct",Number(x.dataset.mockAnswer)===mockAnswers[mi]));}));
      $("mockNext").addEventListener("click",()=>{mi++;if(mi>=mock.length)finishMock();else renderMock();});
    }
    function startMock() {
      clearInterval(timer);mock=mockBank.map(q=>({...q,options:[...q.options]}));
      for(let i=mock.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mock[i],mock[j]]=[mock[j],mock[i]];}
      mockAnswers={};mi=0;remaining=mock.length*60;$("mockIntro").classList.add("hidden");renderMock();
      timer=setInterval(()=>{remaining--;const t=$("timer");if(t)t.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}`;if(remaining<=0)finishMock();},1000);
    }
    function showApp(rows) {
      notes=rows.filter(x=>x.content_type==="note").sort((a,b)=>a.display_order-b.display_order).map(x=>x.content_data);
      practice=rows.filter(x=>x.content_type==="mcq").sort((a,b)=>a.display_order-b.display_order).map(x=>shuffled(x.content_data));
      mockBank=rows.filter(x=>x.content_type==="mock").sort((a,b)=>a.display_order-b.display_order).map(x=>shuffled(x.content_data));
      status.classList.add("hidden");app.classList.remove("hidden");
      $("notesCount").textContent=notes.length+" Notes";$("practiceCount").textContent=practice.length+" MCQs";
      $("mockCount").textContent=mockBank.length+" Questions";$("mockInfo").textContent=mockBank.length+" प्रश्न • "+mockBank.length+" मिनेट • प्रत्येक प्रश्नको १ अंक";
      renderNotes();
    }
    async function load() {
      showStatus("Login र सुरक्षित सामग्री जाँच हुँदैछ...");
      try {
        if(!client){const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");client=createClient(SUPABASE_URL,SUPABASE_KEY);}
        const {data:{session},error:sessionError}=await client.auth.getSession();if(sessionError)throw sessionError;
        if(!session?.user){showStatus("पढ्नका लागि पहिले Login गर्नुहोस्। Login / Register विकल्प खोल्नुहोस्।","warning");const b=document.createElement("button");b.className="primary";b.textContent="Login / Register";b.addEventListener("click",()=>document.getElementById("accountPanel")?.scrollIntoView({behavior:"smooth",block:"center"}));status.append(b);return;}
        const {data,error}=await client.rpc("get_learning_content",{p_subject:config.subject,p_content_type:null});if(error)throw error;
        if(!data?.length){showStatus("यस Faculty को syllabus map र सामग्री तयार हुँदैछ। कृपया केही समयपछि पुनः हेर्नुहोस्।","warning");return;}
        showApp(data);
      } catch(error) { console.error(config.subject+" content:",error);showStatus("सामग्री लोड हुन सकेन: "+(error.message||"Database जाँच्नुहोस्।"),"error"); }
    }
    root.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{const action=b.dataset.action;panel(action);if(action==="practice")renderPractice();}));
    $("language").addEventListener("change",()=>{if(!$("practicePanel").classList.contains("hidden"))renderPractice();if(!$("mockPanel").classList.contains("hidden")&&mock.length)renderMock();});
    $("startMock").addEventListener("click",startMock);
    load();window.addEventListener("dhpn-auth-changed",load);
  }
  modules.forEach(init);
})();
