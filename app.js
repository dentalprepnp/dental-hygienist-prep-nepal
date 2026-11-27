const NOTES = [["What is Periodontology?", "Periodontology is the branch of dentistry concerned with the supporting tissues of the teeth and their diseases.", "Periodontology भनेको दाँतलाई सहारा दिने तन्तु र तिनका रोगको अध्ययन गर्ने दन्तचिकित्साको शाखा हो।"], ["The periodontium", "The periodontium consists of gingiva, periodontal ligament (PDL), cementum and alveolar bone.", "Periodontium का चार भाग: Gingiva, Periodontal ligament (PDL), Cementum र Alveolar bone हुन्।"], ["Functions of the periodontium", "It supports and attaches teeth, distributes chewing forces and protects the underlying structures.", "यसले दाँतलाई अड्याउँछ, चपाउँदा लाग्ने बल बाँड्छ र वरिपरिको संरचनाको सुरक्षा गर्छ।"], ["Dental plaque biofilm", "Dental plaque is a soft, structured microbial biofilm attached to tooth surfaces. It is a major initiating factor in gingival inflammation.", "Dental plaque दाँतको सतहमा टाँसिने सूक्ष्मजीवको नरम तह हो। यसले गिजाको सूजन सुरु गराउन मुख्य भूमिका खेल्छ।"], ["Calculus", "Calculus is mineralized dental plaque. Its rough surface can retain plaque; professional removal is usually required.", "Calculus भनेको खनिज जमेर कडा भएको dental plaque हो। यसको खस्रो सतहमा plaque जम्मा हुन सक्छ; हटाउन प्रायः professional cleaning चाहिन्छ।"], ["Gingivitis", "Gingivitis is inflammation of the gingiva, commonly caused by plaque. It may present with redness, swelling and bleeding on brushing or probing. It is generally reversible with effective plaque control.", "Gingivitis भनेको गिजाको सूजन हो, जुन प्रायः plaque का कारण हुन्छ। रातोपन, सुन्निनु र ब्रस गर्दा वा जाँच्दा रगत आउन सक्छ। राम्रो plaque control ले सामान्यतया निको हुन सक्छ।"], ["Periodontitis", "Periodontitis is a chronic inflammatory disease associated with dysbiotic plaque biofilm and characterized by loss of periodontal attachment and supporting alveolar bone.", "Periodontitis plaque biofilm सँग सम्बन्धित दीर्घकालीन सूजनजन्य रोग हो, जसमा periodontal attachment र alveolar bone को क्षति हुन्छ।"], ["Periodontal pocket", "A periodontal pocket is a pathologically increased gingival sulcus depth associated with loss of periodontal attachment. Probing depth alone should be interpreted with clinical attachment level.", "Periodontal pocket भनेको रोगका कारण गहिरिएको gingival sulcus हो। Probing depth लाई clinical attachment level सँगै बुझ्नुपर्छ।"], ["Periodontal examination", "Assessment may include medical and dental history, plaque and bleeding assessment, probing depths, recession, mobility, furcation involvement and radiographs when indicated.", "जाँचमा medical/dental history, plaque, bleeding, probing depth, recession, mobility, furcation र आवश्यक परे X-ray समावेश हुन सक्छ।"], ["Prevention and maintenance", "Daily brushing with fluoride toothpaste, interdental cleaning, tobacco cessation, risk-factor control and regular professional review help maintain periodontal health.", "Fluoride toothpaste ले दिनमा दुई पटक ब्रस, दाँतबीच सफाइ, सुर्तीजन्य पदार्थ त्याग, जोखिम नियन्त्रण र नियमित dental check-up ले periodontal health जोगाउन मद्दत गर्छ।"]];
const QUESTIONS = [["Which of the following is part of the periodontium?", "तलका मध्ये कुन periodontium को भाग हो?", ["Enamel", "Gingiva", "Dentin", "Pulp"], 1, "Gingiva is one of the four components of the periodontium.", "Gingiva periodontium का चार मुख्य भागमध्ये एक हो।"], ["The four components of the periodontium are:", "Periodontium का चार भाग कुन-कुन हुन्?", ["Enamel, dentin, pulp, gingiva", "Gingiva, PDL, cementum, alveolar bone", "Crown, root, pulp, dentin", "Mucosa, tongue, palate, gingiva"], 1, "The periodontium comprises gingiva, periodontal ligament, cementum and alveolar bone.", "चार भाग Gingiva, PDL, Cementum र Alveolar bone हुन्।"], ["The main initiating factor for plaque-induced gingivitis is:", "Plaque-induced gingivitis सुरु गराउने मुख्य कारण कुन हो?", ["Dental plaque biofilm", "Fluoride", "Saliva", "Enamel"], 0, "Dental plaque biofilm triggers the inflammatory response in gingiva.", "Dental plaque biofilm ले गिजामा inflammatory response सुरु गराउँछ।"], ["Dental calculus is best described as:", "Dental calculus लाई कसरी परिभाषित गरिन्छ?", ["Soft food debris", "Mineralized dental plaque", "A type of tooth enamel", "Healthy gingival tissue"], 1, "Calculus is mineralized plaque and commonly provides a plaque-retentive rough surface.", "Calculus भनेको mineralized plaque हो र यसको सतहमा plaque अडिन सक्छ।"], ["A common clinical sign of gingivitis is:", "Gingivitis को सामान्य clinical sign कुन हो?", ["Gingival bleeding", "Tooth fracture", "Pulp necrosis", "Enamel hypoplasia"], 0, "Inflamed gingiva may bleed on brushing or gentle probing.", "सुन्निएको गिजाबाट ब्रस गर्दा वा probing गर्दा रगत आउन सक्छ।"], ["Gingivitis is generally considered:", "Gingivitis लाई सामान्यतया कस्तो अवस्था मानिन्छ?", ["Always irreversible", "Reversible with effective plaque control", "A pulpal disease", "A fracture"], 1, "Plaque-induced gingivitis can generally resolve when plaque is effectively controlled.", "Plaque राम्रोसँग नियन्त्रण गर्दा plaque-induced gingivitis सामान्यतया निको हुन सक्छ।"], ["Which tissue connects cementum to alveolar bone?", "Cementum र alveolar bone लाई जोड्ने तन्तु कुन हो?", ["Dental pulp", "Periodontal ligament", "Enamel", "Oral epithelium"], 1, "The periodontal ligament anchors the tooth root to the alveolar socket.", "PDL ले दाँतको जरालाई alveolar socket सँग जोड्छ।"], ["Periodontitis is characterized by:", "Periodontitis को विशेषता के हो?", ["Only enamel staining", "Loss of periodontal attachment and supporting bone", "Only reversible gingival redness", "Increased enamel thickness"], 1, "Periodontitis involves loss of attachment and supporting alveolar bone.", "Periodontitis मा attachment र supporting alveolar bone को क्षति हुन्छ।"], ["Which instrument is commonly used to assess periodontal probing depth?", "Periodontal probing depth जाँच्न कुन instrument प्रयोग हुन्छ?", ["Periodontal probe", "Mouth mirror only", "Excavator", "Burnisher"], 0, "A calibrated periodontal probe is used to measure probing depth around teeth.", "Calibrated periodontal probe ले दाँत वरिपरिको probing depth नापिन्छ।"], ["What does BOP commonly stand for in periodontal charting?", "Periodontal charting मा BOP को अर्थ के हो?", ["Base of pulp", "Bleeding on probing", "Bone over pulp", "Buccal oral plaque"], 1, "BOP means bleeding on probing and is an indicator of gingival inflammation.", "BOP को पूरा रूप Bleeding on Probing हो; यो गिजाको सूजनको संकेत हुन सक्छ।"], ["Which is a major risk factor for periodontitis?", "Periodontitis को प्रमुख risk factor कुन हो?", ["Tobacco smoking", "Drinking plain water", "Using a soft toothbrush", "Wearing glasses"], 0, "Tobacco smoking increases the risk and can worsen periodontal outcomes.", "सुर्तीजन्य पदार्थ सेवनले periodontitis को जोखिम र उपचारको नतिजामा नकारात्मक असर पार्छ।"], ["The normal gingival sulcus depth in periodontal health is commonly around:", "स्वस्थ अवस्थामा gingival sulcus को सामान्य गहिराइ प्रायः कति हुन्छ?", ["1–3 mm", "6–8 mm", "10–12 mm", "15 mm"], 0, "A healthy sulcus is commonly about 1–3 mm, though interpretation depends on the clinical context.", "स्वस्थ sulcus प्रायः 1–3 mm आसपास हुन्छ; clinical context पनि विचार गर्नुपर्छ।"], ["Which of the following is a non-surgical periodontal therapy?", "तलका मध्ये कुन non-surgical periodontal therapy हो?", ["Scaling and root planing", "Apicoectomy", "Extraction only", "Crown lengthening surgery"], 0, "Scaling and root planing is a non-surgical approach to disrupt biofilm and remove deposits.", "Scaling and root planing non-surgical उपचार हो, जसले biofilm र deposits हटाउन मद्दत गर्छ।"], ["The primary purpose of a periodontal maintenance visit is to:", "Periodontal maintenance visit को मुख्य उद्देश्य के हो?", ["Monitor periodontal health and control recurrent biofilm", "Whiten teeth only", "Replace all fillings", "Treat every tooth with extraction"], 0, "Maintenance includes reassessment, reinforcement of home care and professional biofilm control as indicated.", "Maintenance मा पुनःजाँच, घरको सफाइबारे सल्लाह र आवश्यक professional biofilm control हुन्छ।"], ["Which finding may indicate periodontal attachment loss?", "Periodontal attachment loss को संकेत कुन हुन सक्छ?", ["Clinical attachment loss", "White spot lesion only", "Tooth shade change", "Pulp chamber size"], 0, "Clinical attachment level is used to assess loss of periodontal support.", "Clinical attachment level ले periodontal support कति गुमेको छ भनेर मूल्याङ्कन गर्न मद्दत गर्छ।"], ["Which daily habit helps prevent plaque accumulation?", "Plaque कम गर्न कुन दैनिक बानी उपयोगी हुन्छ?", ["Regular toothbrushing and interdental cleaning", "Avoiding all water", "Brushing once a week", "Using toothpicks forcefully"], 0, "Consistent brushing and interdental cleaning disrupt plaque biofilm.", "नियमित ब्रस र दाँतबीच सफाइले plaque biofilm हटाउन मद्दत गर्छ।"], ["Which structure covers the root surface?", "दाँतको जराको सतहलाई कुन संरचनाले ढाक्छ?", ["Cementum", "Enamel", "Dentin only", "Pulp"], 0, "Cementum covers the root surface and provides attachment for periodontal ligament fibers.", "Cementum ले जराको सतह ढाक्छ र PDL fibers जोडिन आधार दिन्छ।"], ["Alveolar bone primarily:", "Alveolar bone को मुख्य काम के हो?", ["Forms the tooth socket and supports teeth", "Produces saliva", "Covers the crown", "Forms the tongue"], 0, "Alveolar bone forms the tooth-supporting socket.", "Alveolar bone ले दाँत अडिने socket बनाउँछ।"], ["A periodontal pocket is associated with:", "Periodontal pocket कुन अवस्थासँग सम्बन्धित हुन्छ?", ["Pathological increase in sulcus depth with attachment loss", "Normal enamel grooves", "A cavity in the crown", "Pulp chamber enlargement"], 0, "A true periodontal pocket is associated with attachment loss; probing depth must be interpreted with attachment level.", "साँचो periodontal pocket attachment loss सँग सम्बन्धित हुन्छ; probing depth लाई attachment level सँगै बुझ्नुपर्छ।"], ["Which statement about calculus is correct?", "Calculus बारे कुन भनाइ सही हो?", ["It is mineralized plaque and usually needs professional removal", "It is living gingiva", "It is the same as enamel", "It always directly destroys bone by itself"], 0, "Calculus retains plaque, but periodontal tissue destruction is driven by the host inflammatory response to dysbiotic biofilm—not calculus acting alone.", "Calculus ले plaque अड्याउन सक्छ; तर tissue destruction biofilm विरुद्धको host inflammatory response का कारण हुन्छ, calculus आफैँले मात्र होइन।"]];
/* New original bilingual Periodontology MCQs — reviewed batch */
QUESTIONS.push(...[
["Clinical attachment level is measured from which landmark to which point?","Clinical attachment level कुन बिन्दुदेखि कुन बिन्दुसम्म मापन गरिन्छ?",["The cementoenamel junction to the base of the sulcus or pocket","The incisal edge to the gingival margin","The root apex to the crown","The occlusal surface to the pulp chamber"],0,"Clinical attachment level relates the cementoenamel junction to the base of the sulcus or pocket and reflects periodontal support loss.","Clinical attachment level ले cementoenamel junction देखि sulcus वा pocket को आधारसम्मको दूरी जनाउँछ र periodontal support को क्षति देखाउँछ।"],
["A pseudoperiodontal pocket is most likely caused by:","Pseudoperiodontal pocket प्रायः कुन कारणले बन्न सक्छ?",["Apical migration of the attachment with bone loss","Gingival enlargement without attachment loss","A fractured root","Loss of pulp vitality"],1,"A pseudopocket has increased probing depth because the gingiva is enlarged, without true apical loss of attachment.","Gingiva ठूलो भएकाले probing depth बढे पनि वास्तविक attachment loss नभएको अवस्थालाई pseudopocket भनिन्छ।"],
["Furcation involvement is assessed in which teeth?","Furcation involvement कुन दाँतमा मूल्याङ्कन गरिन्छ?",["Single-rooted incisors only","All edentulous areas","Multi-rooted teeth","Only newly erupted teeth"],2,"Furcation involvement concerns the area between roots of a multi-rooted tooth.","Furcation involvement धेरै root भएका दाँतका root बीचको भागमा मूल्याङ्कन गरिन्छ।"],
["A plaque-disclosing agent is used mainly to:","Plaque-disclosing agent मुख्यतया किन प्रयोग गरिन्छ?",["Sterilize dental plaque","Measure periodontal pocket depth","Reduce tooth sensitivity","Make dental plaque visible"],3,"Disclosing agents stain plaque so patients and clinicians can identify areas needing better biofilm control.","Disclosing agent ले plaque देखिने बनाउँछ, जसले सफाइ सुधार गर्नुपर्ने भाग पहिचान गर्न मद्दत गर्छ।"],
["An interdental brush should be selected so that it:","Interdental brush कसरी छान्नुपर्छ?",["Is forced through every space","Fits the interdental space without causing trauma","Replaces regular toothbrushing","Is shared between patients"],1,"Choose a brush that fits the space comfortably; forcing an oversized brush may injure the gingiva.","दाँतबीचको खाली ठाउँमा सहजै मिल्ने brush छान्नुपर्छ; ठूलो brush जबरजस्ती गर्दा गिजामा चोट लाग्न सक्छ।"],
["Why is smoking history recorded during periodontal assessment?","Periodontal assessment गर्दा धूम्रपानको इतिहास किन अभिलेख गरिन्छ?",["It determines tooth shade","It replaces periodontal charting","Smoking is a modifiable risk factor associated with periodontal disease and treatment response","It removes the need for follow-up"],2,"Tobacco smoking is an important modifiable risk factor and can adversely affect periodontal treatment outcomes.","धूम्रपान परिवर्तन गर्न सकिने महत्त्वपूर्ण risk factor हो र periodontal उपचारको नतिजामा नकारात्मक असर पार्न सक्छ।"],
["After non-surgical periodontal therapy, reassessment helps the clinician to:","Non-surgical periodontal therapy पछि पुनःजाँच किन गरिन्छ?",["Evaluate the response and plan further supportive care","Assume every pocket has resolved","Avoid reviewing home-care practices","Stop recording periodontal findings"],0,"Reassessment evaluates tissue response, residual disease and the need for further treatment or supportive care.","पुनःजाँचले tissue response, बाँकी रोग र थप उपचार वा supportive care को आवश्यकता मूल्याङ्कन गर्छ।"],
["A periodontal abscess may present with:","Periodontal abscess हुँदा कुन लक्षण देखिन सक्छ?",["Only enamel discoloration","A normal painless gingival margin","A generalized tongue coating","Localized swelling, pain and suppuration near a periodontal pocket"],3,"A periodontal abscess may cause localized swelling, pain and pus formation and requires prompt professional assessment.","Periodontal abscess मा स्थानीय सुन्निने, दुख्ने र पिप आउन सक्छ; छिटो professional जाँच आवश्यक हुन्छ।"],
["Gingival recession is characterized by:","Gingival recession को विशेषता के हो?",["Coronal movement of gingiva over the crown","Apical displacement of the gingival margin with root exposure","Thickening of enamel","Enlargement of the pulp chamber"],1,"Gingival recession is an apical shift of the gingival margin that exposes part of the root surface.","Gingival recession मा गिजाको किनारा जरातर्फ सर्छ र root surface देखिन सक्छ।"],
["Periodontal charting is most useful when it:","Periodontal charting सबैभन्दा उपयोगी कहिले हुन्छ?",["Records findings at multiple sites around teeth for comparison over time","Uses one measurement for the whole mouth","Replaces the medical history","Is performed only after extraction"],0,"Recording periodontal findings at multiple sites provides a baseline and helps monitor changes over time.","दाँत वरिपरिका विभिन्न स्थानको मापन अभिलेख गर्दा आधारभूत अवस्था र समयसँगै आएको परिवर्तन तुलना गर्न सकिन्छ।"]
]);

