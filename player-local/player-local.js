(function(){
'use strict';
const VERSION='5.1.0-DIRECT-LOCAL-BLOB';
const CODE=(new URLSearchParams(location.search).get('code')||'TV-0001').trim();
const C=window.SUPABASE_CONFIG, API=C.url+'/rest/v1', KEY=C.key;
const H={apikey:KEY,Authorization:'Bearer '+KEY};
const CACHE='vd-media-v51';
const MANIFEST='vd_manifest_v51';
const SAVED_PLAYLIST='vd_playlist_v51_'+CODE;
const SAVED_FP='vd_playlist_fp_v51_'+CODE;
const stage=document.getElementById('stage'), status=document.getElementById('status');
let screen=null, activeItems=[], playIndex=0, playing=false, switching=false;
let currentEl=null, currentObjectUrl=null;
let manifest=safeJSON(localStorage.getItem(MANIFEST),{});
let playlistFp=localStorage.getItem(SAVED_FP)||'';
function safeJSON(v,f){try{return v?JSON.parse(v):f}catch(e){return f}}
function say(s){status.style.display='block';status.textContent=s;console.log('[VD5.1]',s)}
async function q(path){const r=await fetch(API+path,{headers:H,cache:'no-store'});if(!r.ok)throw new Error(await r.text());return r.json()}
function mediaUrl(m){return m.file_url||m.url||''}
function mediaFp(m){return [m.id,mediaUrl(m),m.updated_at||''].join('|')}
function listFp(pid,items){return pid+'::'+items.map(x=>[x.id,mediaUrl(x),x.updated_at||'',x.sort_order??x.position??0,x.duration||''].join('|')).join(';;')}
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
async function cacheResponse(url){const c=await caches.open(CACHE);return c.match(url,{ignoreVary:true})}
async function ensureMedia(m,n,total){
 const url=mediaUrl(m);if(!url)throw new Error('Mídia sem URL: '+m.name);
 const fp=mediaFp(m), hit=await cacheResponse(url);
 if(hit&&manifest[m.id]===fp)return;
 say('Baixando uma vez '+n+'/'+total+': '+m.name);
 const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Download '+r.status+' '+m.name);
 const c=await caches.open(CACHE);await c.put(url,r.clone());
 manifest[m.id]=fp;localStorage.setItem(MANIFEST,JSON.stringify(manifest));
}
async function localObjectUrl(m){
 const r=await cacheResponse(mediaUrl(m));if(!r)throw new Error('Arquivo local ausente: '+m.name);
 const blob=await r.blob();return URL.createObjectURL(blob);
}
function cleanupPlayback(){
 if(currentEl){try{currentEl.pause&&currentEl.pause()}catch(e){} currentEl=null}
 if(currentObjectUrl){try{URL.revokeObjectURL(currentObjectUrl)}catch(e){} currentObjectUrl=null}
}
function next(){playIndex=(playIndex+1)%activeItems.length;play()}
async function play(){
 if(!activeItems.length){playing=false;return}
 playing=true;const x=activeItems[playIndex%activeItems.length];cleanupPlayback();stage.innerHTML='';
 try{
   const local=await localObjectUrl(x);currentObjectUrl=local;
   let el;
   if(x.type==='image'){
     el=new Image();el.src=local;currentEl=el;stage.appendChild(el);status.style.display='none';setTimeout(next,(x.duration||10)*1000);
   }else{
     el=document.createElement('video');el.autoplay=true;el.muted=true;el.playsInline=true;el.preload='auto';el.src=local;currentEl=el;
     el.onended=next;el.onerror=()=>{say('Erro no arquivo local: '+x.name);setTimeout(next,3000)};
     stage.appendChild(el);status.style.display='none';el.play().catch(e=>say('Play local: '+e.message));
   }
 }catch(e){say(e.message);setTimeout(next,3000)}
}
function savePlaylist(items,fp){
 localStorage.setItem(SAVED_PLAYLIST,JSON.stringify(items));localStorage.setItem(SAVED_FP,fp);playlistFp=fp;
}
async function restoreLocal(){
 const saved=safeJSON(localStorage.getItem(SAVED_PLAYLIST),[]);if(!saved.length)return false;
 for(const m of saved){if(!(await cacheResponse(mediaUrl(m))))return false}
 activeItems=saved;playIndex=0;say('Reproduzindo arquivos locais');play();return true;
}
async function fetchDesired(){
 const ss=await q('/screens?code=eq.'+encodeURIComponent(CODE)+'&active=eq.true&select=*');
 if(!ss.length)throw new Error('Tela '+CODE+' não encontrada/ativa');screen=ss[0];
 const sch=await q('/schedules?active=eq.true&screen_id=eq.'+screen.id+'&select=*');
 if(sch.length&&!sch.some(s=>scheduleMatches(s,new Date())))return {outside:true};
 const chosen=sch.find(s=>scheduleMatches(s,new Date()));const pid=(chosen&&chosen.playlist_id)||screen.playlist_id;
 if(!pid)throw new Error('Tela sem playlist');
 const pi=await q('/playlist_items?playlist_id=eq.'+pid+'&select=media_id,sort_order,position,duration&order=sort_order.asc');
 const ids=pi.map(x=>x.media_id).filter(Boolean);if(!ids.length)throw new Error('Playlist vazia');
 const ms=await q('/media?id=in.('+ids.join(',')+')&active=eq.true&select=id,name,type,url,file_url,duration,updated_at');
 const mm=Object.fromEntries(ms.map(x=>[x.id,x]));
 const items=pi.map(p=>Object.assign({},mm[p.media_id]||{},p)).filter(x=>x.id);
 return {outside:false,pid,items,fp:listFp(pid,items)};
}
async function sync(){
 if(switching)return;switching=true;
 try{
   const d=await fetchDesired();
   if(d.outside){cleanupPlayback();stage.innerHTML='';activeItems=[];playing=false;say('Fora do horário de programação');return}
   if(d.fp===playlistFp&&activeItems.length){console.log('[VD5.1] Sem alteração; zero download de mídia');return}
   // Stage every required file first. Current playlist continues while downloads happen.
   for(let i=0;i<d.items.length;i++)await ensureMedia(d.items[i],i+1,d.items.length);
   savePlaylist(d.items,d.fp);activeItems=d.items;playIndex=0;
   say('Atualização concluída; reprodução 100% local');play();
 }catch(e){say('Sincronização: '+e.message);if(activeItems.length&&!playing)play()}
 finally{switching=false}
}
async function removeOldServiceWorker(){
 if(!('serviceWorker'in navigator))return false;
 const regs=await navigator.serviceWorker.getRegistrations();
 if(!regs.length)return false;
 for(const r of regs)await r.unregister();
 return !!navigator.serviceWorker.controller;
}
async function boot(){
 if(!('caches'in window)){say('Este navegador não oferece Cache Storage');return}
 try{
   // v5.1 intentionally does NOT depend on Service Worker (important on Samsung Tizen 9).
   const wasControlled=await removeOldServiceWorker();
   if(wasControlled&&!sessionStorage.getItem('vd51_sw_cleared')){
     sessionStorage.setItem('vd51_sw_cleared','1');say('Removendo cache antigo…');setTimeout(()=>location.reload(),800);return;
   }
   await restoreLocal();
   await sync();
   setInterval(sync,360000); // metadata only every 6 minutes; media downloads only on real change.
 }catch(e){say('Falha ao iniciar: '+e.message)}
}
boot();
})();
