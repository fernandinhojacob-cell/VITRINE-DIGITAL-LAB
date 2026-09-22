
const CACHE='vd-media-v5';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

async function fromCache(req){
  const cache=await caches.open(CACHE);
  // Media URLs are stored by their original absolute URL.
  const hit=await cache.match(req.url,{ignoreVary:true});
  if(!hit)return null;
  const range=req.headers.get('range');
  if(!range)return hit;
  // Local byte-range support for Tizen/HTML5 video seeking.
  const blob=await hit.blob();
  const m=/bytes=(\d+)-(\d*)/.exec(range);
  if(!m)return hit;
  const start=Number(m[1]), end=m[2]?Number(m[2]):blob.size-1;
  if(start>=blob.size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+blob.size}});
  const part=blob.slice(start,Math.min(end+1,blob.size),blob.type);
  return new Response(part,{status:206,headers:{
    'Content-Type':blob.type||hit.headers.get('Content-Type')||'application/octet-stream',
    'Content-Length':String(part.size),
    'Content-Range':`bytes ${start}-${start+part.size-1}/${blob.size}`,
    'Accept-Ranges':'bytes'
  }});
}

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.endsWith('.supabase.co') && u.pathname.includes('/storage/v1/object/')){
    e.respondWith((async()=>{
      const hit=await fromCache(e.request);
      if(hit)return hit;
      return fetch(e.request);
    })());
  }
});
