/* Vitrine Digital PRO 4.21.1 — Preview isolado sobre base estável 4.21 */
const cfg=window.SUPABASE_CONFIG||{};const hasSupabase=!!(cfg.url&&cfg.key&&!cfg.url.includes('SEU-PROJETO'));const db=hasSupabase&&window.supabase?window.supabase.createClient(cfg.url,cfg.key):null;
const blank={screens:[],media:[],playlists:[],playlist_items:[],schedules:[],groups:[],events:[],scenes:[]};
const demo={};for(const k of Object.keys(blank))demo[k]=JSON.parse(localStorage.getItem('vd3_'+k)||'[]');
const save=()=>Object.keys(demo).forEach(k=>localStorage.setItem('vd3_'+k,JSON.stringify(demo[k])));
const qs=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random();
const LOCAL_MEDIA_DB='vitrine_local_media_v1',LOCAL_MEDIA_STORE='files';
function localMediaDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(LOCAL_MEDIA_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(LOCAL_MEDIA_STORE))r.result.createObjectStore(LOCAL_MEDIA_STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putLocalMedia(id,file){const d=await localMediaDb();return new Promise((resolve,reject)=>{const tx=d.transaction(LOCAL_MEDIA_STORE,'readwrite');tx.objectStore(LOCAL_MEDIA_STORE).put(file,id);tx.oncomplete=()=>{d.close();resolve()};tx.onerror=()=>{d.close();reject(tx.error)}})}
async function getLocalMediaUrl(id){try{const d=await localMediaDb();const file=await new Promise((resolve,reject)=>{const r=d.transaction(LOCAL_MEDIA_STORE,'readonly').objectStore(LOCAL_MEDIA_STORE).get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});d.close();return file?URL.createObjectURL(file):''}catch(e){return ''}}
async function resolveLocalMediaUrls(){if(db)return;for(const m of demo.media){if(String(m.file_url||'').startsWith('idb://'))m.file_url_runtime=await getLocalMediaUrl(String(m.file_url).slice(6));else m.file_url_runtime=m.file_url}}
function mediaSrc(m){return m?.file_url_runtime||m?.file_url||''}
async function bootLocalPlayer(){
 const qp=new URLSearchParams(location.search),code=String(qp.get('localPlayer')||'').trim();if(!code||db)return;
 const screen=demo.screens.find(x=>String(x.code||'').trim()===code);if(!screen)return alert('Tela '+code+' não encontrada.');
 function dayToken(d){return ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'][d.getDay()]}
 function hhmm(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
 function scheduleMatches(sc,now){const iso=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'),t=hhmm(now);if(sc.active===false)return false;if(sc.start_date&&iso<sc.start_date)return false;if(sc.end_date&&iso>sc.end_date)return false;const st=String(sc.start_time||'').slice(0,5),et=String(sc.end_time||'').slice(0,5);if(st&&et&&st<=et){if(t<st||t>et)return false}else if(st&&et&&st>et){if(t>et&&t<st)return false}else{if(st&&t<st)return false;if(et&&t>et)return false}const days=String(sc.days||'').split(',').map(x=>x.trim()).filter(Boolean);return !days.length||days.includes(dayToken(now))}
 function resolveLocalPlaylist(){const now=new Date(),matches=(demo.schedules||[]).filter(sc=>(sc.screen_id===screen.id||(screen.group_id&&sc.group_id===screen.group_id))&&scheduleMatches(sc,now));matches.sort((a,b)=>Number(b.screen_id===screen.id)-Number(a.screen_id===screen.id)||String(b.created_at||'').localeCompare(String(a.created_at||'')));return {pid:matches[0]?.playlist_id||screen.playlist_id||null,schedule:matches[0]||null}}
 let resolved=resolveLocalPlaylist(),pid=resolved.pid,pl=demo.playlists.find(x=>x.id===pid),rows=demo.playlist_items.filter(x=>x.playlist_id===pid).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
 let media=rows.map(r=>demo.media.find(m=>m.id===r.media_id)).filter(Boolean);await resolveLocalMediaUrls();
 const wrap=document.createElement('div');wrap.id='localPlayerOverlay';wrap.style.cssText='position:fixed;inset:0;z-index:999999;background:#05070b;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;overflow:hidden';
 wrap.innerHTML='<div id="lpStage" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000"></div><div id="lpStatus" style="position:absolute;left:14px;bottom:12px;font-size:12px;background:#0009;padding:7px 10px;border-radius:7px"></div><button id="lpStart" style="position:absolute;right:14px;bottom:12px;padding:9px 13px;border:0;border-radius:8px">Iniciar</button><button id="lpClose" style="position:absolute;right:14px;top:12px;padding:7px 11px;border:0;border-radius:8px">Fechar</button>';
 document.body.appendChild(wrap);const stage=wrap.querySelector('#lpStage'),status=wrap.querySelector('#lpStatus'),start=wrap.querySelector('#lpStart');status.textContent='Demo local • '+(pl?.name||'Playlist')+(resolved.schedule?' • Agenda: '+resolved.schedule.name:' • Playlist padrão')+' • '+code+' • v4.11';
 let i=0,t=null,obj=[];const cleanup=()=>{if(t)clearTimeout(t);obj.forEach(URL.revokeObjectURL);wrap.remove()};wrap.querySelector('#lpClose').onclick=cleanup;
 async function show(){if(t)clearTimeout(t);stage.innerHTML='';if(!media.length){stage.innerHTML='<div>Playlist vazia</div>';return}const m=media[i++%media.length],src=mediaSrc(m);if(!src&&m.type!=='text'){stage.innerHTML='<div style="text-align:center"><b>Mídia não encontrada no armazenamento local.</b><br><small>Reenvie este conteúdo nesta versão.</small></div>';status.textContent='ERRO • arquivo local não encontrado • '+m.name;return}
  if(m.type==='video'){const v=document.createElement('video');v.src=src;v.autoplay=true;v.muted=true;v.playsInline=true;v.style.cssText='width:100%;height:100%;object-fit:contain;background:#000';stage.appendChild(v);v.onended=show;v.onerror=()=>{status.textContent='ERRO DE VÍDEO • '+m.name+' • '+(v.error?.message||'formato/arquivo');};try{await v.play();start.style.display='none'}catch(e){status.textContent='Clique em Iniciar • '+m.name;start.style.display='block';start.onclick=async()=>{try{await v.play();start.style.display='none'}catch(err){status.textContent='Falha ao iniciar: '+err.message}}}t=setTimeout(show,Math.max(10,Number(m.duration||30))*1000)}
  else if(m.type==='image'){const im=new Image();im.src=src;im.style.cssText='width:100%;height:100%;object-fit:contain';stage.appendChild(im);t=setTimeout(show,Math.max(2,Number(m.duration||8))*1000)}
  else if(m.type==='web'){const f=document.createElement('iframe');f.src=src;f.style.cssText='width:100%;height:100%;border:0';stage.appendChild(f);t=setTimeout(show,Math.max(5,Number(m.duration||15))*1000)}
  else{const d=document.createElement('div');d.textContent=m.text_content||m.name;d.style.cssText='font-size:5vw;text-align:center;padding:5vw';stage.appendChild(d);t=setTimeout(show,Math.max(2,Number(m.duration||8))*1000)} }
 show();
 setInterval(async()=>{const next=resolveLocalPlaylist();if(next.pid!==pid){pid=next.pid;resolved=next;pl=demo.playlists.find(x=>x.id===pid);rows=demo.playlist_items.filter(x=>x.playlist_id===pid).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));media=rows.map(r=>demo.media.find(m=>m.id===r.media_id)).filter(Boolean);await resolveLocalMediaUrls();i=0;status.textContent='Demo local • '+(pl?.name||'Playlist')+(resolved.schedule?' • Agenda: '+resolved.schedule.name:' • Playlist padrão')+' • '+code+' • v4.11';show()}},15000);
}
async function load(table){if(!db)return demo[table]||[];const {data,error}=await db.from(table).select('*').order('created_at',{ascending:false});if(error){console.warn(table,error);return []}return data||[]}
async function insert(table,row){if(db){const {data,error}=await db.from(table).insert(row).select().single();if(error)throw error;return data}const x={id:uid(),created_at:new Date().toISOString(),...row};(demo[table]||(demo[table]=[])).push(x);save();return x}
async function update(table,id,patch){
 if(db){
  const {data,error}=await db.from(table).update(patch).eq('id',id).select('*');
  if(error)throw error;
  if(!data||data.length!==1)throw new Error('A alteração não foi confirmada pelo servidor. Atualize a página e tente novamente.');
  return data[0];
 }
 const a=demo[table]||[],i=a.findIndex(x=>x.id===id);
 if(i<0)throw new Error('Registro não encontrado para edição.');
 a[i]={...a[i],...patch};save();return a[i]
}
async function remove(table,id){if(db){const {error}=await db.from(table).delete().eq('id',id);if(error)throw error}else{demo[table]=(demo[table]||[]).filter(x=>x.id!==id);save()}}
function openModal(title,body){qs('#modalTitle').textContent=title;qs('#modalBody').innerHTML=body;qs('#modal').classList.remove('hidden')}
function closeModal(){qs('#modal').classList.add('hidden')}
qs('#closeModal').onclick=closeModal;qs('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
function go(section){document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.section===section));document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id===section));render()}
document.querySelectorAll('.nav').forEach(n=>n.onclick=()=>go(n.dataset.section));document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)});qs('#refreshBtn').onclick=render;
async function render(){
 await resolveLocalMediaUrls();
 const [screens,media,playlists,schedules,groups,items,scenes]=await Promise.all([load('screens'),load('media'),load('playlists'),load('schedules'),load('groups'),load('playlist_items'),load('scenes')]);
 // Keep the in-memory state synchronized with Supabase. Modal editors and actions use `demo` as the current UI state.
 if(db){demo.screens=screens;demo.media=media;demo.playlists=playlists;demo.schedules=schedules;demo.groups=groups;demo.playlist_items=items;demo.scenes=scenes;}
 const online=screens.filter(s=>monitorIsOnline(s)).length;qs('#statScreens').textContent=screens.length;qs('#statScreensSub').textContent=`${online} online`;qs('#statMedia').textContent=media.length;qs('#statPlaylists').textContent=playlists.length;qs('#statSchedules').textContent=schedules.length;qs('#modeLabel').textContent=db?'SUPABASE':'DEMO LOCAL';qs('#connectionBadge').textContent=db?'Supabase conectado':'Demo local';
 renderScreens(screens,playlists);renderMedia(media);renderPlaylists(playlists,media,items);renderSchedules(schedules,playlists,screens,groups);renderGroups(groups,screens,playlists);renderDashboard(screens);renderMonitor(screens,playlists,media,items,schedules);renderReports();
}

