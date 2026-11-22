// Supabase Edge Function: public student help endpoint for pre-login support.
// Configure OPENAI_API_KEY as a Supabase Function secret before deploying.
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return new Response(JSON.stringify({error:"POST required"}),{status:405,headers:{...cors,"Content-Type":"application/json"}});
 try{
  const body=await req.json();const message=String(body?.message||"").trim();
  if(!message||message.length>1500)return new Response(JSON.stringify({error:"Message must be 1–1500 characters"}),{status:400,headers:{...cors,"Content-Type":"application/json"}});
  const apiKey=Deno.env.get("OPENAI_API_KEY");if(!apiKey)return new Response(JSON.stringify({error:"AI service is not configured"}),{status:503,headers:{...cors,"Content-Type":"application/json"}});
  const page=String(body?.context?.page||"home").slice(0,80),faculty=String(body?.context?.faculty||"not selected").slice(0,100);
  const system=`You are HL Preparation Nepal's student support assistant for ALL health education faculties and exams. Understand the student's issue and give friendly, simple step-by-step help in Nepali or English matching their language. Help with login/signup, email verification, password reset, app loading/cache, faculty/subject navigation, MCQ/notes/mock tests, progress sync, and how to report a bug. Context: current page ${page}; faculty ${faculty}. Never ask for passwords, OTPs, API keys, or sensitive personal information. Do not claim to change accounts, deploy code, or fix a server unless you actually can. For login problems, advise exact signup email, verify inbox/spam, resend verification, and Forgot Password. If unsure, ask one focused question and guide them to the in-app Feedback/Admin support. For medical questions, explain this is an exam study app and advise consulting a qualified professional for real patient care. Be concise, reassuring, and actionable.`;
  const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:message}],temperature:0.3,max_tokens:550})});
  const data=await response.json();if(!response.ok)throw new Error(data?.error?.message||"AI provider error");
  const reply=String(data?.choices?.[0]?.message?.content||"माफ गर्नुहोस्, अहिले जवाफ तयार भएन।").slice(0,5000);
  return new Response(JSON.stringify({reply}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:"Help service temporarily unavailable"}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
