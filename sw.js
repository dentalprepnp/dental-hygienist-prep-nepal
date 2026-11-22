/* Resilient PWA cache: one unavailable optional file must not block app updates. */
const CACHE="hl-preparation-v311-password-confirm";
const ASSETS=[
 "./","./index.html","./admin.html","./admin-portal.js?v=3","./feedback.js?v=3",
 "./about.html","./privacy.html","./styles.css?v=274","./app.js?v=175","./auth.js?v=10",
 "./progress-sync.js?v=4","./admin-dashboard.js?v=6","./manifest.webmanifest","./icon.svg",
 "./oral-pathology.js?v=148","./dental-materials.js?v=148","./oral-anatomy.js?v=148",
 "./dental-public-health.js?v=148","./dental-radiology.js?v=148","./dental-pharmacy.js?v=149",
 "./bmlt.js?v=2","./pharmacy-faculties.js?v=1","./dental-ethics.js?v=148",
 "./food-nutrition.js?v=150","./epidemiology-community.js?v=150","./dha.js?v=147",
 "./nhpc.js?v=192","./ha-general-medicine.js?v=156","./mlt.js?v=148",
 "./bsc-anesthesia.js?v=148","./radiotherapy.js?v=9","./ott.js?v=20",
 "./radiography.js?v=148","./physiotherapy.js?v=147","./ophthalmic-science.js?v=147"
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
 const refreshFirst=request.mode==="navigate"||request.destination==="document"||request.destination==="script";
 if(refreshFirst){
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
  }catch{
   return caches.match("./index.html");
  }
 })());
});
