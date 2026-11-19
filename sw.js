const CACHE="hl-preparation-v303-pharmacy-faculties";
const ASSETS=["./","./index.html","./admin.html","./admin-portal.js?v=3","./feedback.js?v=3","./about.html","./privacy.html","./styles.css?v=274","./app.js?v=169","./auth.js?v=5","./progress-sync.js?v=4","./admin-dashboard.js?v=6","./manifest.webmanifest","./icon.svg","./oral-pathology.js?v=148","./dental-materials.js?v=148","./oral-anatomy.js?v=148","./dental-public-health.js?v=148","./dental-radiology.js?v=148","./dental-pharmacy.js?v=149","./pharmacy-faculties.js?v=1","./dental-ethics.js?v=148","./food-nutrition.js?v=150","./epidemiology-community.js?v=150","./dha.js?v=147","./nhpc.js?v=192","./ha-general-medicine.js?v=156","./mlt.js?v=148","./bsc-anesthesia.js?v=148","./radiotherapy.js?v=9","./ott.js?v=20","./radiography.js?v=148","./physiotherapy.js?v=147","./ophthalmic-science.js?v=147"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("message",e=>{if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET"||new URL(e.request.url).origin!==self.location.origin)return;
 const refreshFirst=e.request.mode==="navigate"||e.request.destination==="document"||e.request.destination==="script";
 if(refreshFirst){
  e.respondWith(fetch(e.request).then(response=>{
   if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
   return response;
  }).catch(()=>caches.match(e.request).then(cached=>cached||caches.match("./index.html"))));
  return;
 }
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{
  const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return response;
 }).catch(()=>caches.match("./index.html"))));
});
