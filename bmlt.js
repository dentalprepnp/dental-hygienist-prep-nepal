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
  builtInNotes.push(
    {title:"Peripheral smear: morphology clues",english:"Microcytes are smaller than expected and macrocytes are larger; hypochromia indicates reduced central hemoglobin staining. Describe morphology systematically and correlate with CBC indices; morphology alone does not establish the cause of anemia.",nepali:"Microcyte सानो र macrocyte ठूलो RBC हो; hypochromia मा central pallor बढी देखिन्छ। CBC indices सँग मिलाएर morphology वर्णन गर्नुहोस्; smear मात्रले anemia को कारण निश्चित हुँदैन।"},
    {title:"Reticulocyte count and marrow response",english:"Reticulocytes are immature red cells. An increased count may indicate a marrow response to blood loss or hemolysis; a low or inappropriately normal response may occur when production is reduced. Interpret with hemoglobin and clinical context.",nepali:"Reticulocyte immature RBC हो। बढेको count blood loss वा hemolysis प्रति marrow response हुन सक्छ; कम वा अपेक्षाभन्दा सामान्य count उत्पादन घटेको अवस्थामा हुन सक्छ। Hb र clinical अवस्था सँगै व्याख्या गर्नुहोस्।"},
    {title:"Hemostasis: primary vs secondary",english:"Primary hemostasis involves platelet adhesion, activation and aggregation to form a platelet plug. Secondary hemostasis activates coagulation factors to generate fibrin that stabilizes the plug. Platelet disorders and coagulation-factor disorders may produce different bleeding patterns.",nepali:"Primary hemostasis मा platelet adhesion, activation र aggregation भएर platelet plug बन्छ। Secondary hemostasis मा coagulation factor सक्रिय भई fibrin ले plug बलियो बनाउँछ। Platelet र coagulation factor समस्या हुँदा bleeding pattern फरक हुन सक्छ।"},
    {title:"ABO compatibility: core principle",english:"ABO compatibility is essential before transfusion. Forward grouping tests patient red cells with anti-A and anti-B reagents; reverse grouping tests patient plasma/serum against known A and B cells. Unexpected or discrepant results must be resolved under blood-bank SOP before routine issue.",nepali:"Transfusion अघि ABO compatibility अत्यावश्यक हुन्छ। Forward grouping मा बिरामीका RBC लाई anti-A/anti-B reagent सँग; reverse grouping मा plasma/serum लाई known A/B cells सँग जाँचिन्छ। फरक वा अनपेक्षित नतिजा blood-bank SOP अनुसार समाधान नगरी routine blood issue नगर्नुहोस्।"},
    {title:"Quality control: Westgard concept",english:"Internal quality control monitors analytical performance before patient results are released. Review control charts and apply the laboratory's validated rules; a control failure requires investigation, corrective action and documented acceptance before reporting affected results.",nepali:"Internal QC ले patient result release अघि analytical performance अनुगमन गर्छ। Control chart र lab ले मान्य गरेका नियम हेर्नुहोस्; QC fail भए कारण खोजी, corrective action र स्वीकार्य QC अभिलेखपछि मात्र प्रभावित result report गर्नुहोस्।"},
    {title:"Diagnostic test calculations",english:"Sensitivity = true positives / all people with disease; specificity = true negatives / all people without disease. Positive predictive value depends on prevalence as well as test performance. Always identify the correct denominator before calculating.",nepali:"Sensitivity = रोग भएकामध्ये true positive; specificity = रोग नभएकामध्ये true negative। Positive predictive value रोगको prevalence मा पनि निर्भर हुन्छ। Calculation अघि सही denominator पहिचान गर्नुहोस्।"},
    {title:"Blood collection tubes: common additives",english:"EDTA is commonly used for CBC; sodium citrate for coagulation tests with a correct blood-to-additive ratio; heparin for selected chemistry tests; fluoride-containing tubes may help preserve glucose according to local methods. Follow the current tube guide and order of draw.",nepali:"CBC मा EDTA, coagulation मा सही blood:additive ratio सहित sodium citrate, केही chemistry मा heparin र glucose preservation का लागि स्थानीय विधिअनुसार fluoride tube प्रयोग हुन सक्छ। हालको tube guide र order of draw पालना गर्नुहोस्।"},
    {title:"Laboratory result verification and critical values",english:"Check patient identity, specimen suitability, units, reference interval, instrument flags and delta/previous results when available. Critical values require prompt communication to an authorized clinician, read-back when required, and documentation of time, recipient and action.",nepali:"Patient identity, नमुनाको उपयुक्तता, unit, reference interval, instrument flag र उपलब्ध भए previous/delta result जाँच्नुहोस्। Critical value अधिकृत clinician लाई तुरुन्त जानकारी दिनुहोस्; आवश्यक read-back गरी समय, प्राप्तकर्ता र action अभिलेख गर्नुहोस्।"}
  );
  const localFallbackQuestions=[
    {question:"Which anticoagulant is commonly used for CBC?",translation:"CBC का लागि सामान्यतया कुन anticoagulant प्रयोग हुन्छ?",options:["EDTA","Sodium citrate","Plain tube","Fluoride oxalate"],correctIndex:0,explanation:"EDTA preserves blood cell morphology and is commonly used for CBC.",explanationNe:"EDTA ले रक्तकोषको बनावट जोगाउँछ र CBC मा सामान्यतया प्रयोग हुन्छ।"},
    {question:"Which tube is commonly used for PT/INR testing?",translation:"PT/INR परीक्षणमा कुन tube सामान्यतया प्रयोग हुन्छ?",options:["EDTA","Sodium citrate","Heparin","Fluoride"],correctIndex:1,explanation:"Citrate binds calcium reversibly; maintain the correct blood-to-citrate ratio.",explanationNe:"Citrate ले calcium लाई reversible रूपमा बाँध्छ; सही blood:citrate ratio आवश्यक हुन्छ।"},
    {question:"What is the first step when receiving a specimen?",translation:"नमुना प्राप्त गर्दा पहिलो कदम के हो?",options:["Run the test immediately","Verify patient identifiers and label","Centrifuge every sample","Discard the request form"],correctIndex:1,explanation:"Match at least two identifiers and specimen label with the request.",explanationNe:"कम्तीमा दुई patient identifier र specimen label request सँग मिलाउनुहोस्।"},
    {question:"Gram-positive bacteria usually appear which color after Gram staining?",translation:"Gram staining पछि Gram-positive bacteria सामान्यतया कुन रङ देखिन्छ?",options:["Green","Purple","Yellow","Colorless"],correctIndex:1,explanation:"Gram-positive cell walls retain crystal violet-iodine complex and appear purple.",explanationNe:"Gram-positive ले crystal violet-iodine complex राख्ने भएकाले बैजनी देखिन्छ।"},
    {question:"What is the correct Gram stain sequence?",translation:"Gram stain को सही क्रम कुन हो?",options:["Safranin, iodine, crystal violet, alcohol","Crystal violet, iodine, decolorizer, safranin","Iodine, safranin, alcohol, crystal violet","Alcohol, crystal violet, safranin, iodine"],correctIndex:1,explanation:"The common sequence is crystal violet → iodine → decolorizer → safranin.",explanationNe:"सामान्य क्रम: Crystal violet → Iodine → Decolorizer → Safranin।"},
    {question:"Which method uses steam under pressure for sterilization?",translation:"Sterilization का लागि pressure सहित steam कुन विधिमा प्रयोग हुन्छ?",options:["Hot air oven","Autoclave","Incubator","Water bath"],correctIndex:1,explanation:"Autoclaving uses a validated moist-heat cycle under pressure.",explanationNe:"Autoclave मा pressure सहित moist heat को प्रमाणित cycle प्रयोग हुन्छ।"},
    {question:"Which blood film is generally more useful for detecting malaria parasites?",translation:"Malaria parasite पत्ता लगाउन कुन blood film बढी उपयोगी हुन्छ?",options:["Thick film","Thin film only","Buffy coat only","No blood film"],correctIndex:0,explanation:"Thick film concentrates blood and improves parasite detection; thin film helps species identification.",explanationNe:"Thick film मा रगत concentrate हुन्छ र parasite detection राम्रो हुन्छ; thin film species छुट्याउन उपयोगी हुन्छ।"},
    {question:"Which stain is routinely used to demonstrate tissue architecture in histology?",translation:"Histology मा tissue architecture देखाउन कुन stain नियमित प्रयोग हुन्छ?",options:["Gram stain","Hematoxylin and eosin","Ziehl-Neelsen only","India ink"],correctIndex:1,explanation:"H&E is a routine stain: hematoxylin colors nuclei blue-purple and eosin colors cytoplasm pink.",explanationNe:"H&E routine stain हो; hematoxylin ले nucleus निलो-बैजनी र eosin ले cytoplasm गुलाबी बनाउँछ।"},
    {question:"Which test is commonly used to assess the erythrocyte sedimentation rate?",translation:"ESR जाँच्न कुन परीक्षण प्रयोग हुन्छ?",options:["Westergren method","Kirby-Bauer method","Coombs test","Gram stain"],correctIndex:0,explanation:"The Westergren method is a commonly used standardized ESR method.",explanationNe:"Westergren विधि ESR मापनको सामान्य standardized method हो।"},
    {question:"What does sensitivity measure?",translation:"Sensitivity ले के मापन गर्छ?",options:["True negatives among healthy people","True positives among people with disease","All false positives","Disease prevalence only"],correctIndex:1,explanation:"Sensitivity = true positives / all people who have the disease.",explanationNe:"Sensitivity = रोग भएका सबैमध्ये true positive को अनुपात।"},
    {question:"Which specimen issue can falsely increase potassium?",translation:"कुन नमुना समस्याले potassium झुटो बढाउन सक्छ?",options:["Hemolysis","Correct fasting","Proper labeling","Light protection"],correctIndex:0,explanation:"Hemolysis releases intracellular potassium and may cause pseudohyperkalemia.",explanationNe:"Hemolysis हुँदा कोषभित्रको potassium बाहिर निस्केर झुटो बढ्न सक्छ।"},
    {question:"What should be done when internal QC is out of acceptable range?",translation:"Internal QC स्वीकार्य सीमाभन्दा बाहिर भए के गर्नुपर्छ?",options:["Release patient results","Ignore the control","Hold affected results and investigate","Change patient result manually"],correctIndex:2,explanation:"Do not release affected results until the cause is investigated and QC is acceptable.",explanationNe:"कारण खोजी QC स्वीकार्य नहुँदासम्म प्रभावित patient result release नगर्नुहोस्।"},
    {question:"Serum is obtained from blood that has:",translation:"Serum कुन रगतबाट प्राप्त हुन्छ?",options:["Been anticoagulated","Clotted and then separated","Been mixed with EDTA","Been diluted with saline"],correctIndex:1,explanation:"Serum is the liquid portion after clotting; plasma is obtained from anticoagulated blood.",explanationNe:"रगत जमिसकेपछि छुट्याइएको तरल serum हो; anticoagulant भएको रगतबाट plasma प्राप्त हुन्छ।"},
    {question:"Which PCR step allows primers to bind the target sequence?",translation:"PCR मा primer लक्षित sequence सँग कुन चरणमा जोडिन्छ?",options:["Denaturation","Annealing","Extension","Fixation"],correctIndex:1,explanation:"During annealing, primers bind complementary target sequences.",explanationNe:"Annealing चरणमा primer complementary target sequence सँग जोडिन्छ।"},
    {question:"What is the key safety action if a transfusion reaction is suspected?",translation:"Transfusion reaction शंका भए मुख्य safety action के हो?",options:["Increase the flow rate","Stop transfusion and follow protocol","Discard all records","Restart immediately"],correctIndex:1,explanation:"Stop the transfusion immediately and activate the institution's reaction protocol.",explanationNe:"Transfusion तुरुन्त रोक्नुहोस् र संस्थाको reaction protocol सुरु गर्नुहोस्।"}
  ];
  function renderBMLTGuide(){
    const host=document.getElementById("bmltStudyGuide");
    if(!host)return;
    const points=[
      ["Specimen identification","Use at least two identifiers and match the tube label with the request form.","कम्तीमा दुई identifier मिलाउनुहोस् र tube label तथा request form जाँच्नुहोस्।"],
      ["CBC specimen","EDTA whole blood is commonly used for CBC; gently invert as recommended.","CBC का लागि प्रायः EDTA whole blood; निर्देशनअनुसार बिस्तारै invert गर्नुहोस्।"],
      ["Coagulation tests","Sodium citrate is used for PT/INR and aPTT; correct fill volume is essential.","PT/INR र aPTT मा sodium citrate; सही मात्रा भर्नु अत्यन्त आवश्यक।"],
      ["Blood culture","Collect aseptically, preferably before antibiotics when clinically appropriate; send promptly.","Aseptic तरिकाले, उपयुक्त भए antibiotic अघि culture लिनुहोस् र तुरुन्त पठाउनुहोस्।"],
      ["Gram stain result","Gram-positive bacteria appear purple; Gram-negative appear pink/red after counterstain.","Gram-positive बैजनी र Gram-negative गुलाबी/रातो देखिन्छ।"],
      ["Gram stain order","Crystal violet → iodine → decolorizer → safranin.","Crystal violet → iodine → decolorizer → safranin।"],
      ["Malaria microscopy","Thick film is more sensitive for detection; thin film helps species identification and parasitemia.","Thick film detection मा बढी संवेदनशील; thin film species र parasitemia बुझ्न।"],
      ["Peripheral smear","A good smear has a feathered edge and a readable monolayer for morphology.","राम्रो smear मा feathered edge र morphology हेर्न मिल्ने monolayer हुन्छ।"],
      ["Hematology indices","MCV classifies microcytic, normocytic and macrocytic patterns; correlate with Hb and smear.","MCV ले micro/normo/macrocytic pattern छुट्याउँछ; Hb र smear सँग मिलाएर हेर्नुहोस्।"],
      ["Serum vs plasma","Serum is separated after clotting; plasma is separated from anticoagulated blood.","Clot भएपछि serum; anticoagulant भएको रगतबाट plasma।"],
      ["QC failure","Hold affected patient results, investigate the cause, correct it and document before release.","QC fail भए result रोक्नुहोस्, कारण सुधार्नुहोस् र record गरेपछि मात्र release गर्नुहोस्।"],
      ["Critical result","Verify according to SOP, promptly notify an authorized clinician and document communication.","SOP अनुसार पुष्टि गरी अधिकृत clinician लाई तुरुन्त जानकारी र अभिलेख गर्नुहोस्।"],
      ["Urine microscopy","Examine a fresh, properly collected specimen; note cells, casts, crystals and organisms.","ताजा सही नमुना जाँच्नुहोस्; cells, casts, crystals र organisms टिप्नुहोस्।"],
      ["Stool parasite exam","Use appropriate fresh/preserved stool and examine for ova, cysts and parasites as requested.","निर्देशनअनुसार fresh/preserved stool मा ova, cyst र parasite खोज्नुहोस्।"],
      ["PCR principle","PCR amplifies a target nucleic-acid sequence; contamination control is crucial.","PCR ले target nucleic acid बढाउँछ; contamination control अत्यन्त महत्त्वपूर्ण।"],
      ["Autoclave","Steam under pressure sterilizes; follow validated cycle and indicator/SOP requirements.","Pressure steam ले sterilize गर्छ; validated cycle र indicator/SOP पालना गर्नुहोस्।"],
      ["Transfusion safety","Confirm patient identity, compatibility and component details at bedside per local protocol.","स्थानीय protocol अनुसार bedside मा patient ID, compatibility र component जाँच्नुहोस्।"],
      ["Hemolysis","Hemolysis can falsely increase potassium and affect other analytes; assess specimen acceptability.","Hemolysis ले potassium झुटो बढाउन र अन्य analyte असर गर्न सक्छ; नमुना स्वीकार्यता जाँच्नुहोस्।"],
      ["Sensitivity","Sensitivity = true positives / all diseased individuals.","Sensitivity = रोग भएका सबैमध्ये true positive।"],
      ["Specificity","Specificity = true negatives / all non-diseased individuals.","Specificity = रोग नभएका सबैमध्ये true negative।"]
    ];
    const shortNotes=[
      ["Pre-analytical phase","Patient preparation, collection, labeling and transport. Many avoidable lab errors occur here.","बिरामी तयारी, संकलन, labeling र transport। धेरै रोक्न सकिने त्रुटि यही चरणमा हुन्छ।"],
      ["Analytical phase","Testing using validated method, calibrated equipment, suitable reagent and QC.","Validated विधि, calibrated उपकरण, सही reagent र QC सहित परीक्षण।"],
      ["Post-analytical phase","Review, interpretation, critical notification, authorization and report delivery.","Review, व्याख्या, critical सूचना, authorization र report।"],
      ["CBC essentials","Hb, RBC, Hct, RBC indices, WBC/differential and platelet count.","Hb, RBC, Hct, indices, WBC/differential र platelet count।"],
      ["Anemia by MCV","Low MCV: microcytic; normal MCV: normocytic; high MCV: macrocytic.","MCV कम: microcytic; सामान्य: normocytic; बढी: macrocytic।"],
      ["ABO basics","A antigen: anti-B in plasma; B antigen: anti-A; AB: both antigens; O: neither A nor B.","A मा anti-B; B मा anti-A; AB मा दुवै antigen; O मा A/B antigen हुँदैन।"],
      ["Liver profile","Interpret ALT/AST, ALP, bilirubin, albumin and clinical context as a pattern.","ALT/AST, ALP, bilirubin, albumin र clinical context लाई pattern मा बुझ्नुहोस्।"],
      ["Renal profile","Creatinine, urea and eGFR support kidney assessment; interpret with patient context.","Creatinine, urea र eGFR ले kidney assessment मा मद्दत गर्छ; clinical context आवश्यक।"],
      ["Quality assurance","QA is the whole system; QC is a routine check within that system.","QA सम्पूर्ण system हो; QC त्यसभित्रको नियमित जाँच हो।"],
      ["Microscope care","Clean lenses with lens paper; use oil only with the oil-immersion objective and clean after use.","Lens paper प्रयोग गर्नुहोस्; oil immersion objective मा मात्र oil र प्रयोगपछि सफा।"],
      ["Lab waste","Segregate infectious, sharps, chemical and general waste according to local SOP.","Infectious, sharps, chemical र general waste स्थानीय SOP अनुसार छुट्याउनुहोस्।"],
      ["Result reporting","Check patient ID, units, reference interval, flags and authorization before release.","Release अघि ID, unit, reference interval, flags र authorization जाँच्नुहोस्।"]
    ];
    const tricks=[
      ["CBC = E-D-T-A","EDTA is the common anticoagulant for CBC.","CBC सम्झन EDTA।"],
      ["Gram = C-I-D-S","Crystal violet, Iodine, Decolorizer, Safranin.","Gram stain क्रम C-I-D-S।"],
      ["PCR = D-A-E","Denaturation, Annealing, Extension.","PCR तीन चरण D-A-E।"],
      ["Lab phases = P-A-P","Pre-analytical, Analytical, Post-analytical.","Lab का ३ चरण P-A-P।"],
      ["QC = H-I-R","Hold results, Investigate, Record corrective action.","QC fail: रोक, खोज, record।"],
      ["MCV = M-N-M","Microcytic, Normocytic, Macrocytic.","MCV pattern M-N-M।"],
      ["Serum / Plasma","Serum after clot; plasma from anticoagulated sample.","Clot पछिको serum; anticoagulant sample को plasma।"],
      ["Thick / Thin film","Thick = detect; thin = identify species.","Thick पत्ता लगाउन; thin species छुट्याउन।"]
    ];
    const diagrams=[
      {title:"Total laboratory testing process",steps:["Patient ID","Collect & label","Transport","Test + QC","Verify","Report"],ne:"पहिचान → संकलन/label → transport → test/QC → verify → report"},
      {title:"Blood collection tube guide",steps:["EDTA","CBC / HbA1c*","Citrate","PT / INR / aPTT","Serum tube","Chemistry / serology*"],ne:"EDTA: hematology • Citrate: coagulation • Serum: धेरै chemistry/serology (test SOP अनुसार)"},
      {title:"Gram stain sequence",steps:["Smear + fix","Crystal violet","Iodine","Decolorize","Safranin"],ne:"Smear/fix → primary stain → mordant → decolorize → counterstain"},
      {title:"PCR cycle concept",steps:["Denature","Anneal primers","Extend","Repeat cycles","Detect product"],ne:"DNA छुट्याउने → primer जोड्ने → strand बनाउने → cycle दोहोर्‍याउने → product detect"},
      {title:"Transfusion safety pathway",steps:["Check patient ID","Group + screen","Compatibility","Bedside check","Monitor + record"],ne:"ID → grouping/screening → compatibility → bedside check → monitor/record"}
    ];
    const escapeHtml=s=>String(s).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
    const card=(title,en,ne)=>'<article class="note"><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(en)+'</p><p class="np">'+escapeHtml(ne)+'</p></article>';
    const diagramCard=d=>{
      const labels=d.steps, width=900, gap=12, boxW=(width-gap*(labels.length-1))/labels.length;
      const boxes=labels.map((label,i)=>'<g><rect x="'+(i*(boxW+gap))+'" y="24" width="'+boxW+'" height="64" rx="12" fill="#e8f2ff" stroke="#3478c8" stroke-width="2"/><text x="'+(i*(boxW+gap)+boxW/2)+'" y="61" text-anchor="middle" font-size="17" font-weight="600" fill="#173b65">'+escapeHtml(label)+'</text></g>').join("");
      const arrows=labels.slice(1).map((_,i)=>'<path d="M '+(i*(boxW+gap)+boxW+2)+' 56 h 8" stroke="#3478c8" stroke-width="3" fill="none"/><path d="M '+(i*(boxW+gap)+boxW+7)+' 50 l 6 6 -6 6" stroke="#3478c8" stroke-width="3" fill="none"/>').join("");
      return '<article class="note"><h3>'+escapeHtml(d.title)+'</h3><div style="width:100%;overflow-x:auto"><svg role="img" aria-label="'+escapeHtml(d.title)+' diagram" viewBox="0 0 900 112" style="width:100%;min-width:560px;height:auto" xmlns="http://www.w3.org/2000/svg">'+boxes+arrows+'</svg></div><p class="np">'+escapeHtml(d.ne)+'</p></article>';
    };
    host.innerHTML='<h2>📘 BMLT Short Notes / छोटा अध्ययन नोट ('+shortNotes.length+')</h2>'+shortNotes.map(x=>card(x[0],x[1],x[2])).join('')+
      '<h2>⭐ Important Points / महत्वपूर्ण बुँदा ('+points.length+')</h2>'+points.map(x=>card(x[0],x[1],x[2])).join('')+
      '<h2>⚡ Short Tricks / छिटो सम्झने तरिका</h2>'+tricks.map(x=>card(x[0],x[1],x[2])).join('')+
      '<h2>🧩 BMLT Image Diagrams / प्रक्रिया चित्र</h2>'+diagrams.map(diagramCard).join('')+
      '<h2>📚 Detailed Study Notes ('+notes.length+')</h2>'+notes.map((n,i)=>card((i+1)+'. '+n.title,n.english,n.nepali)).join('');
  }
  function convertRows(rows) {
    const typed=rows.map(row=>({...row,normalizedType:normalizeType(contentTypeOf(row)),normalizedData:contentDataOf(row),normalizedOrder:contentOrderOf(row)}));
    const databaseNotes=typed.filter(x=>x.normalizedType==="note").map(x=>normalizeNote(x.normalizedData)).filter(n=>n.title&&(n.english.trim().length>25||n.nepali.trim().length>20));
    const noteMap=new Map(builtInNotes.map(n=>[n.title,n]));
    databaseNotes.forEach(n=>noteMap.set(n.title,n));
    notes=[...noteMap.values()];
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
  function activateLocalFallback(message){
    convertRows([]);
    if(!practiceQuestions.length)practiceQuestions=localFallbackQuestions.map(shuffledQuestion).filter(Boolean);
    if(!mockBankQuestions.length)mockBankQuestions=practiceQuestions.map(q=>[q[0],q[1],[...q[2]],q[3],q[4],q[5]]);
    showApp();
    status.textContent=message;
    status.dataset.kind="warning";
    status.classList.remove("hidden");
    addRetryButton("Cloud सामग्री फेरि Load गर्नुहोस्");
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
        activateLocalFallback("Login नभएकाले cloud प्रश्नहरू उपलब्ध छैनन्। तलका BMLT Notes र १५ वटा स्थानीय अभ्यास MCQ पढ्न सक्नुहुन्छ। Login गरेपछि cloud सामग्री पनि load गर्न सकिन्छ।");
        const btn=document.createElement("button");
        btn.className="secondary";btn.textContent="Login / Create Account";
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
        activateLocalFallback("Cloud database बाट BMLT rows आएनन्। त्यसैले Notes र १५ स्थानीय MCQ देखाइएको छ; cloud access/published rows छुट्टै जाँच्नुपर्छ।");
        return;
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
      activateLocalFallback("Cloud BMLT load हुन सकेन। स्थानीय Notes र १५ अभ्यास MCQ देखाइएको छ। समस्या: "+(error.message||String(error)));
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