const practiceQuestions = QUESTIONS.slice(0, Math.ceil(QUESTIONS.length / 2));
const mockBankQuestions = QUESTIONS.slice(Math.ceil(QUESTIONS.length / 2));



const $ = s => document.querySelector(s);
window.DHPNRandomizeQuestionBank = function(roots) {
  const seen = new WeakSet();
  function visit(value) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value) && typeof value[0] === "string" &&
        typeof value[1] === "string" && Array.isArray(value[2]) &&
        Number.isInteger(value[3]) && value[3] >= 0 && value[3] < value[2].length) {
      if (!value.__dhpnOptionsShuffled) {
        const shuffled = value[2].map((option, originalIndex) => ({ option, originalIndex }));
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        value[2] = shuffled.map(item => item.option);
        value[3] = shuffled.findIndex(item => item.originalIndex === value[3]);
        Object.defineProperty(value, "__dhpnOptionsShuffled", { value: true });
      }
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  }
  (Array.isArray(roots) ? roots : [roots]).forEach(visit);
};
window.DHPNRandomizeQuestionBank(QUESTIONS);


function notifyCloudSync(){window.dispatchEvent(new CustomEvent("dhpn:data-changed"));}
const $$ = s => [...document.querySelectorAll(s)];
let practiceIndex=0, practiceAnswered={}, mockQuestions=[], mockIndex=0, mockAnswers={}, mockTimer=null, secondsLeft=600, deferredInstall=null;
const saved = JSON.parse(localStorage.getItem("dhpn-progress") || '{"attempted":0,"correct":0,"best":0}');
function persist(){localStorage.setItem("dhpn-progress",JSON.stringify(saved));updateStats();notifyCloudSync()}
function updateStats(){
  $("#attempted").textContent=saved.attempted;
  $("#accuracy").textContent=(saved.attempted?Math.round(saved.correct/saved.attempted*100):0)+"%";
  $("#best").textContent=saved.best+"%";
}
const MOCK_HISTORY_KEY="dhpn-mock-history";
function readMockHistory(){try{return JSON.parse(localStorage.getItem(MOCK_HISTORY_KEY)||"[]")}catch(e){return []}}
window.DHPNProgress={
  recordMCQ(moduleName,question,selectedIndex){
    const correctIndex=Array.isArray(question)?question[3]:-1;
    saved.attempted++;
    if(selectedIndex===correctIndex)saved.correct++;
    saved.best=Math.max(saved.best,Math.round(saved.correct/saved.attempted*100));
    persist();
  },
  recordNHPCQuestion(item,selectedIndex){
    if(!item||!Array.isArray(item.q))return;
    const q=item.q,rows=readMCQHistory(),date=new Date().toISOString();
    rows.push({module:"NHPC - PCL in Dental Hygiene",topic:item.topic||"अन्य",questionKey:(item.topic||"अन्य")+"::"+q[0],question:q[0],nepali:q[1],options:q[2],selected:q[2][selectedIndex],selectedIndex,correctAnswer:q[2][q[3]],correctIndex:q[3],explanation:q[4],explanationNp:q[5],clinicalExample:q[6]||"",isCorrect:selectedIndex===q[3],date});
    localStorage.setItem("dhpn-mcq-history",JSON.stringify(rows.slice(-500)));
    notifyCloudSync();
    window.dispatchEvent(new CustomEvent("dhpn:data-changed"));
    renderMCQDashboard();
    renderDailyStudyGoal();
    renderExamReadiness();
  },
  recordMock(moduleName,score,total,details={}){
    const rows=readMockHistory();
    const date=new Date().toISOString();
    rows.push({id:"mock-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),module:moduleName,score,total,percent:total?Math.round(score/total*100):0,date,subject:details.subject||"सबै विषय",topicStats:details.topicStats||{}});
    localStorage.setItem(MOCK_HISTORY_KEY,JSON.stringify(rows.slice(-200)));
    notifyCloudSync();
    renderDashboard();
    renderExamReadiness();
    window.dispatchEvent(new CustomEvent("dhpn:mock-history-updated"));
  }
};
const PROFILE_KEY="dhpn-student-profile";
function readStudentProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}catch(e){return {}}}
function renderStudentProfile(){
 const p=readStudentProfile(),name=$("#studentName"),target=$("#targetExam"),greeting=$("#profileGreeting");
 if(name)name.value=p.name||"";
 if(target)target.value=p.target||"NHPC";
 if(greeting)greeting.textContent=p.name?("नमस्ते, "+p.name+"! तपाईंको मुख्य लक्ष्य: "+(p.target||"NHPC")+"।"):"आफ्नो प्रोफाइल सेट गर्नुहोस्।";
}
function renderExamTrackProgress(){
 const rows=readMockHistory(),groups={NHPC:[],DHA:[],Loksewa:[]};
 rows.forEach(r=>{
  const n=(r.module||"").toLowerCase();
  if(n.includes("dha"))groups.DHA.push(r);
  else if(n.includes("loksewa"))groups.Loksewa.push(r);
  else groups.NHPC.push(r);
 });
 const labels={NHPC:"NHPC License Exam",DHA:"DHA – Dubai",Loksewa:"Loksewa Exam"};
 const box=$("#examTrackProgress");
 if(!box)return;
 box.innerHTML=Object.keys(groups).map(k=>{
  const list=groups[k],avg=list.length?Math.round(list.reduce((s,r)=>s+r.percent,0)/list.length):0,best=list.length?Math.max(...list.map(r=>r.percent)):0;
  return '<article class="exam-progress-card"><b>'+labels[k]+'</b><strong>'+list.length+'</strong><small>Mock attempts</small><div class="exam-progress-meta"><span>Average '+avg+'%</span><span>Best '+best+'%</span></div></article>';
 }).join("");
}
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
const progressModuleNames={mockView:"Basic Periodontology",oralPathView:"Oral Pathology and Microbiology",dentalMaterialsView:"Dental Materials, Instruments and Assisting",oralAnatomyView:"Oral Anatomy and Physiology",dentalPublicHealthView:"Dental Public Health and Jurisprudence",dentalRadiologyView:"Dental Radiography and Photography",dentalPharmacyView:"Dental Pharmacy",dentalEthicsView:"Dental Ethics and Practice Management",foodNutritionView:"Food and Nutrition",epidemiologyView:"Epidemiology and Community Diagnosis"};
const progressObserver=new MutationObserver(records=>{records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;const results=[];if(node.matches&&node.matches(".result"))results.push(node);if(node.querySelectorAll)results.push(...node.querySelectorAll(".result"));results.forEach(result=>{if(result.dataset.progressSaved)return;const view=result.closest(".view"),name=view&&progressModuleNames[view.id];const match=(result.querySelector("strong")?.textContent||"").match(/(\d+)\s*\/\s*10/);if(name&&match){result.dataset.progressSaved="true";window.DHPNProgress.recordMock(name,Number(match[1]),10)}})}) )});
progressObserver.observe(document.body,{childList:true,subtree:true});
const MCQ_HISTORY_KEY="dhpn-mcq-history";
function readMCQHistory(){try{return JSON.parse(localStorage.getItem(MCQ_HISTORY_KEY)||"[]")}catch(e){return []}}

