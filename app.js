/* NAVIDAD FAMILIA · GitHub Pages + Supabase REST RPC */
const SUPABASE_URL = 'https://twellzbngmyasduanfqz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Pce-7sG5m_ypxwEGbapYcw_Ui7Rt3cb';
async function rpc(name, params={}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method:'POST',
    headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify(params)
  });
  const raw=await response.text();
  let data;try{data=raw?JSON.parse(raw):null}catch{throw Error('Respuesta no válida de Supabase')}
  if(!response.ok)throw Error(data?.message||data?.error||`Error ${response.status}`);
  return data;
}
const token = new URLSearchParams(location.search).get('token');
window.celebrateSecretSanta=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const colors=['#f2d58d','#d84d53','#f7f5e7','#3c9c76'];for(let i=0;i<55;i++){const piece=document.createElement('i');piece.className='confetti-piece';piece.style.setProperty('--x',Math.random()*100+'vw');piece.style.setProperty('--c',colors[i%colors.length]);piece.style.setProperty('--r',Math.random()*360+'deg');piece.style.setProperty('--drift',(Math.random()*250-125)+'px');piece.style.setProperty('--dur',(2+Math.random()*2)+'s');document.body.appendChild(piece);setTimeout(()=>piece.remove(),4200)}};
if(location.pathname.endsWith('index.html')||location.pathname.endsWith('/')){
  const intro=document.getElementById('intro'), btn=document.getElementById('draw'), out=document.getElementById('result'),edit=document.getElementById('edit-wishes');
  async function init(){try{
    if(!token)throw Error('Necesitas tu enlace personal. Consulta con el organizador.');
    const p=await rpc('identificar_participante',{p_token:token});
    intro.textContent=`¡Hola, ${p.nombre}!`;
    edit.href=`mis-deseos.html?token=${encodeURIComponent(token)}`;edit.hidden=false;
    btn.hidden=false;btn.textContent=p.revelado?'🎁 Ver mi resultado':'🎄 Descubrir mi amigo secreto';
    if(!p.sorteo_iniciado){btn.disabled=true;out.textContent='El organizador aún no ha generado el sorteo.'}
  }catch(e){intro.textContent=e.message}}
  btn?.addEventListener('click',async()=>{btn.disabled=true;out.textContent='Abriendo tu sorpresa...';try{
    const p=await rpc('revelar_amigo',{p_token:token});out.textContent=`🎁 Te tocó regalar a: ${p.amigo_secreto}`;
    btn.hidden=true;window.celebrateSecretSanta();
  }catch(e){out.textContent=e.message;btn.disabled=false}});init();
}
if(location.pathname.endsWith('deseos.html')){
  const box=document.getElementById('wishes-list');
  rpc('ver_deseos').then(people=>{box.replaceChildren();for(const p of people){const card=document.createElement('article');card.className='wish-person';const name=document.createElement('h2');name.textContent='🎁 '+p.nombre;const content=document.createElement('p');content.textContent=p.deseos||'Aún no agregó sugerencias.';if(!p.deseos)content.className='muted';card.append(name,content);box.append(card)}}).catch(e=>box.textContent=e.message);
}
if(location.pathname.endsWith('mis-deseos.html')){
  const who=document.getElementById('who'),form=document.getElementById('wish-form'),wishes=document.getElementById('wishes'),message=document.getElementById('message');
  if(!token)who.textContent='Ingresa desde tu enlace personal para editar tus deseos.';
  else rpc('identificar_participante',{p_token:token}).then(p=>{who.textContent=`¡Hola, ${p.nombre}! Comparte ideas para tu regalo.`;wishes.value=p.deseos||'';form.hidden=false}).catch(e=>who.textContent=e.message);
  form?.addEventListener('submit',async e=>{e.preventDefault();message.textContent='Guardando...';try{await rpc('guardar_deseos',{p_token:token,p_deseos:wishes.value});message.textContent='✨ ¡Tus sugerencias se guardaron correctamente!'}catch(err){message.textContent=err.message}});
}
if(location.pathname.endsWith('admin.html')){
  const rows=document.getElementById('rows'),summary=document.getElementById('summary'),notice=document.getElementById('notice');
  async function refresh(){try{const data=await rpc('estado_publico_sorteo');const people=data.participantes||[];
    summary.textContent=`${people.length} participantes · ${people.filter(p=>p.revelado).length} revelaron · ${people.filter(p=>!p.revelado).length} pendientes · ${data.iniciado?'Sorteo iniciado':'Sorteo pendiente'}`;
    rows.replaceChildren();for(const p of people){const tr=rows.insertRow();for(const value of [p.nombre,p.revelado?'✅ Ya reveló':'⏳ Pendiente','🔒 Privado','Desde Supabase']){const td=tr.insertCell();td.textContent=value}}
    notice.textContent='Para generar el sorteo y copiar enlaces personales, utiliza las consultas SQL indicadas en las instrucciones.';
  }catch(e){notice.textContent=e.message}}
  document.getElementById('start').hidden=true;document.getElementById('add').hidden=true;document.getElementById('name').hidden=true;
  const caption=document.querySelector('.admin-page .muted');if(caption)caption.textContent='Las asignaciones son privadas. Genera el sorteo y copia los enlaces desde Supabase SQL Editor.';
  refresh();setInterval(refresh,15000);
}
