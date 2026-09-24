(()=>{"use strict";
const VER="6.5.0-FAST-SYNC-REDOWNLOAD-GUARD"; const CFG=window.SUPABASE_CONFIG||{}; const BASE=(CFG.url||"").replace(/\/$/,""); const KEY=CFG.key||"";
const CODE=new URLSearchParams(location.search).get("code")||"TV-0001"; const DBN="vd_player_local_v6", MEDIA="media", META="meta";
const CHECK_MS=2*60*1000, HEART_MS=60*1000; let sessionDownloads=0; let db=null,screen=null,active=[],idx=0,currentObjectUrl=null,playing=false,scheduleTimer=null,currentPlay=null;
const stage=document.getElementById("stage"),msg=document.getElementById("msg");
function show(t){msg.textContent=t;msg.style.display="flex"} function hide(){msg.style.display="none"}
function isFullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement)}
async function requestFullscreen(){
 if(isFullscreen())return true;
 const el=document.documentElement;
 try{
   if(el.requestFullscreen)await el.requestFullscreen({navigationUI:"hide"});
   else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
   else if(el.msRequestFullscreen)el.msRequestFullscreen();
 }catch(e){}
 return isFullscreen();
}
function armFullscreen(){
 const go=()=>{requestFullscreen();};
 document.addEventListener("pointerdown",go,{passive:true});
 document.addEventListener("touchstart",go,{passive:true});
 document.addEventListener("click",go,{passive:true});
 document.addEventListener("keydown",go);
 window.addEventListener("focus",()=>setTimeout(requestFullscreen,250));
}
function hdr(extra={}){return Object.assign({"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json"},extra)}
async function rest(path,opt={}){let r=await fetch(BASE+"/rest/v1/"+path,Object.assign({headers:hdr()},opt));if(!r.ok)throw Error("REST "+r.status+" "+await r.text());let t=await r.text();return t?JSON.parse(t):null}
function openDB(){return new Promise((a,b)=>{let r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>{let d=r.result;if(!d.objectStoreNames.contains(MEDIA))d.createObjectStore(MEDIA);if(!d.objectStoreNames.contains(META))d.createObjectStore(META)};r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)})}
function get(s,k){return new Promise((a,b)=>{let r=db.transaction(s).objectStore(s).get(k);r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)})}
function put(s,k,v){return new Promise((a,b)=>{let r=db.transaction(s,"readwrite").objectStore(s).put(v,k);r.onsuccess=()=>a();r.onerror=()=>b(r.error)})}
function del(s,k){return new Promise((a,b)=>{let r=db.transaction(s,"readwrite").objectStore(s).delete(k);r.onsuccess=()=>a();r.onerror=()=>b(r.error)})}
function fingerprint(x){return [x.media_id,x.url,x.updated_at||"",x.type||""].join("|")}
function dayToken(d=new Date()){return ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"][d.getDay()]}
function hmss(d=new Date()){return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0")}
function dateYMD(d=new Date()){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function scheduleMatches(x,now=new Date()){
 if(!x||x.active===false)return false; const ymd=dateYMD(now), day=dayToken(now), t=hmss(now);
 if(x.start_date&&ymd<x.start_date)return false;if(x.end_date&&ymd>x.end_date)return false;
 if(x.days){let ds=String(x.days).split(",").map(v=>v.trim());if(ds.length&&!ds.includes(day))return false}
 let a=x.start_time||"00:00:00",b=x.end_time||"23:59:59";
 return a<=b ? (t>=a&&t<=b) : (t>=a||t<=b);
}
async function loadSchedules(){
 if(!screen)return []; let q="schedules?active=eq.true&select=id,name,screen_id,group_id,playlist_id,start_date,end_date,start_time,end_time,days,active";
 let all=await rest(q), rel=(all||[]).filter(x=>x.screen_id===screen.id||(screen.group_id&&x.group_id===screen.group_id));
 await put(META,"schedules",rel); return rel;
}
async function scheduleAllowed(){let sc=await get(META,"schedules");if(!sc||!sc.length)return true;return sc.some(x=>scheduleMatches(x))}
async function applySchedule(){let ok=await scheduleAllowed();if(!ok){cleanupNode();playing=false;show("");return}if(!playing&&active.length){idx=0;next()}}
async function loadRemote(){
 let ss=await rest("screens?code=eq."+encodeURIComponent(CODE)+"&active=eq.true&select=id,code,name,orientation,playlist_id,group_id,active&limit=1");
 if(!ss||!ss[0])throw Error("Tela "+CODE+" não encontrada/ativa"); screen=ss[0];
 let rows=await rest("playlist_items?playlist_id=eq."+screen.playlist_id+"&select=id,position,sort_order,duration,media:media_id(id,name,type,url,file_url,duration,updated_at,active)&order=sort_order.asc.nullslast,position.asc");
 await loadSchedules();
 return (rows||[]).filter(x=>x.media&&x.media.active!==false).map(x=>({item_id:x.id,media_id:x.media.id,name:x.media.name,type:x.media.type||"video",url:x.media.file_url||x.media.url,duration:x.duration||x.media.duration||10,updated_at:x.media.updated_at||""})).filter(x=>x.url);
}
async function ensure(x){
 let fp=fingerprint(x), rec=await get(MEDIA,x.media_id);
 if(rec&&rec.blob instanceof Blob&&rec.blob.size>0){
   const oldUrl=rec.url||String(rec.fp||"").split("|")[1]||"";
   if(rec.fp===fp||oldUrl===x.url){
     if(rec.fp!==fp||rec.url!==x.url)await put(MEDIA,x.media_id,Object.assign({},rec,{fp,url:x.url,name:x.name}));
     return Object.assign({},x,{blob:rec.blob});
   }
 }
 show("Baixando conteúdo novo: "+x.name);
 let r=await fetch(x.url,{cache:"no-store"}); if(!r.ok)throw Error("Download "+r.status+" "+x.name);
 let blob=await r.blob(); sessionDownloads++; await put(MEDIA,x.media_id,{fp,url:x.url,blob,name:x.name,saved_at:Date.now()});
 return Object.assign({},x,{blob});
}
async function cleanupOld(items){let keep=new Set(items.map(x=>x.media_id)),m=await get(META,"playlist"),old=(m&&m.items)||[];for(const x of old){if(!keep.has(x.media_id))await del(MEDIA,x.media_id)}}
async function saveManifest(items){await put(META,"playlist",{screen,items:items.map(x=>{let y=Object.assign({},x);delete y.blob;return y}),saved_at:Date.now()})}
async function localFromManifest(){
 let m=await get(META,"playlist"); if(!m||!m.items)return [];
 let out=[]; for(let x of m.items){let rec=await get(MEDIA,x.media_id);if(rec&&rec.blob instanceof Blob)out.push(Object.assign({},x,{blob:rec.blob}))} return out;
}
async function syncPing(state="ok",files=active.length){
 if(!screen)return;
 const pid=String(screen.playlist_id||"").slice(0,12);
 const detail=VER+"|state="+state+"|files="+Number(files||0)+"|playlist="+pid;
 try{await rest("screen_heartbeat",{method:"POST",headers:hdr({"Prefer":"return=minimal"}),body:JSON.stringify({screen_id:screen.id,player_version:detail})})}catch(e){}
}
async function proofStart(x){
 if(!screen||!x)return null;
 const row={screen_id:screen.id,media_id:x.media_id,playlist_id:screen.playlist_id||null,started_at:new Date().toISOString(),status:"started"};
 try{let r=await rest("proof_of_play",{method:"POST",headers:hdr({"Prefer":"return=representation"}),body:JSON.stringify(row)});return r&&r[0]?r[0]:null}catch(e){return null}
}
async function proofEnd(rec){
 if(!rec||!rec.id)return;
 const end=new Date(),start=new Date(rec.started_at),secs=Math.max(0,Math.round((end-start)/1000));
 try{await rest("proof_of_play?id=eq."+encodeURIComponent(rec.id),{method:"PATCH",headers:hdr({"Prefer":"return=minimal"}),body:JSON.stringify({ended_at:end.toISOString(),duration_seconds:secs,status:"played"})})}catch(e){}
}
function cleanupNode(){if(currentPlay){proofEnd(currentPlay);currentPlay=null}while(stage.firstChild)stage.removeChild(stage.firstChild);if(currentObjectUrl){URL.revokeObjectURL(currentObjectUrl);currentObjectUrl=null}}
function next(){
 if(!active.length){show("Aguardando conteúdo");playing=false;return}
 cleanupNode(); hide(); let x=active[idx%active.length];idx++; currentObjectUrl=URL.createObjectURL(x.blob); proofStart(x).then(r=>{currentPlay=r});
 let el;
 if((x.type||"").toLowerCase()==="image"){el=document.createElement("img");el.src=currentObjectUrl;stage.appendChild(el);setTimeout(next,Math.max(1,+x.duration||10)*1000)}
 else{el=document.createElement("video");el.autoplay=true;el.muted=true;el.playsInline=true;el.src=currentObjectUrl;stage.appendChild(el);el.addEventListener("ended",next,{once:true});el.addEventListener("error",()=>setTimeout(next,1000),{once:true});el.play().catch(()=>{})}
 playing=true;setTimeout(requestFullscreen,100);
}
async function refresh(){
 try{
   let desired=await loadRemote(), sig=desired.map(fingerprint).join("||"), old=await get(META,"signature");
   if(sig!==old||!active.length){
     await syncPing("downloading",active.length);
     let staged=[];for(let x of desired)staged.push(await ensure(x));
     await cleanupOld(staged);active=staged;await saveManifest(staged);await put(META,"signature",sig);
     if(!playing&&await scheduleAllowed()){idx=0;next()}
     await syncPing("ok",active.length);
   }
 }catch(e){console.warn(e);if(!active.length){active=await localFromManifest();if(active.length){idx=0;next()}else show("Sem conexão e sem playlist local")}}
}
async function heartbeat(){
 if(!screen)return;
 try{await rest("screens?id=eq."+screen.id,{method:"PATCH",headers:hdr({"Prefer":"return=minimal"}),body:JSON.stringify({status:"online",ultima_conexao:new Date().toISOString()})})}catch(e){}
}

async function boot(){
 armFullscreen();setTimeout(requestFullscreen,300);
 if(!BASE||!KEY){show("Configuração Supabase ausente");return}
 db=await openDB(); active=await localFromManifest(); if(active.length){idx=0;next()}
 await refresh(); await applySchedule(); await heartbeat(); await syncPing(); setInterval(()=>{refresh();syncPing()},CHECK_MS);setInterval(heartbeat,HEART_MS);scheduleTimer=setInterval(applySchedule,30000);
}
boot();
})();