function escapeReportText(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function renderExamReadiness(){
 const mcq=readMCQHistory().filter(r=>/nhpc|pcl in dental hygiene/i.test(r.module||""));
 const mocks=readMockHistory().filter(r=>/nhpc|pcl in dental hygiene/i.test(r.module||""));
 const box=$("#combinedExamReport");if(!box)return;
 const correct=mcq.filter(r=>r.isCorrect).length,mcqRate=mcq.length?Math.round(correct/mcq.length*100):0;
 const mockAvg=mocks.length?Math.round(mocks.reduce((s,r)=>s+(Number(r.percent)||0),0)/mocks.length):0;
 const recent=mocks.slice(-5),recentAvg=recent.length?Math.round(recent.reduce((s,r)=>s+(Number(r.percent)||0),0)/recent.length):0;
 const enough=mcq.length>=30&&mocks.length>=2;
 const combined=enough?Math.round((mcqRate+mockAvg)/2):null;
 let level="अझै पर्याप्त अभ्यास चाहिन्छ",advice="कम्तीमा ३० वटा NHPC MCQ र २ वटा Mock Test पूरा गरेपछि तयारीको संकेत देखाइनेछ।";
 if(enough){if(combined>=80){level="राम्रो तयारी संकेत";advice="यो स्तर कायम राख्नुहोस्। कमजोर विषय दोहोर्‍याउनुहोस् र नियमित Full Mock दिनुहोस्।"}else if(combined>=65){level="मध्यम तयारी संकेत";advice="कम अंक आएका विषयमा Notes पढेर MCQ अभ्यास बढाउनुहोस्।"}else{level="थप सुधार आवश्यक";advice="आधारभूत Notes पुनरावलोकन गरी कमजोर विषयका प्रश्नहरू क्रमशः अभ्यास गर्नुहोस्।"}}
 const topics={};
 mcq.forEach(r=>{const n=r.topic||"अन्य";if(!topics[n])topics[n]={right:0,total:0};topics[n].total++;if(r.isCorrect)topics[n].right++});
 mocks.forEach(r=>Object.entries(r.topicStats||{}).forEach(([n,v])=>{if(!topics[n])topics[n]={right:0,total:0};topics[n].right+=Number(v.right)||0;topics[n].total+=Number(v.total)||0}));
 const ranked=Object.entries(topics).filter(([,v])=>v.total>0).map(([name,v])=>({name,...v,rate:Math.round(v.right/v.total*100)})).sort((a,b)=>a.rate-b.rate||b.total-a.total);
 const topicHtml=ranked.length?ranked.slice(0,6).map(t=>'<article class="combined-topic"><div><b>'+escapeReportText(t.name)+'</b><span>'+t.right+'/'+t.total+' सही • '+t.rate+'%</span></div><div class="combined-topic-track"><i style="width:'+t.rate+'%"></i></div></article>').join(""):'<p class="muted">विषयगत रिपोर्टका लागि MCQ अभ्यास वा विषयगत Mock Test पूरा गर्नुहोस्।</p>';
 box.innerHTML='<div class="combined-report-head"><div><p class="eyebrow">NHPC • PERFORMANCE REPORT</p><h3>Mock Test + MCQ संयुक्त प्रगति</h3><p class="muted">अभ्यास रेकर्डका आधारमा स्वचालित विश्लेषण</p></div><span class="combined-level">'+level+'</span></div><div class="combined-metrics"><article><small>MCQ Accuracy</small><strong>'+mcqRate+'%</strong><span>'+mcq.length+' प्रश्न</span></article><article><small>Mock Average</small><strong>'+mockAvg+'%</strong><span>'+mocks.length+' परीक्षा</span></article><article><small>पछिल्ला Mock (५)</small><strong>'+recentAvg+'%</strong><span>'+recent.length+' परीक्षा</span></article><article><small>संयुक्त संकेत</small><strong>'+(combined===null?"—":combined+"%")+'</strong><span>'+(enough?"MCQ + Mock":"थप अभ्यास चाहिन्छ")+'</span></article></div><div class="combined-advice"><b>तपाईंको अर्को कदम</b><p>'+advice+'</p></div><div class="combined-topics"><h4>विषयअनुसार अभ्यास नतिजा</h4>'+topicHtml+'</div><div class="combined-advice"><b>गलत उत्तर पुनरावलोकन</b><p>अभ्यासमा गलत भएका प्रश्न, सही उत्तर र व्याख्या फेरि हेर्नुहोस्।</p><button type="button" class="primary" id="showWrongAnswers">गलत उत्तर हेर्नुहोस् ('+readMCQHistory().filter(r=>!r.isCorrect&&Array.isArray(r.options)&&r.options.length&&Number.isInteger(r.correctIndex)).length+')</button><div id="wrongAnswerReview"></div></div><p class="combined-footnote">यो व्यक्तिगत अभ्यासको अनुमानित सूचक मात्र हो। आधिकारिक NHPC नतिजा वा उत्तीर्ण हुने सम्भावनाको ग्यारेन्टी होइन।</p>';
}

window.DHPNProgress=window.DHPNProgress||{};
window.DHPNProgress.recordMCQ=function(moduleName,q,selected){
 const rows=readMCQHistory(),correct=selected===q[3];
 rows.push({module:moduleName,topic:q.topic||"अभ्यास",question:q[0],nepali:q[1],options:Array.isArray(q[2])?q[2]:[],selectedIndex:selected,selected:q[2][selected],correctIndex:q[3],correctAnswer:q[2][q[3]],explanation:q[4],explanationNp:q[5],isCorrect:correct,date:new Date().toISOString()});
 localStorage.setItem(MCQ_HISTORY_KEY,JSON.stringify(rows.slice(-500)));
 notifyCloudSync();
 renderMCQDashboard();
 renderDailyStudyGoal();
 renderExamReadiness();
};
window.DHPNReviewWrongAnswers=function(){
 const box=$("#wrongAnswerReview");if(!box)return;
 const wrong=readMCQHistory().filter(r=>!r.isCorrect&&Array.isArray(r.options)&&r.options.length&&Number.isInteger(r.correctIndex)).slice(-100).reverse();
 box.innerHTML=wrong.length?wrong.map((r,i)=>'<article class="note answer-review review-wrong"><h3>'+(i+1)+'. '+escapeReportText(r.question)+'</h3><p class="np">'+escapeReportText(r.nepali||"")+'</p><p><b>तपाईंको उत्तर:</b> '+escapeReportText(r.selected||"—")+'</p><p><b>सही उत्तर:</b> '+escapeReportText(r.correctAnswer||r.options[r.correctIndex])+'</p><p>'+escapeReportText(r.explanation||"")+'</p><p class="np">'+escapeReportText(r.explanationNp||"")+'</p><small>'+escapeReportText(r.module||"")+' • '+new Date(r.date).toLocaleDateString()+'</small></article>').join(""):'<p class="muted">अहिलेसम्म नयाँ गलत उत्तर रेकर्ड छैन। अब MCQ अभ्यास गर्दा गलत भएका प्रश्न यहाँ देखिनेछन्। पुराना रेकर्डमा विकल्प सुरक्षित नभएकाले ती प्रश्न देखिँदैनन्।';
};
const STUDY_GOAL_KEY="dhpn-study-goal";
function readDailyGoal(){const n=Number(localStorage.getItem(STUDY_GOAL_KEY));return Number.isFinite(n)&&n>=1?Math.min(500,Math.floor(n)):20}
function localDateKey(value){const d=new Date(value);if(Number.isNaN(d.getTime()))return "";return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function renderDailyStudyGoal(){
 const rows=readMCQHistory(),today=localDateKey(new Date()),dates=new Set(rows.map(r=>localDateKey(r.date)).filter(Boolean));
 const todayCount=rows.filter(r=>localDateKey(r.date)===today).length,goal=readDailyGoal();
 let streak=0,check=new Date();check.setHours(0,0,0,0);
 if(!dates.has(today))check.setDate(check.getDate()-1);
 while(dates.has(localDateKey(check))){streak++;check.setDate(check.getDate()-1)}
 const input=$("#dailyGoalInput"),count=$("#todayMCQCount"),status=$("#dailyGoalStatus"),streakEl=$("#studyStreak"),bar=$("#dailyGoalBar"),message=$("#dailyGoalMessage");
 if(input)input.value=goal;
 if(count)count.textContent=todayCount;
 if(status)status.textContent=todayCount+" / "+goal;
 if(streakEl)streakEl.textContent=streak+" दिन";
 if(bar)bar.style.width=Math.min(100,Math.round(todayCount/goal*100))+"%";
 if(message)message.textContent=todayCount>=goal?"🎉 आजको लक्ष्य पूरा भयो! अभ्यास जारी राख्नुहोस्।":(streak?("राम्रो! तपाईंको अध्ययन streak "+streak+" दिन छ। आज अझै "+(goal-todayCount)+" MCQ अभ्यास गर्नुहोस्।"):("आजको लक्ष्य पूरा गर्न अझै "+(goal-todayCount)+" MCQ अभ्यास गर्नुहोस्।"));
 const weekly=$("#dailyWeeklyProgress");
 if(weekly){
  const days=["आइत","सोम","मंगल","बुध","बिही","शुक्र","शनि"],todayDate=new Date(),start=new Date(todayDate);start.setHours(0,0,0,0);start.setDate(start.getDate()-6);
  const dayRows=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const key=localDateKey(d),n=rows.filter(r=>localDateKey(r.date)===key).length;return {d,key,n,label:days[d.getDay()]};});
  const weekTotal=dayRows.reduce((sum,x)=>sum+x.n,0),completed=dayRows.filter(x=>x.n>=goal).length;
  weekly.innerHTML='<div class="weekly-summary"><b>पछिल्लो ७ दिन</b><span>'+weekTotal+' MCQ • '+completed+'/7 दिन लक्ष्य पूरा</span></div><div class="weekly-bars">'+dayRows.map(x=>'<div class="weekly-day"><div class="weekly-count">'+x.n+'</div><div class="weekly-track"><i style="height:'+Math.max(3,Math.min(100,Math.round(x.n/goal*100)))+'%"></i></div><small>'+x.label+'</small></div>').join("")+'</div>';
 }
}
const saveGoalButton=$("#saveDailyGoal");
if(saveGoalButton)saveGoalButton.addEventListener("click",()=>{
 const input=$("#dailyGoalInput"),value=Math.max(1,Math.min(500,Math.floor(Number(input.value)||20)));
 localStorage.setItem(STUDY_GOAL_KEY,String(value));notifyCloudSync();renderDailyStudyGoal();
});
function renderWeaknessAnalysis(){
 const rows=readMCQHistory(),groups={};
 rows.forEach(r=>{const name=r.module||"Other";if(!groups[name])groups[name]={total:0,correct:0};groups[name].total++;if(r.isCorrect)groups[name].correct++});
 const box=$("#weaknessAnalysis");if(!box)return;
 const items=Object.keys(groups).map(name=>({name,...groups[name],rate:Math.round(groups[name].correct/groups[name].total*100)})).sort((a,b)=>a.rate-b.rate||b.total-a.total);
 if(!items.length){box.innerHTML='<p class="muted">MCQ अभ्यास गरेपछि विषयगत नतिजा देखिन्छ।</p>';return}
 box.innerHTML=items.map(item=>{
  const status=item.total<3?"थोरै अभ्यास":item.rate<60?"कमजोर पक्ष":item.rate<80?"थप अभ्यास":"राम्रो";
  const cls=item.total<3?"sample":item.rate<60?"weak":item.rate<80?"moderate":"strong";
  return '<article class="weakness-row"><div class="weakness-top"><b>'+item.name+'</b><span class="weakness-tag '+cls+'">'+status+'</span></div><div class="weakness-meta"><span>'+item.correct+'/'+item.total+' सही</span><strong>'+item.rate+'%</strong></div><div class="weakness-track"><span class="'+cls+'" style="width:'+item.rate+'%"></span></div></article>';
 }).join("");
}
function renderMCQDashboard(){
 renderWeaknessAnalysis();
 const rows=readMCQHistory(),groups=new Map();
 rows.forEach(r=>{const key=(r.module||"अन्य")+"::"+(r.question||r.questionKey||"");if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)});
 const latest=[...groups.values()].map(history=>({latest:history[history.length-1],history}));
 const wrong=latest.filter(x=>!x.latest.isCorrect).sort((a,b)=>String(b.latest.date||"").localeCompare(String(a.latest.date||"")));
 const recovered=latest.filter(x=>x.latest.isCorrect&&x.history.some(r=>!r.isCorrect));
 $("#mcqAttemptCount").textContent=rows.length;
 $("#mcqCorrectRate").textContent=(rows.length?Math.round(rows.filter(r=>r.isCorrect).length/rows.length*100):0)+"%";
 $("#wrongQuestionCount").textContent=wrong.length;
 const recoveredCount=$("#recoveredQuestionCount");if(recoveredCount)recoveredCount.textContent=recovered.length;
 const box=$("#wrongQuestionList");
 if(!wrong.length){box.innerHTML='<p class="muted">अहिलेसम्म सुधार गर्न बाँकी गलत प्रश्न छैन। अभ्यास गरेपछि यहाँ देखिन्छ।</p>';}
 else box.innerHTML='<h4>अहिले पनि गलत भइरहेका प्रश्नहरू</h4>'+wrong.slice(0,12).map(x=>{const r=x.latest,prior=x.history.filter(y=>!y.isCorrect).length;return '<article class="wrong-item"><b>'+r.module+' • '+(r.topic||"")+'</b><p>'+r.question+'</p><small>पछिल्लो उत्तर: '+(r.selected||"उत्तर नदिएको")+' | सही उत्तर: '+(r.correctAnswer||"—")+' • गलत इतिहास: '+prior+' पटक</small><p class="wrong-explain">'+(r.explanation||"")+' '+(r.explanationNp||"")+'</p></article>'}).join("");
 const recoveredBox=$("#recoveredQuestionList");
 if(recoveredBox)recoveredBox.innerHTML=recovered.length?recovered.slice(0,8).map(x=>{const r=x.latest,prior=x.history.filter(y=>!y.isCorrect).length;return '<article class="recovered-item"><b>'+r.module+' • '+(r.topic||"")+'</b><p>'+r.question+'</p><small>पहिले '+prior+' पटक गलत, पछिल्लो पटक सही ✓</small></article>'}).join(""):'<p class="muted">पहिले गलत भएका प्रश्न पछि सही गरेपछि यहाँ सुधार देखिन्छ।</p>';
}
const profileForm=$("#studentProfileForm");
if(profileForm)profileForm.addEventListener("submit",e=>{
 e.preventDefault();
 const profile={name:$("#studentName").value.trim().slice(0,50),target:$("#targetExam").value};
 localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
 renderStudentProfile();
});
// Save each faculty's last study position for resume after visiting Home.
const HLP_FACULTY_RESUME_KEY="dhpn-faculty-resume-v1";
function readFacultyResume(){try{return JSON.parse(localStorage.getItem(HLP_FACULTY_RESUME_KEY)||"{}")}catch(e){return {}}}
function writeFacultyResume(tab,y){try{const data=readFacultyResume();data[tab]={y:Math.max(0,Number(y)||0),savedAt:Date.now()};localStorage.setItem(HLP_FACULTY_RESUME_KEY,JSON.stringify(data))}catch(e){}}
let hlpResumeTick=false;
window.addEventListener("scroll",()=>{if(hlpResumeTick)return;hlpResumeTick=true;requestAnimationFrame(()=>{hlpResumeTick=false;const tab=window.__hlpLastFacultyTab;if(tab&&document.body.dataset.appPage==="faculty")writeFacultyResume(tab,window.scrollY);});},{passive:true});
function showTab(tab,fromBrowserBack=false){
  if(!fromBrowserBack)window.__hlpFacultyBackIntercepted=false;
  $(".view").forEach(v=>{v.classList.add("hidden");v.style.removeProperty("display");v.setAttribute("aria-hidden","true");});
  const target=$("#"+tab+"View");
  if(!target)return;
  if(!fromBrowserBack){try{history.pushState({hlpTab:tab},"");}catch(e){}}
  const isFacultyTab=!['notes','practice','mock','home'].includes(tab);
  if(isFacultyTab)window.__hlpLastFacultyTab=tab;
  else if(tab==='home'&&document.body.dataset.appPage==='faculty'&&window.__hlpLastFacultyTab)writeFacultyResume(window.__hlpLastFacultyTab,window.scrollY);
  target.classList.remove("hidden");
  // Faculty/course pages must take over the screen, even when entered from the Courses tab.
  // This prevents the Courses-only CSS from hiding NHPC/HA/Dental Hygiene study panels.
  document.body.dataset.appPage=(tab==="notes"?"notes":(tab==="practice"||tab==="mock"?"practice":"faculty"));
  if(!["notes","practice","mock","home"].includes(tab)){
    document.body.dataset.appPage="faculty";
    document.body.classList.add("study-screen-open");
    target.style.display="block";
    target.setAttribute("aria-hidden","false");
  }
  document.body.classList.toggle("study-screen-open",tab!=="home");
  const facultyBack=$("#facultyBackButton");if(facultyBack)facultyBack.classList.toggle("hidden",tab==="home");
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  document.querySelectorAll("[data-bottom-nav]").forEach(item=>{const key=item.dataset.bottomNav;const active=(key==="notes"&&tab==="notes")||(key==="practice"&&(tab==="practice"||tab==="mock"))||(key==="courses"&&document.body.dataset.appPage==="faculty");item.classList.toggle("is-active",active);if(active)item.setAttribute("aria-current","page");else item.removeAttribute("aria-current");});
  if(tab==="practice") renderPractice();
  if(tab==="notes") renderNotes();
  // Always open a newly selected faculty from the top. Never restore the old
  // faculty scroll offset here: it can land students halfway down a new study screen.
  window.scrollTo({top:0,left:0,behavior:"instant"});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    window.scrollTo({top:0,left:0,behavior:"instant"});
    target.scrollIntoView({behavior:"instant",block:"start"});
  }));
}
/* Universal faculty screen focus: whenever a faculty replaces its study view or opens a tab panel,
   bring that selected content to the top so it is visible immediately on mobile and desktop. */
