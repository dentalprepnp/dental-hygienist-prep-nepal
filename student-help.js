import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const supabase=createClient("https://jrivojhpdupxnpefevzm.supabase.co","sb_publishable_rj6oDSLkwQipLCXPfVoy9w_0r6vqR0u");
const $=id=>document.getElementById(id), panel=$("aiHelpPanel"), fab=$("aiHelpFab"), messages=$("aiHelpMessages"), input=$("aiHelpInput"), form=$("aiHelpForm"), send=$("aiHelpSend");
if(panel&&fab&&messages&&input&&form){
 const quickAnswers=[
  [/login|sign.?in|password|wrong|credential/i,"Login सहायता:\n1) Signup गर्दा प्रयोग गरेको उही email लेख्नुहोस्।\n2) Password मा ठूला/साना अक्षर मिलाउनुहोस्।\n3) Email verify भएको छ कि जाँच्नुहोस्।\n4) Password बिर्सनुभएको भए Login पेजको Forgot Password प्रयोग गर्नुहोस्।\n5) बारम्बार नयाँ Signup नगर्नुहोस्।"],
  [/verify|verification|confirm.*email/i,"Email Verification:\n1) Signup गरेको email सही छ कि जाँच्नुहोस्।\n2) Inbox र Spam/Junk दुवै हेर्नुहोस्।\n3) Verification link खोल्नुहोस्।\n4) Email नआए Signup पेजको ‘Verification Email फेरि पठाउनुहोस्’ प्रयोग गर्नुहोस्।"],
  [/mcq|question|subject|content|not.*show|blank/i,"Subject/MCQ नदेखिए:\n1) Internet जाँच्नुहोस्।\n2) App बन्द गरेर फेरि खोल्नुहोस्।\n3) Browser मा page refresh गर्नुहोस्।\n4) केही समयपछि फेरि प्रयास गर्नुहोस्।\n5) समस्या रहेमा कुन Faculty/Subject र कुन screen मा अड्कियो लेख्नुहोस्।"],
  [/update|cache|load|loading|offline/i,"App Update/Loading:\n1) Internet जोड्नुहोस्।\n2) App पूर्ण रूपमा बन्द गरेर फेरि खोल्नुहोस्।\n3) Chrome बाट app खोल्दा refresh गर्नुहोस्।\n4) पुरानो version देखिए browser site data/cache clear गरेर फेरि खोल्नुहोस्। Offline हुँदा पहिले cache भएका सामग्री मात्र खुल्न सक्छन्."]
 ];
 function add(text,who="bot"){const b=document.createElement("div");b.className="ai-help-bubble "+(who==="user"?"ai-help-user":"ai-help-bot");b.textContent=text;messages.appendChild(b);messages.scrollTop=messages.scrollHeight;return b}
 function context(){const view=[...document.querySelectorAll(".view")].find(v=>!v.classList.contains("hidden"));return {page:view?.id||"home",faculty:document.querySelector(".track-card.active")?.innerText?.slice(0,100)||"not selected"}}
 function open(){panel.classList.remove("hidden");fab.setAttribute("aria-expanded","true");input.focus()}
 function close(){panel.classList.add("hidden");fab.setAttribute("aria-expanded","false")}
 fab.addEventListener("click",()=>panel.classList.contains("hidden")?open():close());
 $("aiHelpClose")?.addEventListener("click",close);
 document.querySelectorAll("[data-help-topic]").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.helpTopic;sendMessage()}));
 async function sendMessage(text=input.value.trim()){
  if(!text)return;if(text.length>1500){add("कृपया समस्या 1500 अक्षरभित्र लेख्नुहोस्।");return}
  input.value="";add(text,"user");const loading=add("समस्या बुझ्दैछु…");
  send.disabled=true;
  try{
   const {data,error}=await supabase.functions.invoke("student-help",{body:{message:text,context:context()}});
   loading.remove();
   if(error)throw error;
   if(!data?.reply)throw new Error("AI reply unavailable");
   add(data.reply);
  }catch(e){
   loading.remove();
   const found=quickAnswers.find(([rx])=>rx.test(text));
   if(found)add(found[1]+"\n\nयदि यो समाधान भएन भने समस्या/Faculty/Screen को विवरण Feedback मा पठाउनुहोस्।");
   else add("यो समस्या बुझ्न थप विवरण चाहिन्छ। कुन Faculty, कुन page, र के गर्दा error आयो भनेर लेख्नुहोस्। अहिले AI service connect नभएको वा network समस्या भएको हुन सक्छ।");
  }finally{send.disabled=false;input.focus()}
 }
 form.addEventListener("submit",e=>{e.preventDefault();sendMessage()});
}
