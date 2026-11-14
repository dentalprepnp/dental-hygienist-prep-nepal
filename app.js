const NOTES = [["What is Periodontology?", "Periodontology is the branch of dentistry concerned with the supporting tissues of the teeth and their diseases.", "Periodontology भनेको दाँतलाई सहारा दिने तन्तु र तिनका रोगको अध्ययन गर्ने दन्तचिकित्साको शाखा हो।"], ["The periodontium", "The periodontium consists of gingiva, periodontal ligament (PDL), cementum and alveolar bone.", "Periodontium का चार भाग: Gingiva, Periodontal ligament (PDL), Cementum र Alveolar bone हुन्।"], ["Functions of the periodontium", "It supports and attaches teeth, distributes chewing forces and protects the underlying structures.", "यसले दाँतलाई अड्याउँछ, चपाउँदा लाग्ने बल बाँड्छ र वरिपरिको संरचनाको सुरक्षा गर्छ।"], ["Dental plaque biofilm", "Dental plaque is a soft, structured microbial biofilm attached to tooth surfaces. It is a major initiating factor in gingival inflammation.", "Dental plaque दाँतको सतहमा टाँसिने सूक्ष्मजीवको नरम तह हो। यसले गिजाको सूजन सुरु गराउन मुख्य भूमिका खेल्छ।"], ["Calculus", "Calculus is mineralized dental plaque. Its rough surface can retain plaque; professional removal is usually required.", "Calculus भनेको खनिज जमेर कडा भएको dental plaque हो। यसको खस्रो सतहमा plaque जम्मा हुन सक्छ; हटाउन प्रायः professional cleaning चाहिन्छ।"], ["Gingivitis", "Gingivitis is inflammation of the gingiva, commonly caused by plaque. It may present with redness, swelling and bleeding on brushing or probing. It is generally reversible with effective plaque control.", "Gingivitis भनेको गिजाको सूजन हो, जुन प्रायः plaque का कारण हुन्छ। रातोपन, सुन्निनु र ब्रस गर्दा वा जाँच्दा रगत आउन सक्छ। राम्रो plaque control ले सामान्यतया निको हुन सक्छ।"], ["Periodontitis", "Periodontitis is a chronic inflammatory disease associated with dysbiotic plaque biofilm and characterized by loss of periodontal attachment and supporting alveolar bone.", "Periodontitis plaque biofilm सँग सम्बन्धित दीर्घकालीन सूजनजन्य रोग हो, जसमा periodontal attachment र alveolar bone को क्षति हुन्छ।"], ["Periodontal pocket", "A periodontal pocket is a pathologically increased gingival sulcus depth associated with loss of periodontal attachment. Probing depth alone should be interpreted with clinical attachment level.", "Periodontal pocket भनेको रोगका कारण गहिरिएको gingival sulcus हो। Probing depth लाई clinical attachment level सँगै बुझ्नुपर्छ।"], ["Periodontal examination", "Assessment may include medical and dental history, plaque and bleeding assessment, probing depths, recession, mobility, furcation involvement and radiographs when indicated.", "जाँचमा medical/dental history, plaque, bleeding, probing depth, recession, mobility, furcation र आवश्यक परे X-ray समावेश हुन सक्छ।"], ["Prevention and maintenance", "Daily brushing with fluoride toothpaste, interdental cleaning, tobacco cessation, risk-factor control and regular professional review help maintain periodontal health.", "Fluoride toothpaste ले दिनमा दुई पटक ब्रस, दाँतबीच सफाइ, सुर्तीजन्य पदार्थ त्याग, जोखिम नियन्त्रण र नियमित dental check-up ले periodontal health जोगाउन मद्दत गर्छ।"]];
const QUESTIONS = [["Which of the following is part of the periodontium?", "तलका मध्ये कुन periodontium को भाग हो?", ["Enamel", "Gingiva", "Dentin", "Pulp"], 1, "Gingiva is one of the four components of the periodontium.", "Gingiva periodontium का चार मुख्य भागमध्ये एक हो।"], ["The four components of the periodontium are:", "Periodontium का चार भाग कुन-कुन हुन्?", ["Enamel, dentin, pulp, gingiva", "Gingiva, PDL, cementum, alveolar bone", "Crown, root, pulp, dentin", "Mucosa, tongue, palate, gingiva"], 1, "The periodontium comprises gingiva, periodontal ligament, cementum and alveolar bone.", "चार भाग Gingiva, PDL, Cementum र Alveolar bone हुन्।"], ["The main initiating factor for plaque-induced gingivitis is:", "Plaque-induced gingivitis सुरु गराउने मुख्य कारण कुन हो?", ["Dental plaque biofilm", "Fluoride", "Saliva", "Enamel"], 0, "Dental plaque biofilm triggers the inflammatory response in gingiva.", "Dental plaque biofilm ले गिजामा inflammatory response सुरु गराउँछ।"], ["Dental calculus is best described as:", "Dental calculus लाई कसरी परिभाषित गरिन्छ?", ["Soft food debris", "Mineralized dental plaque", "A type of tooth enamel", "Healthy gingival tissue"], 1, "Calculus is mineralized plaque and commonly provides a plaque-retentive rough surface.", "Calculus भनेको mineralized plaque हो र यसको सतहमा plaque अडिन सक्छ।"], ["A common clinical sign of gingivitis is:", "Gingivitis को सामान्य clinical sign कुन हो?", ["Gingival bleeding", "Tooth fracture", "Pulp necrosis", "Enamel hypoplasia"], 0, "Inflamed gingiva may bleed on brushing or gentle probing.", "सुन्निएको गिजाबाट ब्रस गर्दा वा probing गर्दा रगत आउन सक्छ।"], ["Gingivitis is generally considered:", "Gingivitis लाई सामान्यतया कस्तो अवस्था मानिन्छ?", ["Always irreversible", "Reversible with effective plaque control", "A pulpal disease", "A fracture"], 1, "Plaque-induced gingivitis can generally resolve when plaque is effectively controlled.", "Plaque राम्रोसँग नियन्त्रण गर्दा plaque-induced gingivitis सामान्यतया निको हुन सक्छ।"], ["Which tissue connects cementum to alveolar bone?", "Cementum र alveolar bone लाई जोड्ने तन्तु कुन हो?", ["Dental pulp", "Periodontal ligament", "Enamel", "Oral epithelium"], 1, "The periodontal ligament anchors the tooth root to the alveolar socket.", "PDL ले दाँतको जरालाई alveolar socket सँग जोड्छ।"], ["Periodontitis is characterized by:", "Periodontitis को विशेषता के हो?", ["Only enamel staining", "Loss of periodontal attachment and supporting bone", "Only reversible gingival redness", "Increased enamel thickness"], 1, "Periodontitis involves loss of attachment and supporting alveolar bone.", "Periodontitis मा attachment र supporting alveolar bone को क्षति हुन्छ।"], ["Which instrument is commonly used to assess periodontal probing depth?", "Periodontal probing depth जाँच्न कुन instrument प्रयोग हुन्छ?", ["Periodontal probe", "Mouth mirror only", "Excavator", "Burnisher"], 0, "A calibrated periodontal probe is used to measure probing depth around teeth.", "Calibrated periodontal probe ले दाँत वरिपरिको probing depth नापिन्छ।"], ["What does BOP commonly stand for in periodontal charting?", "Periodontal charting मा BOP को अर्थ के हो?", ["Base of pulp", "Bleeding on probing", "Bone over pulp", "Buccal oral plaque"], 1, "BOP means bleeding on probing and is an indicator of gingival inflammation.", "BOP को पूरा रूप Bleeding on Probing हो; यो गिजाको सूजनको संकेत हुन सक्छ।"], ["Which is a major risk factor for periodontitis?", "Periodontitis को प्रमुख risk factor कुन हो?", ["Tobacco smoking", "Drinking plain water", "Using a soft toothbrush", "Wearing glasses"], 0, "Tobacco smoking increases the risk and can worsen periodontal outcomes.", "सुर्तीजन्य पदार्थ सेवनले periodontitis को जोखिम र उपचारको नतिजामा नकारात्मक असर पार्छ।"], ["The normal gingival sulcus depth in periodontal health is commonly around:", "स्वस्थ अवस्थामा gingival sulcus को सामान्य गहिराइ प्रायः कति हुन्छ?", ["1–3 mm", "6–8 mm", "10–12 mm", "15 mm"], 0, "A healthy sulcus is commonly about 1–3 mm, though interpretation depends on the clinical context.", "स्वस्थ sulcus प्रायः 1–3 mm आसपास हुन्छ; clinical context पनि विचार गर्नुपर्छ।"], ["Which of the following is a non-surgical periodontal therapy?", "तलका मध्ये कुन non-surgical periodontal therapy हो?", ["Scaling and root planing", "Apicoectomy", "Extraction only", "Crown lengthening surgery"], 0, "Scaling and root planing is a non-surgical approach to disrupt biofilm and remove deposits.", "Scaling and root planing non-surgical उपचार हो, जसले biofilm र deposits हटाउन मद्दत गर्छ।"], ["The primary purpose of a periodontal maintenance visit is to:", "Periodontal maintenance visit को मुख्य उद्देश्य के हो?", ["Monitor periodontal health and control recurrent biofilm", "Whiten teeth only", "Replace all fillings", "Treat every tooth with extraction"], 0, "Maintenance includes reassessment, reinforcement of home care and professional biofilm control as indicated.", "Maintenance मा पुनःजाँच, घरको सफाइबारे सल्लाह र आवश्यक professional biofilm control हुन्छ।"], ["Which finding may indicate periodontal attachment loss?", "Periodontal attachment loss को संकेत कुन हुन सक्छ?", ["Clinical attachment loss", "White spot lesion only", "Tooth shade change", "Pulp chamber size"], 0, "Clinical attachment level is used to assess loss of periodontal support.", "Clinical attachment level ले periodontal support कति गुमेको छ भनेर मूल्याङ्कन गर्न मद्दत गर्छ।"], ["Which daily habit helps prevent plaque accumulation?", "Plaque कम गर्न कुन दैनिक बानी उपयोगी हुन्छ?", ["Regular toothbrushing and interdental cleaning", "Avoiding all water", "Brushing once a week", "Using toothpicks forcefully"], 0, "Consistent brushing and interdental cleaning disrupt plaque biofilm.", "नियमित ब्रस र दाँतबीच सफाइले plaque biofilm हटाउन मद्दत गर्छ।"], ["Which structure covers the root surface?", "दाँतको जराको सतहलाई कुन संरचनाले ढाक्छ?", ["Cementum", "Enamel", "Dentin only", "Pulp"], 0, "Cementum covers the root surface and provides attachment for periodontal ligament fibers.", "Cementum ले जराको सतह ढाक्छ र PDL fibers जोडिन आधार दिन्छ।"], ["Alveolar bone primarily:", "Alveolar bone को मुख्य काम के हो?", ["Forms the tooth socket and supports teeth", "Produces saliva", "Covers the crown", "Forms the tongue"], 0, "Alveolar bone forms the tooth-supporting socket.", "Alveolar bone ले दाँत अडिने socket बनाउँछ।"], ["A periodontal pocket is associated with:", "Periodontal pocket कुन अवस्थासँग सम्बन्धित हुन्छ?", ["Pathological increase in sulcus depth with attachment loss", "Normal enamel grooves", "A cavity in the crown", "Pulp chamber enlargement"], 0, "A true periodontal pocket is associated with attachment loss; probing depth must be interpreted with attachment level.", "साँचो periodontal pocket attachment loss सँग सम्बन्धित हुन्छ; probing depth लाई attachment level सँगै बुझ्नुपर्छ।"], ["Which statement about calculus is correct?", "Calculus बारे कुन भनाइ सही हो?", ["It is mineralized plaque and usually needs professional removal", "It is living gingiva", "It is the same as enamel", "It always directly destroys bone by itself"], 0, "Calculus retains plaque, but periodontal tissue destruction is driven by the host inflammatory response to dysbiotic biofilm—not calculus acting alone.", "Calculus ले plaque अड्याउन सक्छ; तर tissue destruction biofilm विरुद्धको host inflammatory response का कारण हुन्छ, calculus आफैँले मात्र होइन।"]];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let practiceIndex=0, practiceAnswered={}, mockQuestions=[], mockIndex=0, mockAnswers={}, mockTimer=null, secondsLeft=600, deferredInstall=null;
const saved = JSON.parse(localStorage.getItem("dhpn-progress") || '{"attempted":0,"correct":0,"best":0}');
function persist(){localStorage.setItem("dhpn-progress",JSON.stringify(saved));updateStats()}
function updateStats(){
  $("#attempted").textContent=saved.attempted;
  $("#accuracy").textContent=(saved.attempted?Math.round(saved.correct/saved.attempted*100):0)+"%";
  $("#best").textContent=saved.best+"%";
}
const MOCK_HISTORY_KEY="dhpn-mock-history";
function readMockHistory(){try{return JSON.parse(localStorage.getItem(MOCK_HISTORY_KEY)||"[]")}catch(e){return []}}
window.DHPNProgress={
  recordMock(moduleName,score,total){
    const rows=readMockHistory();
    rows.push({module:moduleName,score,total,percent:Math.round(score/total*100),date:new Date().toISOString()});
    localStorage.setItem(MOCK_HISTORY_KEY,JSON.stringify(rows.slice(-200)));
    renderDashboard();
  }
};
function renderDashboard(){
  const rows=readMockHistory(),attempts=rows.length;
  $("#mockAttempts").textContent=attempts;
  $("#mockAverage").textContent=(attempts?Math.round(rows.reduce((s,r)=>s+r.percent,0)/attempts):0)+"%";
  $("#mockBest").textContent=(attempts?Math.max(...rows.map(r=>r.percent)):0)+"%";
  const grouped={};rows.forEach(r=>{if(!grouped[r.module])grouped[r.module]=[];grouped[r.module].push(r)});
  const list=$("#moduleProgress");
  if(!attempts){list.innerHTML='<p class="muted">अहिलेसम्म Mock Test रेकर्ड छैन। कुनै विषयको Mock Test पूरा गरेपछि यहाँ विवरण देखिन्छ।</p>';return}
  list.innerHTML=Object.keys(grouped).map(name=>{const h=grouped[name],last=h[h.length-1],best=Math.max(...h.map(x=>x.percent));return '<article class="progress-row"><div><b>'+name+'</b><small>'+h.length+' attempt(s) • पछिल्लो: '+new Date(last.date).toLocaleDateString()+'</small></div><div class="progress-scores"><strong>'+last.percent+'%</strong><small>Best '+best+'%</small></div></article>'}).join("");
}
const progressModuleNames={mockView:"Basic Periodontology",oralPathView:"Oral Pathology and Microbiology",dentalMaterialsView:"Dental Materials, Instruments and Assisting",oralAnatomyView:"Oral Anatomy and Physiology",dentalPublicHealthView:"Dental Public Health and Community Dentistry",dentalRadiologyView:"Dental Radiography and Photography",dentalPharmacyView:"Dental Pharmacy",dentalEthicsView:"Dental Ethics and Practice Management",foodNutritionView:"Food and Nutrition",epidemiologyView:"Epidemiology and Community Diagnosis"};
const progressObserver=new MutationObserver(records=>{records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;const results=[];if(node.matches&&node.matches(".result"))results.push(node);if(node.querySelectorAll)results.push(...node.querySelectorAll(".result"));results.forEach(result=>{if(result.dataset.progressSaved)return;const view=result.closest(".view"),name=view&&progressModuleNames[view.id];const match=(result.querySelector("strong")?.textContent||"").match(/(\d+)\s*\/\s*10/);if(name&&match){result.dataset.progressSaved="true";window.DHPNProgress.recordMock(name,Number(match[1]),10)}})}) )});
progressObserver.observe(document.body,{childList:true,subtree:true});
function showTab(tab){
  $$(".view").forEach(v=>v.classList.add("hidden"));
  $("#"+tab+"View").classList.remove("hidden");
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  if(tab==="practice") renderPractice();
  if(tab==="notes") renderNotes();
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-tab]").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
$("[data-go]").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.go)));
const subjectSearch=$("#subjectSearch");
if(subjectSearch){
  subjectSearch.addEventListener("input",()=>{
    const term=subjectSearch.value.trim().toLowerCase();
    let visible=0;
    $("#subjectGrid .subject-card").forEach(card=>{
      const match=card.dataset.subject.toLowerCase().includes(term)||card.textContent.toLowerCase().includes(term);
      card.classList.toggle("hidden",!match);
      if(match)visible++;
    });
    $("#noSubjects").classList.toggle("hidden",visible!==0);
  });
}
function renderNotes(){
  $("#notesList").innerHTML=NOTES.map(n=>`<article class="note"><h3>${n[0]}</h3><p>${n[1]}</p><p class="np">${n[2]}</p></article>`).join("");
}
function qText(q){const mode=$("#languageMode").value;return `<h3>${q[0]}</h3>${mode!=="en"?`<p class="translation">${q[1]}</p>`:""}`}
function renderPractice(){
  const q=QUESTIONS[practiceIndex], chosen=practiceAnswered[practiceIndex];
  $("#practiceCount").textContent=`${practiceIndex+1} / ${QUESTIONS.length}`;
  $("#quizArea").innerHTML=`<article class="question"><div class="qtop"><span>PERIODONTOLOGY • MCQ ${practiceIndex+1}</span><span>${chosen===undefined?"Not answered":"Answered"}</span></div>${qText(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${chosen!==undefined&&i===q[3]?"correct":chosen===i&&chosen!==q[3]?"wrong":""}" data-answer="${i}" ${chosen!==undefined?"disabled":""}>${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>${chosen!==undefined?`<div class="feedback ${chosen===q[3]?"good":"bad"}"><b>${chosen===q[3]?"Correct!":"Not quite. Correct answer: "+q[2][q[3]]}</b>${q[4]}<br><br>${q[5]}</div>`:""}<div class="nextrow"><button class="smallbtn" id="prevQ" ${practiceIndex===0?"disabled":""}>Previous</button><button class="smallbtn" id="nextQ">${practiceIndex===QUESTIONS.length-1?"Restart set":"Next question"}</button></div></article>`;
  $$("#quizArea [data-answer]").forEach(btn=>btn.addEventListener("click",()=>answerPractice(Number(btn.dataset.answer))));
  $("#prevQ").addEventListener("click",()=>{practiceIndex=Math.max(0,practiceIndex-1);renderPractice()});
  $("#nextQ").addEventListener("click",()=>{practiceIndex=practiceIndex===QUESTIONS.length-1?0:practiceIndex+1;renderPractice()});
}
function answerPractice(choice){
  if(practiceAnswered[practiceIndex]!==undefined)return;
  practiceAnswered[practiceIndex]=choice;saved.attempted++;if(choice===QUESTIONS[practiceIndex][3])saved.correct++;persist();renderPractice();
}
$("#languageMode").addEventListener("change",renderPractice);
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
$("#startMock").addEventListener("click",startMock);
function startMock(){
  clearInterval(mockTimer);mockQuestions=shuffle(QUESTIONS).slice(0,10);mockIndex=0;mockAnswers={};secondsLeft=600;
  $("#mockIntro").classList.add("hidden");renderMock();
  mockTimer=setInterval(()=>{secondsLeft--;const t=$("#timer");if(t)t.textContent=`${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,"0")}`;if(secondsLeft<=0)finishMock()},1000);
}
function renderMock(){
  if(mockIndex>=mockQuestions.length){finishMock();return}
  const q=mockQuestions[mockIndex];
  $("#mockArea").innerHTML=`<div class="qtop"><span>QUESTION ${mockIndex+1} OF 10</span><span class="timer" id="timer">${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,"0")}</span></div><article class="question">${qText(q)}<div class="options">${q[2].map((o,i)=>`<button class="option" data-mock="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div><div class="nextrow"><span class="muted">Choose one answer</span><button class="smallbtn" id="mockNext">Next</button></div></article>`;
  $$("#mockArea [data-mock]").forEach(b=>b.addEventListener("click",()=>{mockAnswers[mockIndex]=Number(b.dataset.mock);$$("#mockArea [data-mock]").forEach(x=>x.classList.toggle("correct",Number(x.dataset.mock)===mockAnswers[mockIndex]));}));
  $("#mockNext").addEventListener("click",()=>{mockIndex++;renderMock()});
}
function finishMock(){
  clearInterval(mockTimer);let score=0;mockQuestions.forEach((q,i)=>{if(mockAnswers[i]===q[3])score++});
  saved.attempted+=10;saved.correct+=score;saved.best=Math.max(saved.best,score*10);persist();
  $("#mockArea").innerHTML=`<div class="result"><p>MOCK TEST COMPLETED</p><strong>${score}/10</strong><b>${score*10}%</b><p>${score>=8?"Excellent effort!":score>=5?"Good attempt. Review the explanations.":"Keep practising. Revise the notes and try again."}</p><button class="primary" id="reviewMock">Review answers</button> <button class="secondary" id="againMock">Try again</button></div><div id="reviewList"></div>`;
  $("#reviewMock").addEventListener("click",()=>{$("#reviewList").innerHTML=mockQuestions.map((q,i)=>`<article class="note"><h3>${i+1}. ${q[0]}</h3><p>Your answer: ${mockAnswers[i]===undefined?"Not answered":q[2][mockAnswers[i]]}</p><p><b>Correct: ${q[2][q[3]]}</b></p><p>${q[4]} ${q[5]}</p></article>`).join("")});
  $("#againMock").addEventListener("click",()=>{ $("#mockIntro").classList.remove("hidden");$("#mockArea").innerHTML="";});
  $("#mockIntro").classList.remove("hidden");
}
updateStats();renderDashboard();renderNotes();
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("#installBtn").classList.add("hidden")});