(function(){
 const roots="#physiotherapyContent,#haContent,#ophthalmicContent,#mltContent,#anesthesiaContent,#ottContent,#radiotherapyContent,#radiographyContent,#bmltContent,#dentalMaterialsContent,#dhaContent";
 const focus=el=>{
  if(!el||!el.isConnected||el.offsetParent===null)return;
  requestAnimationFrame(()=>{
   if(!el.isConnected||el.offsetParent===null)return;
   const y=el.getBoundingClientRect().top+window.scrollY-8;
   window.scrollTo({top:Math.max(0,y),left:0,behavior:"instant"});
  });
 };
 document.querySelectorAll(roots).forEach(root=>{
  new MutationObserver(records=>{
   if(records.some(r=>r.type==="childList"&&r.target===root))focus(root);
  }).observe(root,{childList:true});
  new MutationObserver(()=>{
   const visible=[...root.querySelectorAll(".op-panel,.dha-panel")].find(p=>!p.classList.contains("hidden")&&p.offsetParent!==null);
   if(visible)focus(visible);else if(root.querySelector(".op-panel,.dha-panel"))focus(root);
  }).observe(root,{subtree:true,attributes:true,attributeFilter:["class"]});
 });
})();
/* Universal study back control: closes Notes/MCQ/Mock first, then returns to the previous screen. */
(function(){
 if(document.getElementById("dhpnUniversalBack"))return;
 const back=document.createElement("button");
 back.id="dhpnUniversalBack";back.type="button";back.textContent="← Back";
 back.setAttribute("aria-label","Back to previous study screen");
 back.style.cssText="position:fixed;left:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:10050;display:none;padding:10px 16px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#0f3b5d;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(15,23,42,.18);";
 document.body.appendChild(back);
 const activePanel=()=>["nhpcNotesArea","nhpcMcqArea","nhpcFullMock"].find(id=>{const el=document.getElementById(id);return el&&!el.classList.contains("hidden")&&el.offsetParent!==null;});
 const goBack=()=>{
  const panel=activePanel();
  if(panel){const close=document.getElementById(panel==="nhpcNotesArea"?"nhpcCloseNotes":panel==="nhpcMcqArea"?"nhpcCloseMcq":"nhpcCloseMock");if(close){close.click();return;}}
  // Faculty Back first returns to the module navigation instead of Home.
  if(document.body.dataset.appPage==="faculty"){
   const view=[...document.querySelectorAll(".view")].find(v=>!v.classList.contains("hidden")&&v.getAttribute("aria-hidden")!=="true");
   const moduleRoot=view&&view.querySelector("#ophthalmicContent,#haContent,#physiotherapyContent,#bmltContent,#dentalMaterialsContent,#dhaContent");
   const target=moduleRoot||view;
   if(moduleRoot){
    // Return to the active faculty's own landing/menu screen before leaving the faculty.
    const menuButton=moduleRoot.querySelector('[data-ha="menu"],[data-mode="overview"],[data-oph="studyGuide"],[data-oph="syllabus"]');
    if(menuButton){menuButton.click();return;}
    // Panel-based faculties keep their feature/menu cards outside the content panels.
    const panels=moduleRoot.querySelectorAll(".op-panel,.dha-panel");
    if(panels.length){
     panels.forEach(p=>p.classList.add("hidden"));
     ["bmltMockIntro","dmMockIntro","dhaMockIntro"].forEach(id=>moduleRoot.querySelector("#"+id)?.classList.remove("hidden"));
     const menuCard=moduleRoot.querySelector(".feature-card");
     if(menuCard){menuCard.scrollIntoView({behavior:"smooth",block:"center"});return;}
    }
    target.scrollIntoView({behavior:"smooth",block:"start"});return;
   }
   if(target){target.scrollIntoView({behavior:"smooth",block:"start"});return;}
  }
  if(history.state&&history.state.hlpTab&&history.state.hlpTab!=="home"&&history.length>1){history.back();return;}
  if(typeof showTab==="function")showTab("home");
 };
 back.addEventListener("click",goBack);
 document.addEventListener("click",e=>{
  if(e.target.closest("#nhpcStartNotes,#nhpcStartMcq,#nhpcStartFullMock")){try{history.pushState({...history.state,hlpSub:"study"},"");}catch(err){}}
 },true);
 const sync=()=>{back.style.display=document.body.classList.contains("study-screen-open")||!!activePanel()?"block":"none";};
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class","data-app-page"],subtree:true,childList:true});
 sync();
 window.__dhpnUniversalStudyBack=goBack;
})();
document.addEventListener("click",e=>{
  const category=e.target.closest("[data-exam-category]");
  if(!category)return;
  e.preventDefault();
  const panel=document.getElementById(category.getAttribute("aria-controls"));
  if(!panel)return;
  const opening=panel.classList.contains("hidden");
  panel.classList.toggle("hidden",!opening);
  category.setAttribute("aria-expanded",String(opening));
  category.classList.toggle("is-open",opening);
  if(opening)requestAnimationFrame(()=>panel.scrollIntoView({behavior:"smooth",block:"nearest"}));
});
document.addEventListener("click",e=>{
  const jump=e.target.closest("[data-scroll-nhpc-directory]");
  if(!jump)return;
  e.preventDefault();
  const directory=document.querySelector(".nhpc-directory");
  if(directory)directory.scrollIntoView({behavior:"smooth",block:"start"});
});
document.addEventListener("click",e=>{const tabButton=e.target.closest(".track-card[data-tab]");if(!tabButton||tabButton.dataset.hlpLazyReady!=="1")return;e.preventDefault();showTab(tabButton.dataset.tab);},true);
document.addEventListener("click",e=>{const back=e.target.closest("#facultyBackButton");if(!back)return;e.preventDefault();if(history.state&&history.state.hlpTab)history.back();else showTab("home");});
if(!window.__hlpPopstateBound){window.__hlpPopstateBound=true;try{if(!history.state||!history.state.hlpTab)history.replaceState({hlpTab:"home"},"");}catch(e){}window.addEventListener("popstate",e=>{
 // Bottom-navigation history belongs to showAppPage(); avoid routing the same event twice.
 // Faculty history still passes through this handler so its first Back returns to the faculty menu.
 if(document.body.dataset.appPage!=="faculty"&&e.state&&["home","courses","notes","practice","profile"].includes(e.state.hlpTab))return;
 // Close an open study panel before leaving its faculty or returning Home.
 const panel=["nhpcNotesArea","nhpcMcqArea","nhpcFullMock"].find(id=>{const el=document.getElementById(id);return el&&!el.classList.contains("hidden")&&el.offsetParent!==null;});
 if(panel){e.stopImmediatePropagation();try{history.pushState({...e.state,hlpTab:window.__hlpLastFacultyTab||"home",hlpSub:"study"},"");}catch(err){}const close=document.getElementById(panel==="nhpcNotesArea"?"nhpcCloseNotes":panel==="nhpcMcqArea"?"nhpcCloseMcq":"nhpcCloseMock");close?.click();return;}
 // First device-Back from a faculty returns to its own menu/overview, not Home.
 if(document.body.dataset.appPage==="faculty"&&(!e.state||e.state.hlpTab==="home")&&!window.__hlpFacultyBackIntercepted){window.__hlpFacultyBackIntercepted=true;e.stopImmediatePropagation();const view=[...document.querySelectorAll(".view")].find(v=>!v.classList.contains("hidden")&&v.getAttribute("aria-hidden")!=="true");const tab=view&&view.id.endsWith("View")?view.id.slice(0,-4):"home";try{history.pushState({hlpTab:tab,hlpSub:"faculty-menu"},"");}catch(err){}const moduleRoot=view&&view.querySelector("#ophthalmicContent,#haContent,#physiotherapyContent,#bmltContent,#dentalMaterialsContent,#dhaContent");const menuButton=moduleRoot&&moduleRoot.querySelector('[data-ha="menu"],[data-mode="overview"],[data-oph="studyGuide"],[data-oph="syllabus"]');if(menuButton)menuButton.click();else{moduleRoot?.querySelectorAll(".op-panel,.dha-panel").forEach(p=>p.classList.add("hidden"));(moduleRoot||view)?.scrollIntoView({behavior:"smooth",block:"start"});}return;}
 const tab=e.state&&e.state.hlpTab;showTab(tab||"home",true);
});}
document.addEventListener("click",e=>{
  const back=e.target.closest("[data-back-exams]");
  if(!back)return;
  showTab("home");
  const tracks=document.querySelector(".exam-tracks");
  if(tracks)tracks.scrollIntoView({behavior:"smooth",block:"start"});
});
document.addEventListener("click",e=>{
 const back=e.target.closest("[data-back-subjects]");if(!back||back.dataset.backToHub==="1")return;
 e.preventDefault();showTab("home");
 requestAnimationFrame(()=>{const directory=document.querySelector(".subject-directory");if(directory)directory.scrollIntoView({behavior:"instant",block:"start"});});
});
document.addEventListener("click",e=>{
 const card=e.target.closest(".subject-card");
 if(card){e.preventDefault();showSubjectHub(card.dataset.go);return;}
 const go=e.target.closest("[data-go]");
 if(go){e.preventDefault();showTab(go.dataset.go);}
});
document.addEventListener("click",e=>{
 const action=e.target.closest("[data-study-action]");if(!action)return;
 e.preventDefault();
 const target=action.dataset.studyAction;
 const title=subjectMeta[activeDentalSubject]?.[0]||"Dental Hygiene";
 sessionStorage.setItem("dhpn-active-subject",activeDentalSubject);
 // Basic Periodontology uses the complete NHPC learning bank, not the small legacy demo set.
 if(activeDentalSubject==="basicPeriodontology"){
  showTab("nhpc");
  const control=document.getElementById(target==="notes"?"nhpcStartNotes":target==="practice"?"nhpcStartMcq":"nhpcStartFullMock");
  if(control){control.click();return;}
  const heading=document.querySelector("#nhpcView h2");
  if(heading)heading.textContent=title;
  return;
 }
 showTab(target);
 const heading=document.querySelector("#"+target+"View h2");
 if(heading)heading.textContent=title+" — "+(target==="notes"?"Study Notes":target==="practice"?"MCQ Practice":"Mock Test");
 const back=document.querySelector("#"+target+"View [data-back-subjects]");
 if(back){back.textContent="← "+title+" मा फर्कनुहोस्";back.dataset.backToHub="1";}
});
document.addEventListener("click",e=>{
 const back=e.target.closest("[data-back-to-hub]");if(!back)return;
 e.preventDefault();showSubjectHub(activeDentalSubject);
});
const subjectSearch=$("#subjectSearch");
const searchResults=$("#searchResults");
function openSearchResult(result){
  if(!result)return;
  const destination=result.dataset.go||result.dataset.tab;
  if(!destination)return;
  showTab(destination);
  searchResults.classList.add("hidden");
  subjectSearch.blur();
}
if(searchResults){
  searchResults.addEventListener("click",e=>{
    const result=e.target.closest(".search-result");
    if(result)openSearchResult(result);
  });
}
const searchSubmit=$("#searchSubmit");
function resolveDirectSearchDestination(term){
  const q=term.toLocaleLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g," ").trim();
  if(q.includes("dental pharmacy")||q==="pharmacy"||q.includes("डेन्टल फार्मेसी")||q.includes("औषधि"))return "dentalPharmacy";
  return "";
}
function navigateSearchTerm(){
  if(!subjectSearch)return false;
  const term=subjectSearch.value.trim();
  if(!term)return false;
  const direct=resolveDirectSearchDestination(term);
  if(direct){
    showTab(direct);
    if(searchResults)searchResults.classList.add("hidden");
    subjectSearch.blur();
    return true;
  }
  const first=searchResults&&searchResults.querySelector(".search-result");
  if(first){openSearchResult(first);return true;}
  subjectSearch.dispatchEvent(new Event("input",{bubbles:true}));
  const next=searchResults&&searchResults.querySelector(".search-result");
  if(next){openSearchResult(next);return true;}
  return false;
}
function submitSubjectSearch(){
  if(!subjectSearch)return;
  if(!subjectSearch.value.trim()){subjectSearch.focus();return;}
  navigateSearchTerm();
}
if(searchSubmit)searchSubmit.addEventListener("click",submitSubjectSearch);
if(subjectSearch&&searchResults){
  subjectSearch.addEventListener("input",()=>{
    const term=subjectSearch.value.trim().toLocaleLowerCase();
    searchResults.innerHTML="";
    if(!term){searchResults.classList.add("hidden");return;}
    const subjectCards=$$("#subjectGrid .subject-card");
    const trackCards=$$(".track-grid .track-card");
    const matches=[
      ...subjectCards.map(card=>({name:card.querySelector("b")?.textContent||card.dataset.subject||"",type:"विषय",action:"go",value:card.dataset.go,haystack:((card.dataset.subject||"")+" "+card.textContent).toLocaleLowerCase()})),
      ...trackCards.map(card=>({name:card.querySelector("b")?.textContent||"",type:"परीक्षा तयारी",action:"tab",value:card.dataset.tab,haystack:card.textContent.toLocaleLowerCase()}))
    ].filter(item=>item.value&&item.haystack.includes(term));
    if(!matches.length){
      searchResults.innerHTML='<p class="search-empty">मिल्दो विषय वा परीक्षा भेटिएन। अर्को शब्द खोज्नुहोस्।</p>';
    }else{
      matches.slice(0,12).forEach(item=>{
        const button=document.createElement("button");
        button.type="button";
        button.className="search-result";
        button.dataset[item.action==="go"?"go":"tab"]=item.value;
        const title=document.createElement("b");title.textContent=item.name;
        const kind=document.createElement("small");kind.textContent=item.type;
        button.append(title,kind);
        searchResults.append(button);
      });
    }
    searchResults.classList.remove("hidden");
  });
  subjectSearch.addEventListener("search",()=>{subjectSearch.dispatchEvent(new Event("input",{bubbles:true}));});
  subjectSearch.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      e.preventDefault();
      navigateSearchTerm();
    }else if(e.key==="Escape"){
      searchResults.classList.add("hidden");
    }
  });
}
function renderNotes(){
  $("#notesList").innerHTML=NOTES.map(n=>`<article class="note"><h3>${n[0]}</h3><p>${n[1]}</p><p class="np">${n[2]}</p></article>`).join("");
}
function qText(q){const mode=$("#languageMode").value;return `<h3>${q[0]}</h3>${mode!=="en"?`<p class="translation">${q[1]}</p>`:""}`}
function renderPractice(){
  const q=practiceQuestions[practiceIndex], chosen=practiceAnswered[practiceIndex];
  $("#practiceCount").textContent=`${practiceIndex+1} / ${practiceQuestions.length}`;
  $("#quizArea").innerHTML=`<article class="question"><div class="qtop"><span>PERIODONTOLOGY • MCQ ${practiceIndex+1}</span><span>${chosen===undefined?"Not answered":"Answered"}</span></div>${qText(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${chosen!==undefined&&i===q[3]?"correct":chosen===i&&chosen!==q[3]?"wrong":""}" data-answer="${i}" ${chosen!==undefined?"disabled":""}>${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>${chosen!==undefined?`<div class="feedback ${chosen===q[3]?"good":"bad"}"><b>${chosen===q[3]?"Correct!":"Not quite. Correct answer: "+q[2][q[3]]}</b>${q[4]}<br><br>${q[5]}</div>`:""}<div class="nextrow"><button class="smallbtn" id="prevQ" ${practiceIndex===0?"disabled":""}>Previous</button><button class="smallbtn" id="nextQ">${practiceIndex===practiceQuestions.length-1?"Restart set":"Next question"}</button></div></article>`;
  $$("#quizArea [data-answer]").forEach(btn=>btn.addEventListener("click",()=>answerPractice(Number(btn.dataset.answer))));
  $("#prevQ").addEventListener("click",()=>{practiceIndex=Math.max(0,practiceIndex-1);renderPractice()});
  $("#nextQ").addEventListener("click",()=>{practiceIndex=practiceIndex===practiceQuestions.length-1?0:practiceIndex+1;renderPractice()});
}
function answerPractice(choice){
  if(practiceAnswered[practiceIndex]!==undefined)return;
  practiceAnswered[practiceIndex]=choice;saved.attempted++;if(choice===QUESTIONS[practiceIndex][3])saved.correct++;window.DHPNProgress.recordMCQ("Basic Periodontology",QUESTIONS[practiceIndex],choice);persist();renderPractice();
}
$("#languageMode").addEventListener("change",renderPractice);
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
$("#startMock").addEventListener("click",startMock);
function startMock(){
  clearInterval(mockTimer);mockQuestions=shuffle(mockBankQuestions).slice(0,10);mockIndex=0;mockAnswers={};secondsLeft=600;
  $("#mockIntro").classList.add("hidden");renderMock();
  mockTimer=setInterval(()=>{secondsLeft--;const t=$("#timer");if(t)t.textContent=`${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,"0")}`;if(secondsLeft<=0)finishMock()},1000);
}
function renderMock(){
  if(mockIndex>=mockQuestions.length){finishMock();return}
  const q=mockQuestions[mockIndex];
  $("#mockArea").innerHTML=`<div class="qtop"><span>QUESTION ${mockIndex+1} OF 10</span><span class="timer" id="timer">${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,"0")}</span></div><article class="question">${qText(q)}<div class="options">${q[2].map((o,i)=>`<button class="option" data-mock="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div><div class="nextrow"><span class="muted">Choose one answer</span><button class="smallbtn" id="mockNext">Next</button></div></article>`;
  $$("#mockArea [data-mock]").forEach(b=>b.addEventListener("click",()=>{mockAnswers[mockIndex]=Number(b.dataset.mock);$$("#mockArea [data-mock]").forEach(x=>{x.classList.toggle("correct",Number(x.dataset.mock)===q[3]);x.classList.toggle("wrong",Number(x.dataset.mock)===mockAnswers[mockIndex]&&mockAnswers[mockIndex]!==q[3])});}));
  $("#mockNext").addEventListener("click",()=>{mockIndex++;renderMock()});
}
function finishMock(){
  clearInterval(mockTimer);let score=0;mockQuestions.forEach((q,i)=>{if(mockAnswers[i]===q[3])score++});
  saved.attempted+=10;saved.correct+=score;saved.best=Math.max(saved.best,score*10);persist();
  $("#mockArea").innerHTML=`<div class="result"><p>MOCK TEST COMPLETED</p><strong>${score}/10</strong><b>${score*10}%</b><p>${score>=8?"Excellent effort!":score>=5?"Good attempt. Review the explanations.":"Keep practising. Revise the notes and try again."}</p><button class="primary" id="reviewMock">Review answers</button> <button class="secondary" id="againMock">Try again</button></div><div id="reviewList"></div>`;
  $("#reviewMock").addEventListener("click",()=>{$("#reviewList").innerHTML=mockQuestions.map((q,i)=>`<article class="note answer-review ${mockAnswers[i]===q[3]?"review-correct":"review-wrong"}"><h3>${i+1}. ${q[0]}</h3><p>Your answer: ${mockAnswers[i]===undefined?"Not answered":q[2][mockAnswers[i]]}</p><p><b>Correct: ${q[2][q[3]]}</b></p><p>${q[4]} ${q[5]}</p><span class="pill">${mockAnswers[i]===q[3]?"Correct ✓":"Incorrect / unanswered"}</span></article>`).join("")});
  $("#againMock").addEventListener("click",()=>{ $("#mockIntro").classList.remove("hidden");$("#mockArea").innerHTML="";});
  $("#mockIntro").classList.remove("hidden");
}

