/* Independent HA recovery module.
   This keeps HA Notes, MCQ Practice and Mock Test usable if the main HA module
   fails before it registers its menu. It deliberately uses a separate namespace. */
(function(){
 const root=document.getElementById("haView");
 const host=root&&root.querySelector("#haContent");
 if(!root||!host)return;
 if(typeof window.ensureHAMenu==="function")return;
 const notes=[
  ["Vital signs","Temperature, pulse, respiratory rate and blood pressure are core vital signs.","तापक्रम, नाडी, श्वासदर र रक्तचाप मुख्य vital signs हुन्।"],
  ["Primary health care","PHC emphasizes accessible, essential, community-based care and prevention.","PHC ले पहुँचयोग्य, आवश्यक, समुदायमा आधारित सेवा र रोकथाममा जोड दिन्छ।"],
  ["Infection prevention","Hand hygiene, PPE, safe injection and sterilization reduce healthcare-associated infection.","हात सफाइ, PPE, सुरक्षित injection र sterilization ले संक्रमण घटाउँछन्।"],
  ["Dehydration","Assess thirst, mucous membranes, urine output, pulse and mental status; treat or refer by severity.","तिर्खा, मुखको श्लेष्मा, पिसाब, नाडी र चेतना जाँच गरी गम्भीरताअनुसार उपचार वा referral गर्नुहोस्।"],
  ["Hypertension","Measure BP correctly after rest; repeat abnormal readings and assess danger signs.","आरामपछि सही तरिकाले BP नाप्नुहोस्; असामान्य भए पुनः नापी danger signs जाँच्नुहोस्।"],
  ["Diabetes","Hypoglycemia may cause sweating, tremor, hunger, confusion or seizure.","Hypoglycemia मा पसिना, कम्पन, भोक, अलमल वा दौरा हुन सक्छ।"],
  ["Emergency ABC","Prioritize airway, breathing and circulation; call for help early.","Airway, breathing र circulation प्राथमिकता दिनुहोस्; छिटो सहायता बोलाउनुहोस्।"],
  ["Stroke","Sudden facial droop, arm weakness or speech difficulty needs urgent referral.","अचानक अनुहार बाङ्गिनु, हात कमजोर हुनु वा बोली बिग्रनुमा तुरुन्त referral चाहिन्छ।"]
 ];
 const bank=[
 ["The functional unit of kidney is:","मिर्गौलाको कार्यात्मक एकाइ कुन हो?",["Nephron","Neuron","Alveolus","Hepatocyte"],0,"Nephron forms the structural and functional unit of the kidney.","Nephron मिर्गौलाको संरचनात्मक तथा कार्यात्मक एकाइ हो।"],
 ["Which are core vital signs?","मुख्य vital signs कुन हुन्?",["Hair colour","Pulse and respiratory rate","Only height","Blood group"],1,"Pulse and respiratory rate are core vital signs.","नाडी र श्वासदर मुख्य vital signs हुन्।"],
 ["ADH mainly increases:","ADH ले मुख्यतः के बढाउँछ?",["Water reabsorption","Insulin secretion","Bile formation","Bone growth"],0,"ADH increases water reabsorption in renal collecting ducts.","ADH ले मिर्गौलाको collecting ducts मा पानी पुनःअवशोषण बढाउँछ।"],
 ["Alveoli are the main site of:","Alveoli मुख्यतः के हुने स्थान हो?",["Gas exchange","Urine formation","Food absorption","Blood clotting"],0,"Alveoli exchange oxygen and carbon dioxide.","Alveoli मा oxygen र carbon dioxide को आदानप्रदान हुन्छ।"],
 ["Immunization before disease is:","रोग हुनुअघि खोप दिनु कुन prevention हो?",["Primary","Secondary","Tertiary","Rehabilitation"],0,"Immunization is primary prevention.","खोप primary prevention हो।"],
 ["A common sign of hypoglycemia is:","Hypoglycemia को सामान्य लक्षण कुन हो?",["Sweating and tremor","Hair loss only","Tooth pain","Leg fracture"],0,"Low glucose can cause sweating, tremor and confusion.","Glucose कम हुँदा पसिना, कम्पन र अलमल हुन सक्छ।"],
 ["Sudden facial droop and arm weakness suggest:","अचानक अनुहार बाङ्गिनु र हात कमजोर हुनु केको संकेत हो?",["Stroke","Gastritis","Caries","Arthritis"],0,"Suspected stroke needs urgent assessment and referral.","Stroke को शंका भए तुरुन्त जाँच र referral चाहिन्छ।"],
 ["Which prevents infection in a clinic?","क्लिनिकमा संक्रमण रोक्ने उपाय कुन हो?",["Hand hygiene","Reusing needles","Skipping sterilization","Recapping used needles"],0,"Hand hygiene is a key infection-prevention measure.","हात सफाइ संक्रमण रोक्ने मुख्य उपाय हो।"],
 ["ORS should be mixed with:","ORS केमा घोल्नुपर्छ?",["Exact safe-water volume on packet","Any amount of water","Milk","Extra salt"],0,"Use the exact safe-water volume stated on the sachet.","प्याकेटमा लेखिएको ठ्याक्कै सुरक्षित पानीको मात्रा प्रयोग गर्नुहोस्।"],
 ["Which is a secondary prevention example?","Secondary prevention को उदाहरण कुन हो?",["Screening","Rehabilitation","Vaccination","Safe water"],0,"Screening supports early detection.","Screening ले रोग छिटो पहिचान गर्न मद्दत गर्छ।"],
 ["Insulin is secreted by pancreatic:","Insulin pancreas का कुन cell ले बनाउँछ?",["Beta cells","Alpha cells","Acinar cells","Red cells"],0,"Beta cells secrete insulin.","Beta cells ले insulin उत्पादन गर्छन्।"],
 ["The left ventricle pumps blood to:","Left ventricle ले रगत कहाँ पठाउँछ?",["Systemic circulation","Pulmonary veins only","Liver portal vein","Kidney tubules"],0,"It pumps oxygenated blood into the aorta.","यसले oxygen भएको रगत aorta मा पठाउँछ।"],
 ["A patient with severe breathlessness needs first:","गम्भीर सास कष्ट भएको बिरामीमा पहिले के गर्ने?",["ABC assessment and urgent help","Give food","Leave alone","Wait several hours"],0,"Assess airway, breathing and circulation; activate help.","Airway, breathing र circulation जाँचेर सहायता बोलाउनुहोस्।"],
 ["Primary prevention aims to:","Primary prevention को उद्देश्य के हो?",["Prevent disease before it occurs","Treat complications only","Rehabilitate disability","Diagnose late disease"],0,"It prevents disease before onset.","रोग सुरु हुनुअघि रोकथाम गर्नु यसको उद्देश्य हो।"],
 ["HbA1c reflects average glucose over about:","HbA1c ले करिब कति समयको औसत glucose देखाउँछ?",["2–3 months","2 hours","1 day","5 years"],0,"HbA1c reflects glycemia over roughly 2–3 months.","HbA1c ले करिब २–३ महिनाको औसत glucose देखाउँछ।"],
 ["During a seizure, the helper should:","दौरा हुँदा सहयोगीले के गर्नुपर्छ?",["Protect from injury and time seizure","Force an object into mouth","Hold limbs tightly","Give oral water"],0,"Protect the person, time the seizure, and do not put anything in the mouth.","चोटबाट बचाउनुहोस्, समय टिप्नुहोस् र मुखमा केही नहाल्नुहोस्।"],
 ["Case definition in surveillance ensures:","Surveillance मा case definition ले के गर्छ?",["Consistent case identification","Same medicine for all","No reporting","Only severe cases"],0,"Standard criteria improve consistent reporting.","मानक मापदण्डले केस पहिचान र प्रतिवेदन एकरूप बनाउँछ।"],
 ["A common dehydration indicator is:","Dehydration को संकेत कुन हो?",["Reduced urine output","Excessive urine always","Blue teeth","Increased hair growth"],0,"Reduced urine output may indicate dehydration.","पिसाब कम हुनु dehydration को संकेत हुन सक्छ।"],
 ["The first step in community diagnosis is:","Community diagnosis को पहिलो चरण के हो?",["Define community and collect data","Prescribe medicine to all","Ignore local priorities","Start without assessment"],0,"Define the population and collect reliable data.","समुदाय परिभाषित गरी भरपर्दो तथ्याङ्क संकलन गर्नुहोस्।"],
 ["Antibiotics are not routinely indicated for:","Antibiotic सामान्यतः कुन अवस्थामा आवश्यक हुँदैन?",["Uncomplicated viral common cold","Bacterial pneumonia","Selected bacterial infection","Clinician-diagnosed bacterial disease"],0,"Antibiotics do not treat viruses; assess for complications.","Antibiotic ले virus मार्दैन; complication भए जाँच आवश्यक हुन्छ।"]
 ];
 let mode="practice",list=[],pos=0,answers={};
 function menu(){
  host.innerHTML='<div class="ha-fallback-menu"><h2>HA अध्ययन मेनु</h2><p>मुख्य HA module उपलब्ध नभए पनि यो वैकल्पिक अध्ययन भाग चल्छ।</p><div class="ha-fallback-actions"><button data-ha-fb="notes">📘 Notes</button><button data-ha-fb="practice">📝 MCQ Practice ('+bank.length+')</button><button data-ha-fb="mock">⏱ Mock Test (20)</button></div><p class="muted">NHPC HA • English MCQ + नेपाली व्याख्या</p></div>';
 }
 function showNotes(){
  host.innerHTML='<div><button data-ha-fb="menu">← मुख्य मेनु</button><h2>HA Short Notes</h2>'+notes.map(n=>'<article class="ha-question"><h3>'+n[0]+'</h3><p>'+n[1]+'</p><p class="np">'+n[2]+'</p></article>').join("")+'</div>';
 }
 function start(which){
  mode=which;list=which==="mock"?bank.slice():bank.slice();if(which==="mock")list=list.slice(0,20);
  pos=0;answers={};render();
 }
 function render(){
  const q=list[pos],sel=answers[pos],done=sel!==undefined;
  host.innerHTML='<div><button data-ha-fb="menu">← मुख्य मेनु</button><p> '+(mode==="mock"?"Mock":"Practice")+' • प्रश्न '+(pos+1)+' / '+list.length+'</p><article class="ha-question"><h3>'+q[0]+'</h3><p class="np">'+q[1]+'</p><div class="ha-options">'+q[2].map((o,i)=>'<button data-ha-fb-opt="'+i+'" '+(done?'disabled':'')+'>'+String.fromCharCode(65+i)+'. '+o+'</button>').join("")+'</div>'+(done?'<div class="ha-explain"><b>'+(sel===q[3]?'सही उत्तर!':'सही उत्तर: '+q[2][q[3]])+'</b><p>'+q[4]+'</p><p class="np">'+q[5]+'</p></div>':'')+'</article><div class="ha-nav"><button data-ha-fb-prev '+(pos===0?'disabled':'')+'>← अघिल्लो</button><button data-ha-fb-next>'+(pos===list.length-1?'नतिजा':'अर्को →')+'</button></div></div>';
 }
 function finish(){
  const score=list.reduce((n,q,i)=>n+(answers[i]===q[3]?1:0),0);
  host.innerHTML='<div><h2>Mock Result</h2><h3>'+score+' / '+list.length+' ('+Math.round(score/list.length*100)+'%)</h3><p>यो अभ्यास नतिजा हो, पास हुने ग्यारेन्टी होइन।</p><button data-ha-fb="mock">फेरि Mock</button> <button data-ha-fb="menu">मुख्य मेनु</button></div>';
 }
 root.addEventListener("click",function(e){
  const b=e.target.closest("[data-ha-fb], [data-ha-fb-opt], [data-ha-fb-next], [data-ha-fb-prev]");if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.dataset.haFb==="menu")menu();
  else if(b.dataset.haFb==="notes")showNotes();
  else if(b.dataset.haFb==="practice")start("practice");
  else if(b.dataset.haFb==="mock")start("mock");
  else if(b.dataset.haFbOpt!==undefined){answers[pos]=Number(b.dataset.haFbOpt);render();}
  else if(b.dataset.haFbPrev!==undefined){pos=Math.max(0,pos-1);render();}
  else if(b.dataset.haFbNext!==undefined){if(pos===list.length-1)finish();else{pos++;render();}}
 },true);
 window.ensureHAMenu=menu;
 window.HAStudyActions=window.HAStudyActions||{menu,notes:showNotes,practice:()=>start("practice"),mock:()=>start("mock")};
 menu();
})();