/* Lightweight PWA cache: precache the app shell; fetch scripts/styles fresh first,
   with cached copies as an offline fallback. */
const CACHE="hl-preparation-v588-restore-dha-original";
const ASSETS=[
 "./","./index.html","./study-guide.js?v=3","./feedback.js?v=3",
 "./about.html","./privacy.html","./styles.css?v=299","./app.js?v=204","./auth.js?v=11",
 "./membership.js?v=3","./assets/qr-payment.png","./progress-sync.js?v=4","./admin-dashboard.js?v=6","./student-help.js?v=1","./weekly-live-exam.js?v=1","./admin-exams.js?v=5",
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
  // Try the latest faculty module/style first; use cache only when offline.
  event.respondWith((async()=>{
   try{
    const response=await fetch(request,{cache:"no-store"});
    if(response&&response.ok){
     const copy=response.clone();
     caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});
    }
    return response;
   }catch{
    const cached=await caches.match(request);
    return cached||new Response("Offline: this module has not been downloaded yet.",{status:503,statusText:"Offline"});
   }
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