const subjectMeta={
 basicPeriodontology:["Basic Periodontology","Periodontium • Gingivitis • Periodontitis","🦷"],
 oralPath:["Oral Pathology and Microbiology","Oral diseases • Microorganisms","🔬"],
 dentalMaterials:["Dental Materials, Instruments and Assisting","Materials • Instruments • Chairside assisting","🧰"],
 oralAnatomy:["Oral Anatomy and Physiology","Teeth • Oral structures • Functions","🦴"],
 dentalPublicHealth:["Dental Public Health and Community Dentistry","Prevention • Health promotion","🌍"],
 dentalRadiology:["Dental Radiography and Photography","Imaging • Radiation protection","📷"],
 dentalPharmacy:["Dental Pharmacy","Medicines • Pharmacology","💊"],
 dentalEthics:["Dental Ethics and Practice Management","Ethics • Records • Patient safety","📋"],
 foodNutrition:["Food and Nutrition","Nutrients • Balanced diet","🥗"],
 epidemiology:["Epidemiology and Community Diagnosis","Incidence • Prevalence • Community survey","📊"],
 bmlt:["BMLT NHPC Licensing","Medical Microbiology • Clinical Biochemistry • Hematology","🧪"]
};
let activeDentalSubject="home";
function ensureNHPCModuleLoaded(){
 if(typeof window.DHPNOpenNHPCStudyTopic==="function")return Promise.resolve();
 if(window.__hlpNHPCModulePromise)return window.__hlpNHPCModulePromise;
 window.__hlpNHPCModulePromise=new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  script.src="nhpc.js?v=225";
  script.onload=()=>resolve();
  script.onerror=()=>{window.__hlpNHPCModulePromise=null;reject(new Error("NHPC module failed to load"));};
  document.head.appendChild(script);
 });
 return window.__hlpNHPCModulePromise;
}
async function showSubjectHub(id){
 const meta=subjectMeta[id];if(!meta)return;
 activeDentalSubject=id;
 if(id==="basicPeriodontology"){
  try{await ensureNHPCModuleLoaded();}
  catch(error){alert("NHPC सामग्री लोड भएन। Internet जाँचेर फेरि प्रयास गर्नुहोस्।");return;}
  showTab("nhpc");
  return;
 }
 const view=document.getElementById(id+"View");if(!view)return;
 showTab(id);
}

