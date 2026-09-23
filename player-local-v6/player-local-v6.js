(()=>{"use strict";
const VER="6.0.0-IDB-LOCAL"; const CFG=window.SUPABASE_CONFIG||{}; const BASE=(CFG.url||"").replace(/\/$/,""); const KEY=CFG.key||"";
const CODE=new URLSearchParams(location.search).get("code")||"TV-0001"; const DBN="vd_player_local_v6", MEDIA="media", META="meta";
const CHECK_MS=6*60*1000, HEART_MS=60*1000; let db=null,screen=null,active=[],idx=0,currentObjectUrl=null,playing=false;
const stage=document.getElementById("stage"),msg=document.getElementById("msg");
function show(t){msg.textContent=t;msg.style.display="flex"} function hide(){msg.style.display="none"}
function hdr(extra={}){return Object.assign({"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json"},extra)}
async function rest(path,opt={}){let r=await fetch(BASE+"/rest/v1/"+path,Object.assign({headers:hdr()},opt));if(!r.ok)throw Error("REST "+r.status+" "+await r.text());let t=await r.text();return t?JSON.parse(t):null}
function openDB(){return new Promise((a,b)=>{let r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>{let d=r.result;if(!d.objectStoreNames.contains(MEDIA))d.createObjectStore(MEDIA);if(!d.objectStoreNames.contains(META))d.createObjectStore(META)};r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)})}
function get(s,k){return new Promise((a,b)=>{let r=db.transaction(s).objectStore(s).get(k);r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)})}
function put(s,k,v){return new Promise((a,b)=>{let r=db.transaction(s,"readwrite").objectStore(s).put(v,k);r.onsuccess=()=>a();r.onerror=()=>b(r.error)})}
function del(s,k){return new Promise((a,b)=>{let r=db.transaction(s,"readwrite").objectStore(s).delete(k);r.onsuccess=()=>a();r.onerror=()=>b(r.error)})}
function fingerprint(x){return [x.media_id,x.url,x.updated_at||"",x.type||""].join("|")}
async function loadRemote(){
 let ss=await rest("screens?code=eq."+encodeURIComponent(CODE)+"&active=eq.true&select=id,code,name,orientation,playlist_id,active&limit=1");
 if(!ss||!ss[0])throw Error("Tela "+CODE+" não encontrada/ativa"); screen=ss[0];
 let rows=await rest("playlist_items?playlist_id=eq."+screen.playlist_id+"&select=id,position,sort_order,duration,media:media_id(id,name,type,url,file_url,duration,updated_at,active)&order=sort_order.asc.nullslast,position.asc");
 return (rows||[]).filter(x=>x.media&&x.media.active!==false).map(x=>({item_id:x.id,media_id:x.media.id,name:x.media.name,type:x.media.type||"video",url:x.media.file_url||x.media.url,duration:x.duration||x.media.duration||10,updated_at:x.media.updated_at||""})).filter(x=>x.url);
}
async function ensure(x){
 let fp=fingerprint(x), rec=await get(MEDIA,x.media_id);
 if(rec&&rec.fp===fp&&rec.blob instanceof Blob)return Object.assign({},x,{blob:rec.blob});
 show("Baixando conteúdo novo: "+x.name);
 let r=await fetch(x.url,{cache:"no-store"}); if(!r.ok)throw Error("Download "+r.status+" "+x.name);
 let blob=await r.blob(); await put(MEDIA,x.media_id,{fp,blob,name:x.name,saved_at:Date.now()});
 return Object.assign({},x,{blob});
}
async function saveManifest(items){await put(META,"playlist",{screen,items:items.map(x=>{let y=Object.assign({},x);delete y.blob;return y}),saved_at:Date.now()})}
async function localFromManifest(){
 let m=await get(META,"playlist"); if(!m||!m.items)return [];
 let out=[]; for(let x of m.items){let rec=await get(MEDIA,x.media_id);if(rec&&rec.blob instanceof Blob)out.push(Object.assign({},x,{blob:rec.blob}))} return out;
}
function cleanupNode(){while(stage.firstChild)stage.removeChild(stage.firstChild);if(currentObjectUrl){URL.revokeObjectURL(currentObjectUrl);currentObjectUrl=null}}
function next(){
 if(!active.length){show("Aguardando conteúdo");playing=false;return}
 cleanupNode(); hide(); let x=active[idx%active.length];idx++; currentObjectUrl=URL.createObjectURL(x.blob);
 let el;
 if((x.type||"").toLowerCase()==="image"){el=document.createElement("img");el.src=currentObjectUrl;stage.appendChild(el);setTimeout(next,Math.max(1,+x.duration||10)*1000)}
 else{el=document.createElement("video");el.autoplay=true;el.muted=true;el.playsInline=true;el.src=currentObjectUrl;stage.appendChild(el);el.addEventListener("ended",next,{once:true});el.addEventListener("error",()=>setTimeout(next,1000),{once:true});el.play().catch(()=>{})}
 playing=true;
}
async function refresh(){
 try{
   let desired=await loadRemote(), sig=desired.map(fingerprint).join("||"), old=await get(META,"signature");
   if(sig!==old||!active.length){
     let staged=[];for(let x of desired)staged.push(await ensure(x));
     active=staged;await saveManifest(staged);await put(META,"signature",sig);
     if(!playing){idx=0;next()}
   }
 }catch(e){console.warn(e);if(!active.length){active=await localFromManifest();if(active.length){idx=0;next()}else show("Sem conexão e sem playlist local")}}
}
async function heartbeat(){
 if(!screen)return;
 try{await rest("screens?id=eq."+screen.id,{method:"PATCH",headers:hdr({"Prefer":"return=minimal"}),body:JSON.stringify({status:"online",ultima_conexao:new Date().toISOString()})})}catch(e){}
}
async function boot(){
 if(!BASE||!KEY){show("Configuração Supabase ausente");return}
 db=await openDB(); active=await localFromManifest(); if(active.length){idx=0;next()}
 await refresh(); await heartbeat(); setInterval(refresh,CHECK_MS);setInterval(heartbeat,HEART_MS);
}
boot();
})();