
(function(){
'use strict';
const VERSION='5.0.0-WEB-LOCAL-CACHE';
const CODE=(new URLSearchParams(location.search).get('code')||'TV-0001').trim();
const C=window.SUPABASE_CONFIG, API=C.url+'/rest/v1', KEY=C.key;
const H={apikey:KEY,Authorization:'Bearer '+KEY};
const CACHE='vd-media-v5', MANIFEST='vd_manifest_v5';
const stage=document.getElementById('stage'), status=document.getElementById('status');
let screen=null, activeItems=[], playIndex=0, playing=false, switching=false;
let manifest=JSON.parse(localStorage.getItem(MANIFEST)||'{}');

function say(s){status.style.display='block';status.textContent=s;console.log('[VD5]',s)}
async function q(path){const r=await fetch(API+path,{headers:H,cache:'no-store'});if(!r.ok)throw new Error(await r.text());return r.json()}
function mediaUrl(m){return m.file_url||m.url||''}
function fingerprint(m){return [mediaUrl(m),m.updated_at||'',m.id].join('|')}
function dayToken(d){return ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'][d.getDay()]}
function scheduleMatches(s,now){
 if(s.active===false)return false;
 const iso=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
 if(s.start_date&&iso<s.start_date)return false;if(s.end_date&&iso>s.end_date)return false;
 const days=String(s.days||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(days.length&&!days.includes(dayToken(now)))return false;
 const t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const st=String(s.start_time||'').slice(0,5),et=String(s.end_time||'').slice(0,5);
 if(st&&et&&st<=et&&(t<st||t>et))return false;
 if(st&&et&&st>et&&(t>et&&t<st))return false;
 return true;
}
async function cacheHas(url){
 const c=await caches.open(CACHE);return !!(await c.match(url,{ignoreVary:true}));
}
async function downloadOne(m,n,total){
 const url=mediaUrl(m); if(!url)throw new Error('Mídia sem URL: '+m.name);
 if(manifest[m.id]===fingerprint(m) && await cacheHas(url))return;
 say('Baixando '+n+'/'+total+': '+m.name);
 const r=await fetch(url,{cache:'no-store'});
 if(!r.ok)throw new Error('Download '+r.status+' '+m.name);
 const c=await caches.open(CACHE);
 await c.put(url,r.clone());
 manifest[m.id]=fingerprint(m);localStorage.setItem(MANIFEST,JSON.stringify(manifest));
}
async function preparePlaylist(){
 const ss=await q('/screens?code=eq.'+encodeURIComponent(CODE)+'&active=eq.true&select=*');
 if(!ss.length)throw new Error('Tela '+CODE+' não encontrada/ativa'); screen=ss[0];
 const sch=await q('/schedules?active=eq.true&screen_id=eq.'+screen.id+'&select=*');
 if(sch.length&&!sch.some(s=>scheduleMatches(s,new Date()))){
   stage.innerHTML='';activeItems=[];playing=false;say('Fora do horário de programação');return;
 }
 const chosen=sch.find(s=>scheduleMatches(s,new Date()));
 const pid=(chosen&&chosen.playlist_id)||screen.playlist_id;
 if(!pid)throw new Error('Tela sem playlist');
 const pi=await q('/playlist_items?playlist_id=eq.'+pid+'&select=media_id,sort_order,position,duration&order=sort_order.asc');
 const ids=pi.map(x=>x.media_id).filter(Boolean);
 if(!ids.length)throw new Error('Playlist vazia');
 const ms=await q('/media?id=in.('+ids.join(',')+')&active=eq.true&select=id,name,type,url,file_url,duration,updated_at');
 const mm=Object.fromEntries(ms.map(x=>[x.id,x]));
 const next=pi.map(p=>Object.assign({},mm[p.media_id]||{},p)).filter(x=>x.id);
 // Important: keep current playlist playing while ALL new media are downloaded.
 for(let i=0;i<next.length;i++)await downloadOne(next[i],i+1,next.length);
 activeItems=next;playIndex=0;
 say('Arquivos locais prontos');
 if(!playing)play();
}
function next(){playIndex=(playIndex+1)%activeItems.length;play()}
function play(){
 if(!activeItems.length){playing=false;return}
 playing=true;const x=activeItems[playIndex%activeItems.length],url=mediaUrl(x);stage.innerHTML='';
 let el;
 if(x.type==='image'){el=new Image();el.src=url;stage.appendChild(el);status.style.display='none';setTimeout(next,(x.duration||10)*1000)}
 else{el=document.createElement('video');el.autoplay=true;el.muted=true;el.playsInline=true;el.preload='auto';el.src=url;
 el.onended=next;el.onerror=()=>{say('Erro ao reproduzir '+x.name);setTimeout(next,3000)};
 stage.appendChild(el);status.style.display='none';el.play().catch(e=>say('Play: '+e.message))}
}
async function heartbeat(){
 if(!screen)return;
 try{await fetch(API+'/screens?id=eq.'+screen.id,{method:'PATCH',headers:{...H,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({status:'online',ultima_conexao:new Date().toISOString(),updated_at:new Date().toISOString()})})}catch(e){}
}
async function refresh(){
 if(switching)return;switching=true;
 try{await preparePlaylist();await heartbeat()}catch(e){say('Offline/erro: '+e.message);if(activeItems.length&&!playing)play()}
 finally{switching=false}
}
async function boot(){
 if(!('serviceWorker'in navigator)||!('caches'in window)){say('Este navegador não oferece Service Worker/Cache Storage');return}
 try{
   const reg=await navigator.serviceWorker.register('./sw.js?v=5.0.0',{scope:'./'});
   await navigator.serviceWorker.ready;
   if(!navigator.serviceWorker.controller){say('Ativando cache local… recarregando');setTimeout(()=>location.reload(),1200);return}
   await refresh();
   // Control traffic only: approximately AbleSign-like cadence.
   setInterval(refresh,360000);
 }catch(e){say('Falha ao iniciar cache local: '+e.message)}
}
boot();
})();
