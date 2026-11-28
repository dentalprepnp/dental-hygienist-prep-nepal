/* Membership protection: do not persist the app shell or study scripts for offline use.
   Content must be fetched online so a revoked/expired membership cannot keep using cached lessons. */
const CACHE="hl-preparation-v668-online-membership-gate";
const ASSETS=[
 "./assets/qr-payment.png","./manifest.webmanifest","./icon.svg"
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
 if(request.mode==="navigate"||request.destination==="document"||
    request.destination==="script"||request.destination==="style"){
  event.respondWith(fetch(request,{cache:"no-store"}));
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
  }catch{return new Response("Internet connection required for protected study content.",{status:503,statusText:"Offline"});}
 })());
});
