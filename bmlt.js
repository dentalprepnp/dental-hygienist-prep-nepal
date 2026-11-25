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
      <div id="bmltNotes" class="op-panel hidden"><h2>BMLT NHPC Licensing Notes</h2><div id="bmltNotesList" class="notes-list"></div><div id="bmltStudyGuide"></div></div>
      <div id="bmltPractice" class="op-panel hidden"><div class="section-head"><h2>MCQ Practice</h2><span class="pill" id="bmltCount"></span></div><div id="bmltQuestion"></div></div>
      <div id="bmltMock" class="op-panel hidden"><h2>BMLT NHPC Licensing Mock Test</h2><p class="muted" id="bmltMockIntroText"></p><div id="bmltMockIntro" class="notice"><p>प्रत्येक सेटमा अधिकतम १०० प्रश्न हुन्छन्। परीक्षा बुझाएपछि मात्र सही उत्तर र व्याख्या देखिन्छ।</p><div id="bmltMockSets" class="feature-grid"></div></div><div id="bmltMockArea"></div></div>
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
  function normalizeType(value) {
    const type=String(value||"").trim().toLowerCase().replace(/[ -]+/g,"_");
    if(["note","notes","study_note","study_notes","note_content","notes_content"].includes(type)||/(^|_)notes?($|_)/.test(type))return "note";
    if(["mcq","mcq_practice","practice","practice_mcq","question"].includes(type))return "mcq";
    if(["mock","mock_test","mock_question","mock_questions","mocktest","mock_test_questions","mocktest_questions","mock_exam","mock_exam_questions","mock_mcq","mock_test_mcq","mock_question_bank"].includes(type))return "mock";
    return type;
  }
  function contentTypeOf(row){return row?.content_type??row?.type??row?.contentType??row?.kind??row?.category??"";}
  function contentDataOf(row){let value=row?.content_data??row?.data??row?.content??row?.payload??row?.body??null;if(typeof value==="string"){try{value=JSON.parse(value)}catch(e){}}return value;}
  function contentOrderOf(row){return Number(row?.display_order??row?.order??row?.sort_order??row?.sequence??0)||0;}
  function normalizeQuestion(raw) {
    const row=raw&&typeof raw==="object"?raw:{};
    const options=Array.isArray(row.options)?row.options:
      Array.isArray(row.choices)?row.choices:
      [row.option_a??row.optionA??row.a,row.option_b??row.optionB??row.b,row.option_c??row.optionC??row.c,row.option_d??row.optionD??row.d];
    const cleanOptions=options.filter(x=>x!==undefined&&x!==null).map(String);
    const question=row.question??row.question_en??row.questionEn??row.question_text??row.prompt??row.title??"";
    const translation=row.translation??row.question_ne??row.question_np??row.questionNe??row.questionNp??"";
    let answer=row.correctIndex??row.correct_index??row.answer_index??row.correct_option_index;
    let correctIndex=-1;
    if(answer!==undefined&&answer!==null&&answer!==""){
      const n=Number(answer);
      if(Number.isInteger(n)&&n>=0&&n<cleanOptions.length)correctIndex=n;
      else if(Number.isInteger(n)&&n>=1&&n<=cleanOptions.length&&String(answer).trim()===String(n))correctIndex=n-1;
    }
    if(correctIndex<0){
      const answerText=String(row.correct_answer??row.correctAnswer??row.answer??row.correct_option??"").trim();
      if(answerText){
        const letter=answerText.toUpperCase().match(/^[A-D]$/);
        if(letter)correctIndex=letter[0].charCodeAt(0)-65;
        else correctIndex=cleanOptions.findIndex(option=>option.trim().toLowerCase()===answerText.toLowerCase());
      }
    }
    const explanation=row.explanation??row.explanation_en??row.explanationEn??row.rationale??"";
    const explanationNe=row.explanationNe??row.explanation_ne??row.explanation_np??row.explanationNp??row.rationale_ne??"";
    return {question:String(question),translation:String(translation),options:cleanOptions,correctIndex,explanation:String(explanation),explanationNe:String(explanationNe)};
  }
  function shuffledQuestion(raw) {
    const row=normalizeQuestion(raw);
    if(!row.question||row.options.length<2||row.correctIndex<0||row.correctIndex>=row.options.length){
      console.warn("Skipping invalid BMLT question row",row.question);
      return null;
    }
    const q=[row.question,row.translation,[...row.options],row.correctIndex,row.explanation,row.explanationNe];
    const pairs=q[2].map((option,index)=>({option,index}));
    for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]];}
    q[2]=pairs.map(x=>x.option);
    q[3]=pairs.findIndex(x=>x.index===q[3]);
    return q;
  }
  function normalizeNote(raw) {
    const n=raw&&typeof raw==="object"?raw:{text:raw};
    const sections=Array.isArray(n.sections)?n.sections:[];
    const english=n.english??n.content_en??n.contentEn??n.note_en??n.summary??n.description??n.text??n.content??n.body??"";
    const nepali=n.nepali??n.content_ne??n.content_np??n.note_ne??n.translation??n.explanation_ne??"";
    return {
      title:String(n.title??n.title_en??n.titleEn??n.heading??n.topic??"BMLT Study Note"),
      english:String(english||sections.map(x=>typeof x==="string"?x:(x?.english??x?.en??x?.content??"")).filter(Boolean).join("\n\n")),
      nepali:String(nepali||sections.map(x=>typeof x==="object"?(x?.nepali??x?.ne??""):"").filter(Boolean).join("\n\n"))
    };
  }
  const builtInNotes=[["Laboratory safety","Use PPE, hand hygiene, safe sharps handling and proper waste segregation. Report spills and exposures promptly.","PPE लगाउनुहोस्, हात सफा गर्नुहोस्, सुई सुरक्षित सम्हाल्नुहोस् र फोहोर छुट्याउनुहोस्। Spill वा exposure भए तुरुन्त रिपोर्ट गर्नुहोस्।"],["Biosafety levels","Biosafety practices depend on the organism, procedure and risk assessment. Follow the laboratory biosafety manual.","Biosafety को स्तर जीवाणु, प्रक्रिया र जोखिम मूल्याङ्कनमा निर्भर हुन्छ। प्रयोगशालाको biosafety manual पालना गर्नुहोस्।"],["Specimen identification","Verify at least two patient identifiers and match the request form with the specimen label.","कम्तीमा दुई patient identifiers जाँच्नुहोस् र request form तथा नमुना label मिलाउनुहोस्।"],["Specimen collection","Use the correct specimen type, container, volume and collection technique for each test.","हरेक परीक्षणका लागि सही नमुना, कन्टेनर, मात्रा र संकलन विधि अपनाउनुहोस्।"],["Specimen transport","Transport specimens promptly at the required temperature and in leak-proof packaging.","नमुनालाई आवश्यक तापक्रममा छिटो र चुहावट नहुने प्याकेजिङमा पठाउनुहोस्।"],["Specimen rejection","Reject or request recollection for unlabeled, leaking, unsuitable or improperly collected specimens according to SOP.","Label नभएको, चुहिएको वा गलत तरिकाले संकलित नमुना SOP अनुसार अस्वीकार गरी पुनः संकलन माग्नुहोस्।"],["Pre-analytical errors","Patient preparation, collection, labeling and transport errors can affect results before analysis begins.","बिरामी तयारी, संकलन, labeling र ढुवानीका त्रुटिले परीक्षणअघि नै नतिजा बिगार्न सक्छन्।"],["Analytical phase","Use validated methods, calibrated instruments, suitable reagents and documented procedures.","प्रमाणित विधि, calibrated उपकरण, उपयुक्त reagent र अभिलेखित प्रक्रिया प्रयोग गर्नुहोस्।"],["Post-analytical phase","Check results, units, reference intervals and critical values before authorized release.","अधिकृत रूपमा नतिजा जारी गर्नुअघि result, unit, reference interval र critical value जाँच्नुहोस्।"],["Quality control","Run internal QC at defined intervals and investigate out-of-control results before reporting patient results.","निर्धारित समयमा internal QC गर्नुहोस्। QC सीमा बाहिर भए बिरामीको नतिजा जारी गर्नुअघि कारण खोज्नुहोस्।"],["Quality assurance","QA covers the whole testing process, staff competency, equipment, documentation and corrective action.","QA ले सम्पूर्ण परीक्षण प्रक्रिया, कर्मचारीको दक्षता, उपकरण, अभिलेख र सुधारात्मक काम समेट्छ।"],["Calibration","Calibration establishes the relationship between instrument response and known standards.","Calibration ले उपकरणको response र ज्ञात standard बीचको सम्बन्ध स्थापित गर्छ।"],["Complete blood count","CBC commonly includes hemoglobin, RBC count, hematocrit, RBC indices, WBC count and platelet count.","CBC मा सामान्यतया Hb, RBC count, hematocrit, RBC indices, WBC count र platelet count हुन्छन्।"],["Hemoglobin","Hemoglobin carries oxygen in red blood cells. Interpret values using age-, sex- and population-appropriate reference intervals.","Hemoglobin ले RBC मार्फत अक्सिजन बोक्छ। उमेर, लिङ्ग र उपयुक्त reference interval अनुसार व्याख्या गर्नुहोस्।"],["RBC indices","MCV, MCH and MCHC help classify anemia; interpret them with Hb, smear and clinical context.","MCV, MCH र MCHC ले anemia वर्गीकरणमा मद्दत गर्छन्; Hb, smear र clinical अवस्थासँगै हेर्नुहोस्।"],["White blood cells","WBC count and differential provide information about immune response and possible infection or hematologic disorders.","WBC count र differential ले immune response, सम्भावित संक्रमण वा रक्तसम्बन्धी रोगबारे जानकारी दिन्छ।"],["Platelets","Platelets are essential for primary hemostasis. Low or high counts require clinical correlation and verification when indicated.","Platelet ले primary hemostasis मा काम गर्छ। कम वा धेरै count भए clinical correlation र आवश्यकताअनुसार पुष्टि गर्नुहोस्।"],["Peripheral blood smear","A well-prepared, properly stained smear helps assess blood cell morphology and abnormal cells.","राम्रोसँग तयार र stain गरिएको smear ले रक्तकोषको बनावट र असामान्य कोष हेर्न मद्दत गर्छ।"],["ESR","ESR is a nonspecific marker of inflammation and must be interpreted with clinical findings.","ESR सूजनको nonspecific सूचक हो; clinical findings सँगै व्याख्या गर्नुपर्छ।"],["Blood grouping","ABO and Rh typing require correct identification, validated reagents and appropriate controls.","ABO र Rh grouping गर्दा सही पहिचान, प्रमाणित reagent र उचित control आवश्यक हुन्छ।"],["Crossmatching","Compatibility testing helps reduce risk of transfusion reactions; follow the transfusion service SOP.","Crossmatching ले transfusion reaction को जोखिम घटाउन मद्दत गर्छ; transfusion service SOP पालना गर्नुहोस्।"],["Urine routine examination","Assess physical, chemical and microscopic features using a fresh, correctly collected specimen.","ताजा र सही तरिकाले संकलित पिसाबको physical, chemical र microscopic पक्ष जाँच्नुहोस्।"],["Urine sediment","Microscopy may identify RBCs, WBCs, epithelial cells, casts, crystals, yeast and bacteria.","Microscopy मा RBC, WBC, epithelial cell, cast, crystal, yeast र bacteria देखिन सक्छन्।"],["Stool examination","Macroscopic and microscopic examination may help detect parasites, ova, cysts, blood and other abnormalities.","दिसाको macroscopic तथा microscopic परीक्षणले parasite, ova, cyst, रगत र अन्य असामान्यता पत्ता लगाउन मद्दत गर्छ।"],["Culture and sensitivity","Collect specimens before antimicrobial therapy when clinically appropriate; use aseptic technique and timely transport.","सम्भव र उपयुक्त भए antimicrobial सुरु गर्नुअघि नमुना लिनुहोस्; aseptic technique र छिटो ढुवानी अपनाउनुहोस्।"],["Gram staining","Gram stain differentiates bacteria broadly by cell wall properties and supports preliminary identification.","Gram stain ले cell wall का आधारमा bacteria लाई मोटामोटी छुट्याउँछ र प्रारम्भिक पहिचानमा मद्दत गर्छ।"],["Sterilization and disinfection","Sterilization destroys all forms of microbial life; disinfection reduces or eliminates many pathogens on surfaces.","Sterilization ले सबै प्रकारका सूक्ष्मजीव नष्ट गर्छ; disinfection ले सतहमा धेरै रोगजनक घटाउँछ वा हटाउँछ।"],["Autoclave","Steam under pressure is used for sterilization; verify cycle parameters and indicators according to SOP.","Pressure सहितको steam प्रयोग गरी sterilization गरिन्छ; cycle parameter र indicator SOP अनुसार जाँच्नुहोस्।"],["Aseptic technique","Aseptic technique minimizes contamination during specimen collection, culture and laboratory procedures.","Aseptic technique ले नमुना संकलन, culture र प्रयोगशाला प्रक्रियामा contamination घटाउँछ।"],["Serum and plasma","Serum is obtained after clotting; plasma is obtained from anticoagulated blood and contains clotting factors.","रगत जमिसकेपछि serum प्राप्त हुन्छ; anticoagulant भएको रगतबाट clotting factor सहित plasma प्राप्त हुन्छ।"],["Anticoagulants","Choose anticoagulants according to the test, such as EDTA for many hematology tests and citrate for coagulation testing.","परीक्षणअनुसार anticoagulant छान्नुहोस्; धेरै hematology test मा EDTA र coagulation test मा citrate प्रयोग हुन्छ।"],["Glucose testing","Fasting status, sample handling and timely separation can affect glucose measurement.","Fasting अवस्था, नमुना सम्हाल्ने तरिका र समयमै separation ले glucose नतिजा प्रभावित गर्छ।"],["Liver function tests","ALT, AST, ALP, bilirubin, albumin and related tests are interpreted as a pattern, not in isolation.","ALT, AST, ALP, bilirubin, albumin लगायतका परीक्षणलाई छुट्टाछुट्टै होइन, समग्र pattern मा बुझ्नुहोस्।"],["Renal function tests","Creatinine, urea and estimated GFR help assess kidney function alongside clinical information.","Creatinine, urea र estimated GFR ले clinical जानकारीसँगै मिर्गौलाको कार्य मूल्याङ्कन गर्न मद्दत गर्छ।"],["Electrolytes","Sodium, potassium and chloride are important for fluid balance, nerve function and acid-base physiology.","Sodium, potassium र chloride शरीरको पानी सन्तुलन, स्नायु कार्य र acid-base physiology का लागि महत्त्वपूर्ण छन्।"],["Enzymes","Enzyme results depend on tissue source, method, specimen quality and reference interval.","Enzyme नतिजा tissue source, विधि, नमुनाको गुणस्तर र reference interval मा निर्भर हुन्छ।"],["Microscope care","Clean optical surfaces with suitable lens tissue, store covered and avoid touching lenses with fingers.","उपयुक्त lens tissue ले optical सतह सफा गर्नुहोस्, छोपेर राख्नुहोस् र औँलाले lens नछुनुहोस्।"],["Centrifuge safety","Balance tubes by mass and position, secure the lid and wait for a complete stop before opening.","Tube को mass र स्थान सन्तुलित राख्नुहोस्, ढकनी बन्द गर्नुहोस् र पूर्ण रोकिएपछि मात्र खोल्नुहोस्।"],["Critical results","Follow the critical-result policy for verification, immediate notification and documentation of communication.","Critical result का लागि पुष्टि, तुरुन्त जानकारी र communication अभिलेख गर्ने policy पालना गर्नुहोस्।"],["Laboratory ethics","Protect patient confidentiality, maintain accurate records and release results only to authorized persons.","बिरामीको गोपनीयता जोगाउनुहोस्, सही अभिलेख राख्नुहोस् र अधिकृत व्यक्तिलाई मात्र नतिजा दिनुहोस्।"]].map(([title,english,nepali])=>({title,english,nepali}));
  function renderBMLTGuide(){
    const host=document.getElementById("bmltStudyGuide");
    if(!host)return;
    if(!window.DHPNStudyGuide){host.innerHTML=notes.map((n,i)=>`<article class="note"><h3>${i+1}. ${n.title}</h3><p>${n.english}</p><p class="np">${n.nepali}</p></article>`).join("");return;}
    host.innerHTML=window.DHPNStudyGuide.render({
      title:"BMLT NHPC Licensing — Study Guide",
      notes:notes.map(n=>({title:n.title,en:n.english,ne:n.nepali})),
      points:[
        {title:"Specimen integrity",en:"Correct patient identification, specimen type, container, labeling, transport and timing are essential before analysis.",ne:"सही बिरामी पहिचान, नमुनाको प्रकार, कन्टेनर, लेबल, ढुवानी र समय नमुना परीक्षणअघि अनिवार्य जाँच गर्नुहोस्।"},
        {title:"Quality control",en:"Run and review internal quality control according to the laboratory SOP; do not release results when QC is unacceptable.",ne:"SOP अनुसार internal QC गर्नुहोस्; QC स्वीकार्य नभए परिणाम जारी नगर्नुहोस्।"},
        {title:"CBC basics",en:"Interpret hemoglobin, RBC indices, WBC differential and platelet count together with clinical context and reference intervals.",ne:"Hb, RBC indices, WBC differential र platelet count लाई clinical context र reference range सँगै बुझ्नुहोस्।"},
        {title:"Microbiology safety",en:"Use appropriate biosafety precautions, aseptic technique and validated methods; report critical findings promptly.",ne:"उचित biosafety, aseptic technique र प्रमाणित विधि अपनाउनुहोस्; critical finding तुरुन्त रिपोर्ट गर्नुहोस्।"},
        {title:"Biochemistry",en:"Check sample suitability (e.g., hemolysis), calibration, reagent expiry and units before validating results.",ne:"Result validate गर्नु अघि नमुना (जस्तै hemolysis), calibration, reagent expiry र units जाँच्नुहोस्।"}
      ],
      tricks:[
        {title:"Specimen pathway — I-T-T-A",en:"Identify → collect → transport → analyse.",ne:"पहिचान → संकलन → ढुवानी → परीक्षण।"},
        {title:"CBC — H-R-W-P",en:"Hemoglobin, RBC indices, WBC, Platelets: review the four groups together.",ne:"Hb, RBC indices, WBC र Platelets चारै समूह सँगै हेर्नुहोस्।"},
        {title:"QC — C-R-R",en:"Control → review → release (only when acceptable).",ne:"Control → review → QC ठीक भए मात्र release।"},
        {title:"Culture — S-I-I",en:"Specimen quality → inoculation → incubation; follow organism-specific SOP.",ne:"नमुना गुणस्तर → inoculation → incubation; organism अनुसार SOP पालना।"}
      ],
      diagrams:[
        {title:"Laboratory workflow / प्रयोगशाला प्रक्रिया",en:"Pre-analytical to post-analytical phases",ne:"नमुना प्राप्तिदेखि रिपोर्टसम्म",html:'<svg viewBox="0 0 620 125" role="img" aria-label="Laboratory workflow diagram"><g font-family="Arial" font-size="16" text-anchor="middle" fill="#164e63"><rect x="8" y="25" width="135" height="62" rx="12" fill="#e0f2fe" stroke="#0284c7"/><text x="75" y="50">Pre-analytical</text><text x="75" y="70" font-size="12">Collect / label</text><path d="M145 56 H165" stroke="#0284c7" stroke-width="3"/><path d="M159 49 L168 56 L159 63" fill="none" stroke="#0284c7" stroke-width="3"/><rect x="172" y="25" width="135" height="62" rx="12" fill="#dcfce7" stroke="#16a34a"/><text x="239" y="50">Analytical</text><text x="239" y="70" font-size="12">Test / QC</text><path d="M309 56 H329" stroke="#0284c7" stroke-width="3"/><path d="M323 49 L332 56 L323 63" fill="none" stroke="#0284c7" stroke-width="3"/><rect x="336" y="25" width="135" height="62" rx="12" fill="#fef3c7" stroke="#d97706"/><text x="403" y="50">Post-analytical</text><text x="403" y="70" font-size="12">Validate / report</text><path d="M473 56 H493" stroke="#0284c7" stroke-width="3"/><path d="M487 49 L496 56 L487 63" fill="none" stroke="#0284c7" stroke-width="3"/><rect x="500" y="25" width="112" height="62" rx="12" fill="#f3e8ff" stroke="#9333ea"/><text x="556" y="50">Result</text><text x="556" y="70" font-size="12">Communicate</text></g></svg>'},
        {title:"CBC overview / CBC का आधार",en:"Relate cell counts and indices to the blood film and clinical context.",ne:"Cell count र indices लाई blood film र clinical अवस्थासँग मिलाएर हेर्नुहोस्।",html:'<svg viewBox="0 0 520 115" role="img" aria-label="CBC components diagram"><g font-family="Arial" text-anchor="middle" font-size="15"><rect x="8" y="22" width="155" height="70" rx="12" fill="#fee2e2" stroke="#dc2626"/><text x="85" y="49" fill="#991b1b">RBC / Hb</text><text x="85" y="70" fill="#991b1b" font-size="12">Anemia & indices</text><rect x="182" y="22" width="155" height="70" rx="12" fill="#dbeafe" stroke="#2563eb"/><text x="259" y="49" fill="#1e40af">WBC</text><text x="259" y="70" fill="#1e40af" font-size="12">Count & differential</text><rect x="356" y="22" width="156" height="70" rx="12" fill="#fef3c7" stroke="#d97706"/><text x="434" y="49" fill="#92400e">Platelets</text><text x="434" y="70" fill="#92400e" font-size="12">Number & morphology</text></g></svg>'}
      ],
      examples:[
        {title:"Hemolyzed sample / Hemolysis",en:"A visibly hemolyzed sample may affect potassium and other analytes. Follow the laboratory rejection/recollection policy and document the action.",ne:"Hemolyzed नमुनाले potassium लगायत केही analyte प्रभावित गर्न सक्छ। Lab rejection/recollection policy अनुसार काम गरी अभिलेख राख्नुहोस्।"},
        {title:"Blood culture collection",en:"Use correct patient identification, aseptic skin preparation, appropriate blood volume and timely transport according to SOP.",ne:"सही बिरामी पहिचान, aseptic skin preparation, उचित blood volume र SOP अनुसार छिटो ढुवानी गर्नुहोस्।"},
        {title:"Critical result",en:"Verify the result according to policy, promptly notify the responsible clinician, and record who was informed and when.",ne:"Policy अनुसार result verify गरी जिम्मेवार clinician लाई तुरुन्त जानकारी दिनुहोस् र कसलाई/कहिले भनियो अभिलेख राख्नुहोस्।"}
      ]
    });
  }
  function convertRows(rows) {
    const typed=rows.map(row=>({...row,normalizedType:normalizeType(contentTypeOf(row)),normalizedData:contentDataOf(row),normalizedOrder:contentOrderOf(row)}));
    notes=typed.filter(x=>x.normalizedType==="note").map(x=>normalizeNote(x.normalizedData)).filter(n=>n.title||n.english||n.nepali);
    if(!notes.length)notes=builtInNotes;
    practiceQuestions=typed.filter(x=>x.normalizedType==="mcq").sort((a,b)=>a.normalizedOrder-b.normalizedOrder).map(x=>shuffledQuestion(x.normalizedData)).filter(Boolean);
    mockBankQuestions=typed.filter(x=>x.normalizedType==="mock").sort((a,b)=>a.normalizedOrder-b.normalizedOrder).map(x=>shuffledQuestion(x.normalizedData)).filter(Boolean);
    // If BMLT has practice MCQs but no separately tagged mock rows, reuse the practice bank for Mock Test.
    if(!mockBankQuestions.length&&practiceQuestions.length)mockBankQuestions=practiceQuestions.map(q=>[q[0],q[1],[...q[2]],q[3],q[4],q[5]]);
  }
  function showApp() {
    status.classList.add("hidden"); app.classList.remove("hidden");
    document.getElementById("bmltNotesCount").textContent=notes.length+" वटा Notes";
    document.getElementById("bmltPracticeCount").textContent=practiceQuestions.length+" अभ्यास प्रश्न";
    document.getElementById("bmltMockCount").textContent=mockBankQuestions.length+" प्रश्न • "+mockBankQuestions.length+" मिनेट";
    document.getElementById("bmltMockIntroText").textContent=mockBankQuestions.length+" उपलब्ध Mock प्रश्न • प्रत्येक प्रश्नको १ अंक";
    const setRoot=document.getElementById("bmltMockSets");
    if(mockBankQuestions.length){const setCount=Math.ceil(mockBankQuestions.length/100);setRoot.innerHTML=Array.from({length:setCount},(_,i)=>{const count=Math.min(100,mockBankQuestions.length-i*100);return `<button class="feature-card" type="button" data-bmlt-set="${i}"><b>Mock Set ${i+1}</b><strong>${count} प्रश्न • ${count} अंक</strong><small>६० मिनेट</small></button>`}).join("");setRoot.querySelectorAll("[data-bmlt-set]").forEach(b=>b.addEventListener("click",()=>startMock(Number(b.dataset.bmltSet))));}else setRoot.textContent="अहिले Mock प्रश्न उपलब्ध छैन।";
    document.getElementById("bmltNotesList").innerHTML="";
    renderBMLTGuide();
    root.querySelectorAll("[data-bmlt]").forEach(b=>b.addEventListener("click",()=>{panel(b.dataset.bmlt);if(b.dataset.bmlt==="practice")renderPractice();}));
    document.getElementById("bmltLanguage").addEventListener("change",()=>{if(!document.getElementById("bmltPractice").classList.contains("hidden"))renderPractice();if(!document.getElementById("bmltMock").classList.contains("hidden")&&mock.length)renderMock();});

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
  function startMock(setIndex=0){
    clearInterval(timer);const start=setIndex*100;mock=mockBankQuestions.slice(start,start+100).map(q=>[...q]);for(let i=mock.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mock[i],mock[j]]=[mock[j],mock[i]];}
    ma={};mi=0;remaining=60*60;
    document.getElementById("bmltMockIntro").classList.add("hidden");renderMock();
    timer=setInterval(()=>{remaining--;const t=document.getElementById("bmltTimer");if(t)t.textContent=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}`;if(remaining<=0)finish();},1000);
  }
  function renderMock(){
    if(mi>=mock.length){finish();return;}
    const q=mock[mi],area=document.getElementById("bmltMockArea"),mode=document.getElementById("bmltLanguage").value;
    area.innerHTML=`<div class="qtop"><span>QUESTION ${mi+1} OF ${mock.length}</span><span class="timer" id="bmltTimer">${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,"0")}</span></div><article class="question">${bilingual(q)}<div class="options">${q[2].map((o,i)=>`<button class="option ${ma[mi]===i?"selected":""}" data-bmltm="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div><div class="nextrow"><span class="muted">Choose one answer</span><button class="smallbtn" id="bmltMockNext">${mi===mock.length-1?"Submit test":"Next"}</button></div></article>`;
    area.querySelectorAll("[data-bmltm]").forEach(b=>b.addEventListener("click",()=>{ma[mi]=Number(b.dataset.bmltm);area.querySelectorAll("[data-bmltm]").forEach(x=>x.classList.toggle("selected",Number(x.dataset.bmltm)===ma[mi]));}));
    document.getElementById("bmltMockNext").addEventListener("click",()=>{mi++;if(mi>=mock.length)finish();else renderMock();});
  }
  function finish(){
    clearInterval(timer);if(!mock.length)return;
    const score=mock.reduce((s,q,i)=>s+(ma[i]===q[3]?1:0),0),answered=Object.keys(ma).length,wrong=answered-score,unanswered=mock.length-answered,percent=Math.round(score/mock.length*100),passed=percent>=50;
    window.DHPNProgress?.recordMock("BMLT NHPC Licensing",score,mock.length);
    const area=document.getElementById("bmltMockArea");
    area.innerHTML=`<div class="result"><p>BMLT NHPC MOCK RESULT</p><strong>${score}/${mock.length}</strong><b>${percent}%</b><p><b>सही:</b> ${score} • <b>गलत:</b> ${wrong} • <b>अनुत्तरित:</b> ${unanswered}</p><h2>${passed?"🎉 Congratulations! तपाईं BMLT NHPC Mock Exam मा उत्तीर्ण हुनुभयो।":"अहिलेका लागि Fail — फेरि अभ्यास गरेर प्रयास गर्नुहोस्।"}</h2><p>Result: <b>${passed?"PASS":"FAIL"}</b> • Pass Mark: ५०%</p><button class="primary" id="bmltReview">गलत उत्तर र सही उत्तर समीक्षा गर्नुहोस्</button> <button class="secondary" id="bmltAgain">Try again</button></div><div id="bmltReviewList"></div>`;
    document.getElementById("bmltReview").addEventListener("click",()=>{document.getElementById("bmltReviewList").innerHTML=mock.map((q,i)=>`<article class="note answer-review ${ma[i]===q[3]?"review-correct":"review-wrong"}"><h3>${i+1}. ${q[0]}</h3><p class="translation">${q[1]}</p><p>तपाईंको उत्तर: <b>${ma[i]===undefined?"उत्तर नदिएको":q[2][ma[i]]}</b></p><p><b>सही उत्तर: ${q[2][q[3]]}</b></p><p>${q[4]}</p><p class="np">${q[5]}</p><span class="pill">${ma[i]===q[3]?"सही ✓":"गलत / अनुत्तरित"}</span></article>`).join("");});
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
      const valid=data.filter(row=>row&&normalizeType(contentTypeOf(row))&&contentDataOf(row));
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