function monitorIsOnline(s){const raw=s.ultima_conexao||s.last_seen||s.updated_at;const t=raw?new Date(raw).getTime():0;return !!t&&(Date.now()-t)<=45000}
function monitorAgo(raw){if(!raw)return 'Nunca conectado';const sec=Math.max(0,Math.floor((Date.now()-new Date(raw).getTime())/1000));if(sec<60)return 'agora';const min=Math.floor(sec/60);if(min<60)return `há ${min} min`;const h=Math.floor(min/60);if(h<24)return `há ${h} h`;return `há ${Math.floor(h/24)} dia(s)`}
function monitorScheduleMatches(sc,screen,now){if(sc.active===false)return false;if(sc.screen_id!==screen.id&&!(screen.group_id&&sc.group_id===screen.group_id))return false;const iso=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');if(sc.start_date&&iso<sc.start_date)return false;if(sc.end_date&&iso>sc.end_date)return false;const day=['Dom','Seg','Ter','Qua','Qui','Sex','Sab'][now.getDay()],days=String(sc.days||'').split(',').map(x=>x.trim()).filter(Boolean);if(days.length&&!days.includes(day))return false;const t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),st=String(sc.start_time||'').slice(0,5),et=String(sc.end_time||'').slice(0,5);if(st&&et&&st<=et)return t>=st&&t<=et;if(st&&et)return t>=st||t<=et;if(st&&t<st)return false;if(et&&t>et)return false;return true}
let monitorPreviewTimers=[];
function stopMonitorPreviewTimers(){monitorPreviewTimers.forEach(clearTimeout);monitorPreviewTimers=[];}
function monitorPreviewSequence(pid,items,media){
 const mmap=new Map((media||[]).map(m=>[String(m.id),m]));
 return (items||[]).filter(i=>String(i.playlist_id)===String(pid)).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)).map(i=>({m:mmap.get(String(i.media_id)),duration:Number(i.duration)||0})).filter(x=>x.m);
}
function startMonitorPreview(box,seq){
 let pos=0;
 const next=()=>{
  if(!box.isConnected||!seq.length)return;
  const entry=seq[pos++%seq.length],m=entry.m,src=mediaSrc(m);box.innerHTML='';
  const seconds=Math.max(2,entry.duration||Number(m.duration)||8);
  if(m.type==='video'&&src){
   const v=document.createElement('video');v.src=src;v.muted=true;v.autoplay=true;v.playsInline=true;v.preload='auto';v.setAttribute('muted','');v.setAttribute('playsinline','');box.appendChild(v);v.play().catch(()=>{});
  }else if(m.type==='image'&&src){const im=document.createElement('img');im.src=src;im.alt=m.name||'Prévia';box.appendChild(im);}
  else if(m.type==='text'){const d=document.createElement('div');d.className='monitor-live-text';d.textContent=m.text_content||m.name||'Texto';box.appendChild(d);}
  else{const d=document.createElement('div');d.className='monitor-placeholder';d.textContent='▣';box.appendChild(d);}
  const t=setTimeout(next,seconds*1000);monitorPreviewTimers.push(t);
 };
 next();
}
function startAllMonitorPreviews(previews){
 stopMonitorPreviewTimers();
 requestAnimationFrame(()=>previews.forEach(x=>{const box=document.querySelector(`[data-monitor-live="${CSS.escape(String(x.screenId))}"]`);if(box)startMonitorPreview(box,x.seq)}));
}
function renderMonitor(screens,playlists,media,items,schedules){const grid=qs('#monitorGrid');if(!grid)return;stopMonitorPreviewTimers();const term=(qs('#monitorSearch')?.value||'').toLowerCase(),filter=qs('#monitorFilter')?.value||'all',now=new Date();const states=screens.map(s=>({s,online:monitorIsOnline(s)}));const onlineCount=states.filter(x=>x.online).length;qs('#monitorTotal').textContent=screens.length;qs('#monitorOnline').textContent=onlineCount;qs('#monitorOffline').textContent=screens.length-onlineCount;qs('#monitorUpdated').textContent=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});const alertBox=qs('#monitorAlert');const offlineCount=screens.length-onlineCount;if(alertBox){alertBox.classList.toggle('hidden',offlineCount===0);alertBox.innerHTML=offlineCount?`⚠ <b>${offlineCount} tela(s) offline</b> — verifique energia ou conexão do dispositivo.`:'';}const arr=states.filter(({s,online})=>(filter==='all'||filter===(online?'online':'offline'))&&`${s.name} ${s.code} ${s.location||''}`.toLowerCase().includes(term)).sort((a,b)=>Number(a.online)-Number(b.online)||String(a.s.name||'').localeCompare(String(b.s.name||''),'pt-BR'));const previews=[];grid.innerHTML=arr.map(({s,online})=>{const active=(schedules||[]).filter(sc=>monitorScheduleMatches(sc,s,now)).sort((a,b)=>Number(b.screen_id===s.id)-Number(a.screen_id===s.id))[0];const pid=active?.playlist_id||s.playlist_id;const pl=playlists.find(p=>p.id===pid);const seq=monitorPreviewSequence(pid,items,media);const m=seq[0]?.m;if(seq.length)previews.push({screenId:s.id,seq});const preview=seq.length?`<div class="monitor-live-box" data-monitor-live="${esc(s.id)}"><div class="monitor-placeholder">▶</div></div>`:'<div class="monitor-placeholder">▣</div>';const last=s.ultima_conexao||s.last_seen||s.updated_at;return `<div class="card monitor-card ${s.orientation==='portrait'?'portrait':''}"><div class="monitor-preview">${preview}<span class="monitor-state ${online?'online':'offline'}">${online?'● ONLINE':'● OFFLINE'}</span></div><div class="monitor-info"><div class="monitor-title">${esc(s.name)}</div><div class="monitor-meta"><b>${esc(s.code)}</b>${s.location?' · '+esc(s.location):''}<br>Última comunicação: ${esc(monitorAgo(last))}<br>${s.orientation==='portrait'?'Vertical 9:16':'Horizontal 16:9'}</div><div class="monitor-now"><b>Preview:</b> ${esc(pl?.name||m?.name||'Sem conteúdo')}<br><span class="muted">${active?'Programação: '+esc(active.name):'Playlist: '+esc(pl?.name||'—')}</span></div><div class="monitor-actions"><button class="btn small ghost" data-screen-test="${s.id}">Abrir Player</button><button class="btn small" data-screen-edit="${s.id}">Configurar</button></div></div></div>`}).join('')||'<div class="card"><p class="muted">Nenhuma tela encontrada.</p></div>';startAllMonitorPreviews(previews)}
function renderDashboard(screens){qs('#dashboardScreens').innerHTML=screens.length?screens.slice(0,8).map(s=>{const online=monitorIsOnline(s);return `<div class="mini"><span><b>${esc(s.name)}</b><br><small>${esc(s.code)} · ${esc(s.location||'')}</small></span><span class="${online?'status-online':'status-offline'}">${online?'● Online':'○ Offline'}</span></div>`}).join(''):'<p class="muted">Cadastre a primeira tela.</p>'}
function renderScreens(screens,playlists){const term=(qs('#screenSearch')?.value||'').toLowerCase(),filter=qs('#screenFilter')?.value||'all';const arr=screens.map(s=>({s,online:monitorIsOnline(s)})).filter(({s,online})=>(filter==='all'||filter===(online?'online':'offline'))&&`${s.name} ${s.code} ${s.location||''}`.toLowerCase().includes(term));qs('#screensBody').innerHTML=arr.map(({s,online})=>`<tr><td data-label="Tela"><b>${esc(s.name)}</b><br><small class="muted">${esc(s.resolution||'Auto')}</small></td><td data-label="Código"><code>${esc(s.code)}</code></td><td data-label="Local">${esc(s.location||'—')}</td><td data-label="Orientação">${s.orientation==='portrait'?'↕ Vertical':'↔ Horizontal'}</td><td data-label="Status" class="${online?'status-online':'status-offline'}">${online?'● Online':'○ Offline'}</td><td data-label="Playlist">${esc((playlists.find(p=>p.id===s.playlist_id)||{}).name||'—')}</td><td data-label="Ações"><div class="action-row"><button class="btn small" data-screen-edit="${s.id}">Editar</button><button class="btn small ghost" data-screen-test="${s.id}">Abrir</button></div></td></tr>`).join('')||`<tr><td colspan="7" class="muted">Nenhuma tela encontrada.</td></tr>`}
function renderMedia(media){const term=(qs('#mediaSearch')?.value||'').toLowerCase(),type=qs('#mediaTypeFilter')?.value||'all';const arr=media.filter(m=>(type==='all'||m.type===type)&&`${m.name} ${m.type}`.toLowerCase().includes(term));qs('#mediaGrid').innerHTML=arr.map(m=>{let src=mediaSrc(m),thumb=m.type==='image'?`<img src="${esc(src)}" loading="lazy">`:m.type==='video'?`<video src="${esc(src)}" muted></video>`:m.type==='web'?`<span>🌐 WEB</span>`:`<span>▤ TEXTO</span>`;return `<div class="card media-card"><div class="thumb media-preview-trigger" data-media-preview="${m.id}" role="button" tabindex="0" title="Visualizar conteúdo">${mediaSrc(m)?thumb:'Sem prévia'}<span class="media-preview-badge">Visualizar</span></div><div class="media-info"><strong>${esc(m.name)}</strong><span class="tag">${esc(m.type)}</span> <span class="tag">${esc(m.duration||10)}s</span><div class="action-row" style="margin-top:10px"><button class="btn small" data-media-edit="${m.id}">Editar</button><button class="btn small danger" data-media-del="${m.id}">Excluir</button></div></div></div>`}).join('')||'<div class="card"><p class="muted">Nenhum conteúdo encontrado.</p></div>'}
function previewMedia(id){const m=demo.media.find(x=>x.id===id);if(!m)return;const src=mediaSrc(m);let body;if(m.type==='image')body=`<img src="${esc(src)}" style="width:100%;max-height:70vh;object-fit:contain;background:#000">`;else if(m.type==='video')body=`<video src="${esc(src)}" autoplay muted controls playsinline style="width:100%;max-height:70vh;object-fit:contain;background:#000"></video>`;else if(m.type==='web')body=`<div class="card"><p class="muted">Página Web</p><p>${esc(m.file_url||'Sem URL')}</p></div>`;else body=`<div class="card" style="font-size:22px;line-height:1.5">${esc(m.text_content||m.name||'Texto')}</div>`;openModal(esc(m.name||'Pré-visualização'),`<div class="media-preview-modal">${body}<div class="media-preview-meta"><span class="tag">${esc(m.type)}</span><span class="tag">${esc(m.duration||10)}s</span></div></div>`)}
function renderPlaylists(playlists,media,items){qs('#playlistGrid').innerHTML=playlists.map(p=>{const its=items.filter(i=>i.playlist_id===p.id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const total=its.reduce((sum,i)=>{const m=media.find(x=>x.id===i.media_id);return sum+Math.max(1,Number(i.duration||m?.duration||10))},0);return `<div class="card playlist-card"><div class="section-head playlist-head" style="margin:0"><div><h2>${esc(p.name)}</h2><small class="muted">${its.length} itens · ${total}s por ciclo</small></div><button class="btn small" data-playlist-add="${p.id}">+ Item</button></div><div class="playlist-items" data-playlist="${p.id}">${its.map((i,pos)=>{const m=media.find(x=>x.id===i.media_id);const src=m?mediaSrc(m):'';const thumb=m?.type==='image'?`<img src="${esc(src)}" alt="">`:m?.type==='video'?`<video src="${esc(src)}" muted playsinline preload="metadata"></video>`:`<span>${m?.type==='text'?'T':'▣'}</span>`;const dur=Math.max(1,Number(i.duration||m?.duration||10));return `<div class="drag-item playlist-mobile-item" draggable="true" data-item="${i.id}" title="Arraste para mudar a ordem"><div class="playlist-drag-handle" title="Segure e arraste" style="cursor:grab;font-size:20px;padding:0 8px;user-select:none">☰</div><div class="playlist-order">${pos+1}</div><div class="playlist-item-thumb">${thumb}</div><div class="playlist-item-copy"><strong>${esc(m?.name||'Conteúdo removido')}</strong><small>${esc(m?.type||'—')} · ${dur}s</small></div><div class="playlist-item-actions"><button class="btn small ghost mobile-order-btn" data-item-up="${i.id}" title="Mover para cima">↑</button><button class="btn small ghost mobile-order-btn" data-item-down="${i.id}" title="Mover para baixo">↓</button><button class="btn small danger" data-item-del="${i.id}" title="Remover">×</button></div></div>`}).join('')||'<div class="dropzone">Arraste conteúdos para esta playlist</div>'}</div><div class="action-row playlist-actions" style="margin-top:10px"><button class="btn small ghost" data-playlist-preview="${p.id}">▶ Pré-visualizar</button><button class="btn small danger" data-playlist-del="${p.id}">Excluir</button></div></div>`}).join('')||'<div class="card"><p class="muted">Crie sua primeira playlist.</p></div>';wireDrag()}
function renderSchedules(schedules,playlists,screens,groups){qs('#schedulesBody').innerHTML=schedules.map(s=>`<tr><td data-label="Programação"><b>${esc(s.name)}</b></td><td data-label="Playlist">${esc(playlists.find(p=>p.id===s.playlist_id)?.name||'—')}</td><td data-label="Alvo">${s.group_id?'Grupo: '+esc(groups.find(g=>g.id===s.group_id)?.name||'—'):'Tela: '+esc(screens.find(x=>x.id===s.screen_id)?.name||'—')}</td><td data-label="Período">${esc(s.start_date||'Hoje')} → ${esc(s.end_date||'Sem fim')}</td><td data-label="Horário">${esc(s.start_time||'')}–${esc(s.end_time||'')}</td><td data-label="Dias">${esc(s.days||'Todos')}</td><td data-label="Ações"><div class="action-row"><button class="btn small" data-schedule-edit="${s.id}">Editar</button><button class="btn small danger" data-schedule-del="${s.id}">Excluir</button></div></td></tr>`).join('')||'<tr><td colspan="7" class="muted">Nenhuma programação.</td></tr>'}
function renderGroups(groups,screens,playlists){qs('#groupsGrid').innerHTML=groups.map(g=>{const ss=screens.filter(s=>s.group_id===g.id),pl=playlists.find(p=>p.id===g.playlist_id);return `<div class="card group-card"><div class="section-head" style="margin:0"><div><h2>${esc(g.name)}</h2><p class="muted">${ss.length} telas · ${pl?'▶ '+esc(pl.name):'Sem conteúdo sincronizado'}</p></div><span class="tag">${pl?'SINCRONIZADO':'GRUPO'}</span></div><div class="mini-list">${ss.map(s=>`<div class="mini"><span>${esc(s.name)}</span><span>${esc(s.code)}</span></div>`).join('')||'<p class="muted">Nenhuma tela no grupo.</p>'}</div><div class="action-row" style="margin-top:12px"><button class="btn small" data-group-edit="${g.id}">Gerenciar</button><button class="btn small ghost" data-group-sync="${g.id}">↻ Sincronizar agora</button><button class="btn small danger" data-group-del="${g.id}">Excluir</button></div></div>`}).join('')||'<div class="card"><p class="muted">Crie um grupo, selecione as telas e escolha a playlist que todas devem exibir juntas.</p></div>'}
async function renderReports(){const ev=db?await load('screen_heartbeat').catch(()=>[]):demo.events||[];const arr=ev.slice(0,50);qs('#reportCount').textContent=arr.length;qs('#reportLast').textContent=arr[0]?new Date(arr[0].created_at||arr[0].last_ping).toLocaleTimeString('pt-BR'):'—';qs('#reportsBody').innerHTML=arr.map(e=>`<tr><td>${new Date(e.created_at||e.last_ping).toLocaleString('pt-BR')}</td><td>${esc(e.screen_id||'')}</td><td>heartbeat</td><td>${esc(e.player_version||'')}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">Sem eventos.</td></tr>'}
if(qs('#monitorRefreshBtn'))qs('#monitorRefreshBtn').onclick=()=>render();const monitorFocusBtn=qs('#monitorFocusBtn');if(monitorFocusBtn)monitorFocusBtn.onclick=()=>{document.body.classList.toggle('monitor-focus');monitorFocusBtn.textContent=document.body.classList.contains('monitor-focus')?'← Sair do Modo Central':'▣ Modo Central';};if(qs('#monitorSearch'))qs('#monitorSearch').oninput=()=>renderMonitor(demo.screens,demo.playlists,demo.media,demo.playlist_items,demo.schedules);if(qs('#monitorFilter'))qs('#monitorFilter').onchange=()=>renderMonitor(demo.screens,demo.playlists,demo.media,demo.playlist_items,demo.schedules);
qs('#addScreenBtn').onclick=()=>openScreen();qs('#addMediaBtn').onclick=()=>openMedia();qs('#addPlaylistBtn').onclick=()=>openPlaylist();qs('#addScheduleBtn').onclick=()=>openSchedule();qs('#addGroupBtn').onclick=()=>openGroup();
function openScreen(id){const s=id?(demo.screens.find(x=>x.id===id)||null):null;openModal(s?'Editar tela':'Adicionar tela',`<form id="screenForm" class="form"><input type="hidden" name="id" value="${esc(s?.id||'')}"><label>Nome<input name="name" required value="${esc(s?.name||'')}" placeholder="Totem 01"></label><label>Código<input name="code" required value="${esc(s?.code||'')}" placeholder="TV-0001"></label><label>Local<input name="location" value="${esc(s?.location||'')}" placeholder="Loja São Fernandes"></label><label>Orientação<select name="orientation"><option value="landscape" ${s?.orientation!=='portrait'?'selected':''}>Horizontal 16:9</option><option value="portrait" ${s?.orientation==='portrait'?'selected':''}>Vertical 9:16</option></select></label><label>Playlist<select name="playlist_id"><option value="">Sem playlist</option>${demo.playlists.map(p=>`<option value="${p.id}" ${s?.playlist_id===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label>Grupo<select name="group_id"><option value="">Sem grupo</option>${demo.groups.map(g=>`<option value="${g.id}" ${s?.group_id===g.id?'selected':''}>${esc(g.name)}</option>`).join('')}</select></label><button class="btn">Salvar tela</button></form>`);const form=qs('#screenForm');if(form){form.addEventListener('submit',async ev=>{ev.preventDefault();ev.stopPropagation();if(form.dataset.saving==='1')return;form.dataset.saving='1';const btn=form.querySelector('button[type=submit],button.btn');const original=btn?.textContent||'Salvar tela';if(btn){btn.disabled=true;btn.textContent='Salvando…'}try{const f=new FormData(form);const row={name:String(f.get('name')||'').trim(),code:String(f.get('code')||'').trim().toUpperCase(),location:String(f.get('location')||'').trim(),orientation:f.get('orientation')||'landscape',playlist_id:f.get('playlist_id')||null,group_id:f.get('group_id')||null,status:'offline',active:true};if(!row.name||!row.code)throw new Error('Nome e código são obrigatórios.');const existing=f.get('id');if(existing)await update('screens',existing,row);else await insert('screens',row);closeModal();await render();alert('Tela salva com sucesso!');}catch(err){console.error('screen save',err);alert('Erro ao salvar tela: '+(err.message||String(err)));}finally{form.dataset.saving='0';if(btn){btn.disabled=false;btn.textContent=original}}},{capture:true})}}
function openMedia(id){
 const m=id?(demo.media.find(x=>x.id===id)||null):null;
 openModal(m?'Editar conteúdo':'Adicionar conteúdo',`<form id="mediaForm" class="form" onsubmit="return false"><input type="hidden" name="id" value="${esc(m?.id||'')}"><label>Nome<input name="name" required value="${esc(m?.name||'')}" placeholder="Campanha 01"></label><label>Tipo<select name="type"><option value="image" ${m?.type==='image'?'selected':''}>Imagem</option><option value="video" ${m?.type==='video'?'selected':''}>Vídeo</option><option value="web" ${m?.type==='web'?'selected':''}>Página Web</option><option value="text" ${m?.type==='text'?'selected':''}>Texto</option></select></label><label>Arquivo do aparelho<input name="file" type="file" accept="image/*,video/*"></label><label>URL opcional<input name="url" value="${esc(m?.file_url||'')}" placeholder="https://..."></label><label>Texto (se tipo Texto)<textarea name="text_content">${esc(m?.text_content||'')}</textarea></label><label>Duração (segundos)<input name="duration" type="number" min="1" value="${esc(m?.duration||10)}"></label><button class="btn" type="submit">${m?'Salvar alterações':'Enviar e salvar'}</button><small class="muted" id="mediaSaveHint"></small></form>`);
 const form=qs('#mediaForm'); if(!form)return;
 form.addEventListener('submit',async ev=>{
  ev.preventDefault();ev.stopPropagation();
  if(form.dataset.saving==='1')return;form.dataset.saving='1';
  const btn=form.querySelector('button[type="submit"]'),hint=qs('#mediaSaveHint'),original=btn.textContent;
  btn.disabled=true;btn.textContent='Salvando…';if(hint)hint.textContent='';
  try{
   const f=new FormData(form),existing=f.get('id');let url=String(f.get('url')||'').trim();const file=f.get('file');let sessionOnly=false;
   if(file&&file.size){
    if(db) url=await uploadFile(file);
    else if(file.type.startsWith('image/')&&file.size<=2*1024*1024) url=await fileToDataUrl(file);
    else {const localId='media-'+uid();await putLocalMedia(localId,file);url='idb://'+localId;sessionOnly=false;}
   }
   if(!url&&f.get('type')!=='text')throw new Error('Selecione um arquivo ou informe uma URL.');
   const row={name:String(f.get('name')||'').trim(),type:f.get('type'),file_url:url||null,text_content:f.get('text_content')||null,duration:Number(f.get('duration')||10),active:true,local_session_only:sessionOnly};
   if(!row.name)throw new Error('Informe o nome do conteúdo.');
   if(existing)await update('media',existing,row);else await insert('media',row);
   closeModal();await render();
   alert(sessionOnly?'Conteúdo salvo para teste nesta sessão. Para persistir o vídeo e enviá-lo às TVs, conecte o Supabase.':'Conteúdo salvo com sucesso!');
  }catch(err){console.error('media save',err);if(hint)hint.textContent='Erro: '+(err.message||String(err));alert('Erro ao salvar conteúdo: '+(err.message||String(err)));}
  finally{form.dataset.saving='0';btn.disabled=false;btn.textContent=original;}
 },{capture:true});
}
function openPlaylist(){openModal('Nova playlist',`<form id="playlistForm" class="form"><label>Nome<input name="name" required placeholder="Campanha Loja"></label><label>Descrição<textarea name="description" placeholder="Ex.: campanha de setembro"></textarea></label><button class="btn">Criar playlist</button></form>`)}
function openSchedule(id){
 const sc=id?(demo.schedules.find(x=>x.id===id)||null):null;
 const target=sc?.group_id?'group':'screen';
 const checkedDays=String(sc?.days||'Seg,Ter,Qua,Qui,Sex,Sab,Dom').split(',').map(x=>x.trim());
 const targetHtml=target==='group'?`Grupo<select name="group_id">${demo.groups.map(g=>`<option value="${g.id}" ${sc?.group_id===g.id?'selected':''}>${esc(g.name)}</option>`).join('')}</select>`:`Tela<select name="screen_id">${demo.screens.map(x=>`<option value="${x.id}" ${sc?.screen_id===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`;
 openModal(sc?'Editar programação':'Nova programação',`<form id="scheduleForm" class="form"><input type="hidden" name="id" value="${esc(sc?.id||'')}"><label>Nome<input name="name" required value="${esc(sc?.name||'')}" placeholder="Campanha manhã"></label><label>Playlist<select name="playlist_id" required>${demo.playlists.map(p=>`<option value="${p.id}" ${sc?.playlist_id===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><label>Destino<select name="target" id="targetType"><option value="screen" ${target==='screen'?'selected':''}>Tela</option><option value="group" ${target==='group'?'selected':''}>Grupo</option></select></label><label id="targetField">${targetHtml}</label><label>Data inicial<input name="start_date" type="date" value="${esc(sc?.start_date||'')}"></label><label>Data final<input name="end_date" type="date" value="${esc(sc?.end_date||'')}"></label><label>Início<input name="start_time" type="time" value="${esc(String(sc?.start_time||'08:00').slice(0,5))}"></label><label>Fim<input name="end_time" type="time" value="${esc(String(sc?.end_time||'18:00').slice(0,5))}"></label><div><span class="muted">Dias da semana</span><div class="check-row">${['Seg','Ter','Qua','Qui','Sex','Sab','Dom'].map(d=>`<label><input type="checkbox" name="days" value="${d}" ${checkedDays.includes(d)?'checked':''}>${d}</label>`).join('')}</div></div><button class="btn">${sc?'Salvar alterações':'Salvar programação'}</button></form>`);
 qs('#targetType').onchange=e=>{qs('#targetField').innerHTML=e.target.value==='group'?`Grupo<select name="group_id">${demo.groups.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select>`:`Tela<select name="screen_id">${demo.screens.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>`}
 const form=qs('#scheduleForm');
 form.addEventListener('submit',async ev=>{
   ev.preventDefault();ev.stopPropagation();
   if(form.dataset.saving==='1')return;
   form.dataset.saving='1';
   const btn=form.querySelector('button.btn'),old=btn.textContent;btn.disabled=true;btn.textContent='Salvando…';
   try{
     const f=new FormData(form), scheduleId=String(f.get('id')||'').trim();
     const days=[...form.querySelectorAll('input[name="days"]:checked')].map(x=>x.value).join(',');
     const target=f.get('target'),screenId=target==='screen'?(f.get('screen_id')||null):null,groupId=target==='group'?(f.get('group_id')||null):null;
     const row={name:String(f.get('name')||'').trim(),playlist_id:f.get('playlist_id')||null,screen_id:screenId,group_id:groupId,start_date:f.get('start_date')||null,end_date:f.get('end_date')||null,start_time:String(f.get('start_time')||'').slice(0,5),end_time:String(f.get('end_time')||'').slice(0,5),days,active:true};
     if(!row.start_time||!row.end_time)throw new Error('Informe os horários de início e fim.');
     let saved;
     if(db){
       if(scheduleId){
         const {data,error}=await db.from('schedules').update(row).eq('id',scheduleId).select('*').single();
         if(error)throw error;saved=data;
       }else{
         const {data,error}=await db.from('schedules').insert(row).select('*').single();
         if(error)throw error;saved=data;
       }
       if(!saved)throw new Error('O Supabase não retornou a programação salva.');
       const {data:fresh,error:freshError}=await db.from('schedules').select('*').eq('id',saved.id).single();
       if(freshError)throw freshError;
       const a=String(fresh.start_time||'').slice(0,5),b=String(fresh.end_time||'').slice(0,5);
       if(a!==row.start_time||b!==row.end_time)throw new Error(`Horário não persistiu no servidor. Solicitado ${row.start_time}–${row.end_time}; servidor retornou ${a}–${b}.`);
     }else{
       saved=scheduleId?await update('schedules',scheduleId,row):await insert('schedules',row);
     }
     closeModal();await render();
     alert(`Programação salva: ${row.start_time}–${row.end_time}`);
   }catch(err){console.error('schedule save 4.19.3',err);alert('Erro ao salvar programação: '+(err.message||String(err)));}
   finally{form.dataset.saving='0';btn.disabled=false;btn.textContent=old;}
 },{capture:true});
}
function openGroup(id){const g=id?(demo.groups.find(x=>x.id===id)||null):null;openModal(g?'Gerenciar grupo':'Novo grupo',`<form id="groupForm" class="form"><input type="hidden" name="id" value="${esc(g?.id||'')}"><label>Nome<input name="name" required value="${esc(g?.name||'')}" placeholder="Loja / Totens"></label><label>Conteúdo sincronizado (playlist)<select name="playlist_id"><option value="">Nenhuma</option>${demo.playlists.map(p=>`<option value="${p.id}" ${g?.playlist_id===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select><small class="muted">Todas as telas marcadas usarão esta playlist e serão alinhadas pelo mesmo relógio.</small></label><div><span class="muted">Telas do grupo</span><div class="check-row">${demo.screens.map(s=>`<label><input type="checkbox" name="screen_ids" value="${s.id}" ${s.group_id===g?.id?'checked':''}>${esc(s.name)}</label>`).join('')}</div></div><button class="btn">Salvar grupo</button></form>`)}
async function uploadFile(file){if(!file)return '';if(!db){if(file.type.startsWith('image/')&&file.size<=2*1024*1024)return await fileToDataUrl(file);throw new Error('No modo local, apenas imagens até 2 MB podem ser armazenadas. Conecte o Supabase para vídeos e arquivos maiores.')}const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${Date.now()}-${uid()}-${safe}`;const {error}=await db.storage.from('media').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;return db.storage.from('media').getPublicUrl(path).data.publicUrl}
async function fileToDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}

document.addEventListener('submit',async e=>{const id=e.target.id;if(id==='screenForm')return;if(id==='mediaForm')return;if(id==='scheduleForm')return;if(!['playlistForm','groupForm'].includes(id))return;e.preventDefault();const f=new FormData(e.target);try{
 if(id==='screenForm'){const row={name:f.get('name'),code:f.get('code'),location:f.get('location'),orientation:f.get('orientation'),playlist_id:f.get('playlist_id')||null,group_id:f.get('group_id')||null,status:'offline',active:true};const existing=f.get('id');if(existing)await update('screens',existing,row);else await insert('screens',row)}
 if(id==='mediaForm'){const existing=f.get('id');let url=(f.get('url')||'').trim();const file=f.get('file');if(file&&file.size)url=await uploadFile(file);if(!url&&f.get('type')!=='text')throw new Error('Selecione um arquivo ou informe uma URL.');const row={name:f.get('name'),type:f.get('type'),file_url:url||null,text_content:f.get('text_content')||null,duration:Number(f.get('duration')||10),active:true};if(existing)await update('media',existing,row);else await insert('media',row)}
 if(id==='playlistForm')await insert('playlists',{name:f.get('name'),description:f.get('description'),active:true});
 if(id==='scheduleForm'){
 const days=[...e.target.querySelectorAll('input[name="days"]:checked')].map(x=>x.value).join(',');
 const target=f.get('target');
 const screenId=target==='screen'?f.get('screen_id'):null;
 const groupId=target==='group'?f.get('group_id'):null;
 let playlistId=f.get('playlist_id')||null;
 // 4.15.1: valida os IDs contra o estado remoto atual antes do INSERT.
 // Evita FK quando uma aba/formulário antigo ficou aberto com UUID de playlist já substituído.
 if(db){
   const remotePlaylists=await load('playlists');
   if(!remotePlaylists.some(p=>p.id===playlistId)){
     const remoteScreens=await load('screens');
     const targetScreen=remoteScreens.find(x=>x.id===screenId);
     if(targetScreen?.playlist_id && remotePlaylists.some(p=>p.id===targetScreen.playlist_id)){
       playlistId=targetScreen.playlist_id;
     }else{
       throw new Error('A playlist selecionada não existe mais no servidor. Feche esta janela, clique Atualizar e abra a programação novamente.');
     }
   }
 }
 const scheduleRow={name:f.get('name'),playlist_id:playlistId,screen_id:screenId,group_id:groupId,start_date:f.get('start_date')||null,end_date:f.get('end_date')||null,start_time:f.get('start_time'),end_time:f.get('end_time'),days,active:true};
 const scheduleId=f.get('id');
 if(scheduleId){
   const saved=await update('schedules',scheduleId,scheduleRow);
   // Confirma especificamente os horários retornados pelo Supabase antes de fechar a janela.
   const wantStart=String(scheduleRow.start_time||'').slice(0,5),wantEnd=String(scheduleRow.end_time||'').slice(0,5);
   const gotStart=String(saved?.start_time||'').slice(0,5),gotEnd=String(saved?.end_time||'').slice(0,5);
   if(gotStart!==wantStart||gotEnd!==wantEnd)throw new Error('O servidor não confirmou a mudança de horário.');
 }else await insert('schedules',scheduleRow)
}
 if(id==='groupForm'){const gid=f.get('id');let g;if(gid){await update('groups',gid,{name:f.get('name'),playlist_id:f.get('playlist_id')||null});g=gid}else{g=(await insert('groups',{name:f.get('name'),playlist_id:f.get('playlist_id')||null,active:true})).id}const selected=[...e.target.querySelectorAll('input[name="screen_ids"]:checked')].map(x=>x.value);for(const s of demo.screens){if(db){if(selected.includes(s.id))await update('screens',s.id,{group_id:g});else if(s.group_id===g)await update('screens',s.id,{group_id:null})}else{if(selected.includes(s.id))s.group_id=g;else if(s.group_id===g)s.group_id=null}}save()}
 alert('Salvo com sucesso!');
 closeModal();await render();
 }catch(err){console.error(err);alert('Erro ao salvar: '+(err.message||String(err)))}});

document.addEventListener('click',async e=>{try{
 const se=e.target.closest('[data-screen-edit]');if(se)return openScreen(se.dataset.screenEdit);const st=e.target.closest('[data-screen-test]');if(st){const s=demo.screens.find(x=>x.id===st.dataset.screenTest);if(s){const u=db?`../player/index.html?code=${encodeURIComponent(s.code)}`:`index.html?localPlayer=${encodeURIComponent(s.code)}&orientation=${encodeURIComponent(s.orientation||'landscape')}`;window.open(u,'_blank')}return}
 const mp=e.target.closest('[data-media-preview]');if(mp)return previewMedia(mp.dataset.mediaPreview); const md=e.target.closest('[data-media-edit]');if(md)return openMedia(md.dataset.mediaEdit);const delm=e.target.closest('[data-media-del]');if(delm&&confirm('Excluir este conteúdo?')){await remove('media',delm.dataset.mediaDel);await render();return}
 const pd=e.target.closest('[data-playlist-del]');if(pd&&confirm('Excluir esta playlist?')){await remove('playlists',pd.dataset.playlistDel);await render();return}const pa=e.target.closest('[data-playlist-add]');if(pa)return addPlaylistItem(pa.dataset.playlistAdd);const di=e.target.closest('[data-item-del]');if(di){await remove('playlist_items',di.dataset.itemDel);await render();return}const iu=e.target.closest('[data-item-up]');if(iu){await movePlaylistItem(iu.dataset.itemUp,-1);return}const idn=e.target.closest('[data-item-down]');if(idn){await movePlaylistItem(idn.dataset.itemDown,1);return}const pv=e.target.closest('[data-playlist-preview]');if(pv)return previewPlaylist(pv.dataset.playlistPreview);
 const sed=e.target.closest('[data-schedule-edit]');if(sed)return openSchedule(sed.dataset.scheduleEdit);
 const sd=e.target.closest('[data-schedule-del]');if(sd&&confirm('Excluir esta programação?')){await remove('schedules',sd.dataset.scheduleDel);await render();return}
 const gs=e.target.closest('[data-group-sync]');if(gs){const g=demo.groups.find(x=>x.id===gs.dataset.groupSync);if(!g?.playlist_id){alert('Escolha uma playlist no grupo antes de sincronizar.');return}const members=demo.screens.filter(x=>x.group_id===g.id);if(!members.length){alert('Adicione pelo menos uma tela ao grupo.');return}for(const scr of members){if(db)await update('screens',scr.id,{group_id:g.id});}await render();alert('Sincronização enviada para '+members.length+' tela(s). Em até 15 segundos elas alinham o mesmo conteúdo.');return}const ge=e.target.closest('[data-group-edit]');if(ge)return openGroup(ge.dataset.groupEdit);const gd=e.target.closest('[data-group-del]');if(gd&&confirm('Excluir este grupo?')){await remove('groups',gd.dataset.groupDel);for(const s of demo.screens.filter(x=>x.group_id===gd.dataset.groupDel))await update('screens',s.id,{group_id:null});await render();return}
 }catch(err){alert(err.message||String(err))}});
async function movePlaylistItem(id,dir){const item=demo.playlist_items.find(i=>i.id===id);if(!item)return;const rows=demo.playlist_items.filter(i=>i.playlist_id===item.playlist_id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const idx=rows.findIndex(i=>i.id===id),j=idx+dir;if(idx<0||j<0||j>=rows.length)return;const a=rows[idx],b=rows[j],ao=Number(a.sort_order||idx),bo=Number(b.sort_order||j);a.sort_order=bo;b.sort_order=ao;save();if(db){await update('playlist_items',a.id,{sort_order:a.sort_order});await update('playlist_items',b.id,{sort_order:b.sort_order})}await render()}
async function addPlaylistItem(pid){if(!demo.media.length){alert('Adicione um conteúdo primeiro.');return}openModal('Adicionar conteúdo à playlist',`<div class="form">${demo.media.map(m=>`<button class="quick button-media" data-add-media="${m.id}" data-pid="${pid}">${esc(m.name)} <span class="muted">${esc(m.type)}</span></button>`).join('')}</div>`);document.querySelectorAll('[data-add-media]').forEach(b=>b.onclick=async()=>{const existing=demo.playlist_items.find(i=>i.playlist_id===b.dataset.pid&&i.media_id===b.dataset.addMedia);if(existing){alert('Esse conteúdo já está na playlist.');return}const n=demo.playlist_items.filter(i=>i.playlist_id===b.dataset.pid).length;await insert('playlist_items',{playlist_id:b.dataset.pid,media_id:b.dataset.addMedia,sort_order:n});closeModal();render()})}
function wireDrag(){
 let draggedId=null;
 document.querySelectorAll('.drag-item').forEach(el=>{
  el.ondragstart=e=>{
   draggedId=el.dataset.item;
   e.dataTransfer.effectAllowed='move';
   e.dataTransfer.setData('text/plain',draggedId);
   el.style.opacity='.45';
  };
  el.ondragend=()=>{el.style.opacity='';draggedId=null};
  el.ondragover=e=>{
   e.preventDefault();
   e.stopPropagation();
   e.dataTransfer.dropEffect='move';
  };
  el.ondrop=async e=>{
   e.preventDefault();
   e.stopPropagation();
   const id=draggedId||e.dataTransfer.getData('text/plain');
   const targetId=el.dataset.item;
   if(!id||id===targetId)return;
   const moving=demo.playlist_items.find(i=>String(i.id)===String(id));
   const target=demo.playlist_items.find(i=>String(i.id)===String(targetId));
   if(!moving||!target)return;
   const pid=target.playlist_id;
   const rows=demo.playlist_items.filter(i=>String(i.playlist_id)===String(pid)&&String(i.id)!==String(id))
    .sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
   const targetIndex=rows.findIndex(i=>String(i.id)===String(targetId));
   moving.playlist_id=pid;
   rows.splice(targetIndex<0?rows.length:targetIndex,0,moving);
   rows.forEach((r,n)=>r.sort_order=n);
   save();
   if(db){
    for(const r of rows) await update('playlist_items',r.id,{playlist_id:pid,sort_order:r.sort_order});
   }
   await render();
  };
 });
 document.querySelectorAll('[data-playlist]').forEach(zone=>{
  zone.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move'};
  zone.ondrop=async e=>{
   if(e.target.closest('.drag-item'))return;
   e.preventDefault();
   const id=draggedId||e.dataTransfer.getData('text/plain');
   const item=demo.playlist_items.find(i=>String(i.id)===String(id));
   if(!item)return;
   const pid=zone.dataset.playlist;
   const rows=demo.playlist_items.filter(i=>String(i.playlist_id)===String(pid)&&String(i.id)!==String(id))
    .sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0));
   item.playlist_id=pid; rows.push(item); rows.forEach((r,n)=>r.sort_order=n);
   save();
   if(db){for(const r of rows) await update('playlist_items',r.id,{playlist_id:pid,sort_order:r.sort_order})}
   await render();
  };
 });
}
function previewPlaylist(pid){const p=demo.playlists.find(x=>x.id===pid),its=demo.playlist_items.filter(i=>i.playlist_id===pid).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const m=its.map(i=>demo.media.find(x=>x.id===i.media_id)).filter(Boolean);openModal('Pré-visualização',`<div class="card" style="padding:0;overflow:hidden"><div id="previewBox" style="aspect-ratio:16/9;background:#000;display:flex;align-items:center;justify-content:center"></div></div><p class="muted" style="margin-top:10px">${esc(p?.name||'Playlist')} · ${m.length} itens</p>`);let idx=0;const box=qs('#previewBox');const show=()=>{if(!m.length){box.innerHTML='<span class="muted">Playlist vazia</span>';return}const x=m[idx%m.length];box.innerHTML=x.type==='image'?`<img src="${esc(mediaSrc(x))}" style="width:100%;height:100%;object-fit:contain">`:x.type==='video'?`<video src="${esc(mediaSrc(x))}" autoplay muted controls style="width:100%;height:100%;object-fit:contain"></video>`:`<div style="padding:30px;font-size:22px;text-align:center">${esc(x.text_content||x.file_url||x.name)}</div>`;idx++;setTimeout(show,Math.max(2,Number(x.duration||5))*1000)};show()}
['screenSearch','screenFilter','mediaSearch','mediaTypeFilter'].forEach(id=>{const el=qs('#'+id);if(el)el.addEventListener('input',render)});
render();bootLocalPlayer();

// V4.8 - Editor visual local (preserva o core V3.1.1)
(function(){
 const canvas=qs('#sceneCanvas'),props=qs('#sceneProps'); if(!canvas||!props)return;
 let scene=JSON.parse(localStorage.getItem('vd48_scene')||'{"orientation":"landscape","elements":[]}'), selected=null;
 const sid=()=>uid();
 function draw(){canvas.classList.toggle('portrait',scene.orientation==='portrait');qs('#sceneOrientation').value=scene.orientation;canvas.innerHTML=scene.elements.map(el=>`<div class="scene-element ${selected===el.id?'selected':''}" data-scene-id="${el.id}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;${el.type==='text'?'font-size:'+el.size+'px;color:'+el.color+';':''}">${el.type==='text'?`<div class="scene-text">${esc(el.content)}</div>`:el.type==='image'?`<img src="${esc(el.content)}" alt="Imagem">`:el.type==='video'?`<div>▶ VÍDEO</div>`:el.type==='qrcode'?`<div style="font-size:34px">▦<br><small>QR</small></div>`:`<div class="scene-text">${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>`}</div>`).join('');wire();renderProps()}
 function add(type){const defaults={text:'Sua mensagem',image:'https://placehold.co/800x450?text=Imagem',video:'video.mp4',qrcode:'https://exemplo.com',clock:'Relógio'};const el={id:sid(),type,content:defaults[type],x:10,y:10,w:type==='text'?45:35,h:type==='text'?18:35,size:36,color:'#ffffff'};scene.elements.push(el);selected=el.id;draw()}
 function wire(){canvas.querySelectorAll('[data-scene-id]').forEach(node=>{node.onclick=e=>{e.stopPropagation();selected=node.dataset.sceneId;draw()};node.onpointerdown=e=>{if(e.button!==0)return;selected=node.dataset.sceneId;const el=scene.elements.find(x=>x.id===selected),r=canvas.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,ox=el.x,oy=el.y;node.setPointerCapture?.(e.pointerId);node.onpointermove=ev=>{if(!node.hasPointerCapture?.(e.pointerId))return;el.x=Math.max(0,Math.min(100-el.w,ox+(ev.clientX-sx)/r.width*100));el.y=Math.max(0,Math.min(100-el.h,oy+(ev.clientY-sy)/r.height*100));node.style.left=el.x+'%';node.style.top=el.y+'%'};node.onpointerup=()=>{draw()}}})}
 function renderProps(){const el=scene.elements.find(x=>x.id===selected);if(!el){props.innerHTML='<p class="muted">Selecione um elemento.</p>';return}props.innerHTML=`<label>Conteúdo<input id="propContent" value="${esc(el.content)}"></label><label>Largura %<input id="propW" type="number" min="5" max="100" value="${el.w}"></label><label>Altura %<input id="propH" type="number" min="5" max="100" value="${el.h}"></label>${el.type==='text'?`<label>Tamanho<input id="propSize" type="number" min="12" max="120" value="${el.size}"></label><label>Cor<input id="propColor" type="color" value="${el.color}"></label>`:''}<button id="deleteElementBtn" class="btn danger">Excluir elemento</button>`;['propContent','propW','propH','propSize','propColor'].forEach(id=>{const n=qs('#'+id);if(n)n.oninput=()=>{if(id==='propContent')el.content=n.value;if(id==='propW')el.w=Number(n.value);if(id==='propH')el.h=Number(n.value);if(id==='propSize')el.size=Number(n.value);if(id==='propColor')el.color=n.value;draw()}});qs('#deleteElementBtn').onclick=()=>{scene.elements=scene.elements.filter(x=>x.id!==selected);selected=null;draw()}}
 document.querySelectorAll('[data-add-element]').forEach(b=>b.onclick=()=>add(b.dataset.addElement));canvas.onclick=()=>{selected=null;draw()};qs('#sceneOrientation').onchange=e=>{scene.orientation=e.target.value;draw()};qs('#saveSceneBtn').onclick=async()=>{localStorage.setItem('vd48_scene',JSON.stringify(scene));try{if(db){const name=prompt('Nome da cena:','Cena '+new Date().toLocaleDateString('pt-BR'))||'Cena';await insert('scenes',{name,orientation:scene.orientation,content:scene,duration:10,active:true});alert('Cena salva no Supabase e no cache local.')}else alert('Cena salva localmente. Conecte o Supabase para sincronizar.')}catch(err){console.error(err);alert('Cena salva localmente, mas houve erro ao sincronizar: '+err.message)}};qs('#newSceneBtn').onclick=()=>{if(confirm('Criar nova cena?')){scene={orientation:'landscape',elements:[]};selected=null;draw()}};qs('#clearSceneBtn').onclick=()=>{if(confirm('Limpar todos os elementos?')){scene.elements=[];selected=null;draw()}};qs('#previewSceneBtn').onclick=()=>{localStorage.setItem('vd48_scene',JSON.stringify(scene));window.open('../player/scene.html','_blank')};draw();
})();

setInterval(()=>{if(qs('#monitor')?.classList.contains('active')&&!document.querySelector('#modal:not(.hidden)'))render().catch(console.warn)},15000);


// 4.21 — logout real do painel remoto
const logoutBtn=qs('#logoutBtn');
if(logoutBtn)logoutBtn.onclick=async()=>{
  try{
    if(db){const {error}=await db.auth.signOut();if(error)throw error;}
    location.replace('login.html');
  }catch(e){console.error('logout',e);alert('Não foi possível sair: '+(e?.message||e));}
};


// 4.25 — atalho "Mais" da barra inferior abre o menu completo
const mobileMoreBtn=qs('#mobileMoreBtn');
if(mobileMoreBtn) mobileMoreBtn.onclick=()=>{
  document.body.classList.add('mobile-nav-open');
  const b=qs('#mobileMenuBtn'); if(b) b.setAttribute('aria-expanded','true');
};