updateStats();renderDashboard();renderExamTrackProgress();renderStudentProfile();renderMCQDashboard();renderDailyStudyGoal();renderExamReadiness();renderNotes();
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  let updateRegistration=null,updateBanner=null,reloadAfterUpdate=false;
  const showUpdateNotice=()=>{
    if(updateBanner||!updateRegistration?.waiting)return;
    updateBanner=document.createElement("aside");
    updateBanner.setAttribute("role","status");
    updateBanner.style.cssText="position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;background:#102b46;color:#fff;padding:14px;border-radius:14px;box-shadow:0 8px 28px #0004;display:flex;gap:12px;align-items:center;justify-content:space-between;font:14px/1.45 system-ui,sans-serif";
    const message=document.createElement("span");
    message.textContent="नयाँ अपडेट उपलब्ध छ। पढाइ सुरक्षित राख्न तयार भएपछि मात्र अपडेट गर्नुहोस्।";
    const button=document.createElement("button");
    button.type="button";button.textContent="Update Now";
    button.style.cssText="border:0;border-radius:9px;padding:10px 13px;background:#fff;color:#102b46;font-weight:700;white-space:nowrap";
    button.addEventListener("click",()=>{
      if(document.querySelector(".timer")){
        alert("Mock Test चलिरहेको छ। परीक्षा पूरा गरेपछि Update Now थिच्नुहोस्।");
        return;
      }
      if(!updateRegistration?.waiting)return;
      button.disabled=true;button.textContent="Updating…";
      reloadAfterUpdate=true;
      updateRegistration.waiting.postMessage({type:"SKIP_WAITING"});
    });
    updateBanner.append(message,button);document.body.appendChild(updateBanner);
  };
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!reloadAfterUpdate)return;
    reloadAfterUpdate=false;
    location.reload();
  });
  navigator.serviceWorker.register("./sw.js").then(reg=>{
    updateRegistration=reg;
    if(reg.waiting&&navigator.serviceWorker.controller)showUpdateNotice();
    reg.addEventListener("updatefound",()=>{
      const worker=reg.installing;if(!worker)return;
      worker.addEventListener("statechange",()=>{
        if(worker.state==="installed"&&navigator.serviceWorker.controller)showUpdateNotice();
      });
    });
    reg.update().catch(()=>{});
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="visible")reg.update().catch(()=>{});
    });
  }).catch(()=>{});
}
// Universal foreground navigation for faculty study menus (Notes, MCQ, Mock, topics, sets).
document.addEventListener("click",event=>{
 const button=event.target.closest("button,[role=button],a");
 if(!button)return;
 // HA has its own delegated interaction controller; keep generic faculty navigation out.
 if(button.closest("#haView"))return;
 // Ignore answer choices and question-to-question controls; those should not jump the page.
 if(button.matches('[data-answer],[data-mock],[data-bmlta],[data-bmltm],[data-dha-answer],[data-dha-mock],[data-ha-option],[data-oph-answer],[data-oph-mock-answer],[data-oph-mock-go]') ||
    /^(next|prev|previous|submit|review|restart|try again|retake)$/i.test((button.textContent||"").trim()))return;
 const view=button.closest(".view")||button.closest("main")||button.closest("[data-faculty-root]");
 if(!view)return;
 const ds=button.dataset||{};
 const keys=Object.keys(ds);
 const values=Object.values(ds).map(v=>String(v).toLowerCase());
 const label=(button.textContent||"").toLowerCase();
 const isStudyAction=
   button.classList.contains("feature-card") ||
   button.closest(".ha-actions,.module-actions,.feature-grid") ||
   keys.some(k=>/^(data)?(ha|mlt|bmlt|dha|oph|rt|ott|pt|rad|op|dm|oa|dph|dr|dp|de|fn|ec|nhpc|action)$/i.test(k)) ||
   values.some(v=>/^(notes|practice|mcq|mock|timed|syllabus|topic|sets?|set|imagingpractice|imagingmock|radiationpractice|radiationmock|equipmentpractice|equipmentmock|advancedpractice|advancedmock|corepractice|coremock)$/.test(v)) ||
   /mcq practice|mock test|full syllabus mock|study notes|detailed notes|topic\s*\d|set\s*\d/i.test(label);
 if(!isStudyAction)return;
 view.classList.add("study-focused");
 // Faculty scripts render asynchronously after their click handlers; wait for the DOM to settle.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const selectors=[
   '[id$="Content"]','.op-panel:not(.hidden)','.dha-panel:not(.hidden)',
   '.ha-question','.ha-note','.ha-overview','.question',
   '.mcq-container:not(.hidden)','.quiz-container:not(.hidden)',
   '[class*="practice"]:not(.hidden)','[class*="mock"]:not(.hidden)'
  ];
  let target=null;
  for(const selector of selectors){
   target=[...view.querySelectorAll(selector)].find(el=>el.getClientRects().length);
   if(target)break;
  }
  if(!target)target=button;
  const y=target.getBoundingClientRect().top+window.scrollY-72;
  window.scrollTo({top:Math.max(0,y),left:0,behavior:"smooth"});
 }));
},true);

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("#installBtn").classList.add("hidden")});


