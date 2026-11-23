/* Lightweight PWA cache: precache only the app shell.
   Faculty modules are cached on first use and served cache-first afterwards. */
const CACHE="hl-preparation-v324-free-question-import-cache";
const ASSETS=[
 "./","./index.html","./feedback.js?v=3",
 "./about.html","./privacy.html","./styles.css?v=275","./app.js?v=175","./auth.js?v=10",
 "./progress-sync.js?v=4","./admin-dashboard.js?v=6","./student-help.js?v=1","./weekly-live-exam.js?v=1","./admin-exams.js?v=4",
 "./manifest.webmanifest","./icon.svg"
];
self.addEventListener("install",event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.allSettled(ASSETS.map(asset=>cache.add(asset)));
})()));
self.addEventListener("message",event=>{
 if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting();
});
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 if(request.destination==="script"||request.destination==="style"){
  event.respondWith((async()=>{
   const cached=await caches.match(request);
   if(cached)return cached;
   try{
    const response=await fetch(request);
    if(response&&response.ok){
     const copy=response.clone();
     caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
    }
    return response;
   }catch{return new Response("Offline: this module has not been downloaded yet.",{status:503,statusText:"Offline"});}
  })());
  return;
 }
 if(request.mode==="navigate"||request.destination==="document"){
  event.respondWith((async()=>{
   try{
    const response=await fetch(request);
    if(!response||!response.ok)throw new Error("Network response unavailable");
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
    return response;
   }catch{
    const cached=await caches.match(request);
    return cached||caches.match("./index.html");
   }
  })());
  return;
 }
 event.respondWith((async()=>{
  const cached=await caches.match(request);
  if(cached)return cached;
  try{
   const response=await fetch(request);
   if(response&&response.ok){
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
   }
   return response;
  }catch{return caches.match("./index.html");}
 })());
});