// Light/Dark theme preference
(function(){
 const root=document.documentElement,button=document.getElementById("themeToggle");
 let theme="light";
 try{theme=localStorage.getItem("dhpn-theme")||"light"}catch(e){}
 function applyTheme(value){
  theme=value==="dark"?"dark":"light";
  root.setAttribute("data-theme",theme);
  if(button){button.textContent=theme==="dark"?"☀️":"🌙";button.title=theme==="dark"?"Switch to light theme":"Switch to dark theme";button.setAttribute("aria-label",button.title)}
  try{localStorage.setItem("dhpn-theme",theme)}catch(e){}
 }
 applyTheme(theme);
 if(button)button.addEventListener("click",()=>applyTheme(theme==="dark"?"light":"dark"));
})();

document.addEventListener("click",event=>{if(event.target.closest("#showWrongAnswers"))window.DHPNReviewWrongAnswers();});



/* Course-page shortcut to the scheduled live exam area. */
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-open-weekly-exam]");
  if(!button)return;
  event.preventDefault();
  if(typeof showAppPage==="function")showAppPage("practice");
  requestAnimationFrame(()=>{
    const live=document.getElementById("weeklyLiveExam");
    if(live)live.scrollIntoView({behavior:"smooth",block:"start"});
  });
});

/* App page routing: each bottom item opens a focused, separate page */
function showAppPage(page, push=true){
  const allowed=["home","courses","notes","practice","profile"];
  if(!allowed.includes(page))page="home";
  if(document.body.dataset.appPage==="faculty"&&window.__hlpLastFacultyTab)writeFacultyResume(window.__hlpLastFacultyTab,window.scrollY);
  document.body.dataset.appPage=page;
  document.body.classList.toggle("study-screen-open",page==="notes"||page==="practice"||page==="faculty");
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  if(page==="notes"){
    const v=document.getElementById("notesView");if(v)v.classList.remove("hidden");
    if(typeof renderNotes==="function")renderNotes();
    const heading=document.querySelector("#notesView h2");
    if(heading&&typeof subjectMeta!=="undefined"&&subjectMeta[activeDentalSubject])heading.textContent=(subjectMeta[activeDentalSubject][0]||"Selected Subject")+" — Study Notes";
  }else if(page==="practice"){
    ["practiceView","mockView"].forEach(id=>{const v=document.getElementById(id);if(v)v.classList.remove("hidden");});
    if(typeof renderPractice==="function")renderPractice();
  }
  document.querySelectorAll("#hlBottomNav [data-bottom-nav]").forEach(b=>{
    const active=b.dataset.bottomNav===page;
    b.classList.toggle("is-active",active);
    if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
  });
  const back=document.getElementById("facultyBackButton");if(back)back.classList.add("hidden");
  const accountPanel=document.getElementById("accountPanel");
  const signedInPanel=document.getElementById("signedInPanel");
  // Keep all account actions inside the Profile page.
  if(accountPanel)accountPanel.classList.toggle("hidden",!!window.HLPAuthUser);
  if(signedInPanel)signedInPanel.classList.toggle("hidden",!window.HLPAuthUser);
  const loginPrompt=document.getElementById("profileLoginPrompt");if(loginPrompt)loginPrompt.classList.toggle("hidden",!!window.HLPAuthUser);
  if(page==="profile"){
    const profileHeading=document.querySelector(".profile-card h2");
    if(profileHeading)profileHeading.textContent="विद्यार्थी प्रोफाइल र गतिविधि";
  }
  if(push){try{history.pushState({hlpTab:page},"");}catch(e){}}
  window.scrollTo({top:0,left:0,behavior:"auto"});
}
document.addEventListener("click",event=>{
  const nav=event.target.closest&&event.target.closest("#hlBottomNav [data-bottom-nav]");
  if(nav){event.preventDefault();event.stopImmediatePropagation();showAppPage(nav.dataset.bottomNav);return;}
  const go=event.target.closest&&event.target.closest("[data-go]");
  if(go&&["notes","practice","mock"].includes(go.dataset.go)){
    event.preventDefault();event.stopImmediatePropagation();
    showAppPage(go.dataset.go==="notes"?"notes":"practice");return;
  }
},true);
window.addEventListener("popstate",event=>{
  // Faculty/study navigation is handled by the faculty popstate router above.
  // Do not let this bottom-tab handler overwrite its Back destination.
  if(document.body.dataset.appPage==="faculty")return;
  const page=event.state&&event.state.hlpTab;
  if(page&&["home","courses","notes","practice","profile"].includes(page))showAppPage(page,false);
});


/* Faculty tap recovery: route card taps at window capture, before document-level
   handlers or overlays can cancel the navigation. */
window.addEventListener("click", function(event){
  const card = event.target && event.target.closest ? event.target.closest(".track-card[data-tab]") : null;
  // Let index.html load the faculty module on the first click. The marked
  // synthetic click is routed here only after the module has loaded.
  if(!card || card.dataset.hlpLazyReady!=="1") return;
  const tab = card.getAttribute("data-tab");
  if(!tab || !document.getElementById(tab + "View")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showTab(tab);
}, true);

// Refresh progress summaries after a cloud merge without interrupting an active study screen.
window.addEventListener("dhpn:progress-restored",()=>{
  ["updateStats","renderDashboard","renderExamTrackProgress","renderMCQDashboard","renderDailyStudyGoal","renderExamReadiness"].forEach(name=>{
    if(typeof window[name]==="function")window[name]();
  });
});
