/* ===== Ayollar Hub — Admin panel ===== */
(function(){
const sb = AH.sb, esc = AH.esc, money = AH.money, $ = AH.$;
const A = { user:null, profile:null, tab:'stats', pf:'pending', of:'all', bf:'all', uq:'', postsHidden:false };
const catName = c => (AH.MARKET_CATS[c]||['','Mahsulot'])[1];
const stBadge = s => s==='approved'?'<span class="badge ok">Tasdiqlangan</span>':s==='rejected'?'<span class="badge bad">Rad etilgan</span>':'<span class="badge warn">Kutilmoqda</span>';
const ordBadge = s => `<span class="badge ${s==='yetdi'?'ok':s==='bekor'?'bad':s==='tayyor'?'warn':''}">${esc(AH.ORDER_ST[s]||s)}</span>`;
const fail = err => { console.error(err); AH.toast(AH.errText(err), 4000); };

async function gate(user){
  A.user = user;
  if(!user){ $('gateLogin').classList.remove('hidden'); $('gateNoAdmin').classList.add('hidden'); $('adm').classList.add('hidden'); $('gate').classList.remove('hidden'); $('outBtn').classList.add('hidden'); return; }
  $('outBtn').classList.remove('hidden');
  try{ A.profile = await AH.loadProfile(user.id); }catch(e){ A.profile = null; }
  if(A.profile && A.profile.role==='admin'){ $('gate').classList.add('hidden'); $('adm').classList.remove('hidden'); show(A.tab); return; }
  $('gateLogin').classList.add('hidden');
  const box = $('gateNoAdmin'); box.classList.remove('hidden');
  let exists = true;
  try{ const r = await sb.rpc('admin_exists'); exists = !!r.data; }catch(e){}
  box.innerHTML = exists
    ? `<h2>⛔ Ruxsat yo'q</h2><p class="muted" style="margin-top:8px">${esc(user.email)} akkauntida admin huquqi yo'q. Mavjud admin sizga huquq berishi kerak.</p><button class="btn light" style="margin-top:12px" data-act="logout">Boshqa akkaunt bilan kirish</button>`
    : `<h2>👑 Birinchi admin</h2><p class="muted" style="margin-top:8px">Hali hech kim admin emas. ${esc(user.email)} akkauntini bosh admin qilasizmi? Keyin boshqa adminlarni shu paneldan tayinlaysiz.</p><button class="btn" style="margin-top:12px" data-act="claim">Ha, meni admin qil</button>`;
}

$('admLogin').addEventListener('submit', async e => {
  e.preventDefault(); $('aErr').textContent = '';
  const { data, error } = await sb.auth.signInWithPassword({ email:$('aEmail').value.trim().toLowerCase(), password:$('aPass').value });
  if(error){ $('aErr').textContent = AH.errText(error); return; }
  gate(data.user);
});

function show(tab){
  A.tab = tab;
  document.querySelectorAll('#admNav button').forEach(b=>b.classList.toggle('on', b.dataset.v===tab));
  $('admMain').innerHTML = '<div class="skel"></div>';
  ({stats, products, orders, posts, users})[tab]().catch(fail);
}

/* ---- Statistika ---- */
async function stats(){
  const { data, error } = await sb.rpc('admin_stats'); if(error) throw error;
  const s = data || {};
  const recent = await sb.from('orders').select('*').order('created_at',{ascending:false}).limit(5);
  $('admMain').innerHTML = `<h2 style="margin-bottom:14px">📊 Statistika</h2>
  <div class="kpis">
    <div class="kpi"><b>${s.users||0}</b><span>Foydalanuvchilar</span></div>
    <div class="kpi"><b>${s.users_7d||0}</b><span>Oxirgi 7 kunda qo'shilgan</span></div>
    <div class="kpi"><b>${s.products||0}</b><span>Bozordagi mahsulotlar</span></div>
    <div class="kpi" style="cursor:pointer" data-act="tab" data-v="products"><b>${s.pending||0}</b><span>Tasdiq kutayotgan ›</span></div>
    <div class="kpi"><b>${s.orders||0}</b><span>Jami buyurtmalar</span></div>
    <div class="kpi" style="cursor:pointer" data-act="tab" data-v="orders"><b>${s.orders_new||0}</b><span>Yangi buyurtmalar ›</span></div>
    <div class="kpi"><b style="font-size:1.2rem">${money(s.revenue||0)}</b><span>Yetkazilgan savdo</span></div>
    <div class="kpi" style="cursor:pointer" data-act="tab" data-v="posts"><b>${s.reported||0}</b><span>Shikoyat qilingan postlar ›</span></div>
  </div>
  <h3 class="sec-title">So'nggi buyurtmalar</h3>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sana</th><th>Xaridor</th><th>Sotuvchi</th><th>Summa</th><th>Holat</th></tr></thead><tbody>
  ${(recent.data||[]).map(o=>`<tr><td>${esc(AH.date(o.created_at))}</td><td>${esc(o.buyer_name)}</td><td>${esc(o.seller_name||'Ayollar Hub')}</td><td>${money(o.total)}</td><td>${ordBadge(o.status)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Hali buyurtma yo\'q</td></tr>'}
  </tbody></table></div>`;
}

/* ---- Mahsulotlar ---- */
async function products(){
  let q = sb.from('products').select('*').order('created_at',{ascending:false}).limit(300);
  if(A.pf!=='all') q = q.eq('status', A.pf);
  const { data, error } = await q; if(error) throw error;
  $('admMain').innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2>🛍 Mahsulotlar</h2><button class="btn sm" data-act="newProd">➕ Platforma mahsuloti</button></div>
  <div class="chips">${[['pending','Kutilmoqda'],['approved','Tasdiqlangan'],['rejected','Rad etilgan'],['all','Hammasi']].map(x=>`<button class="chip ${A.pf===x[0]?'on':''}" data-act="pf" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Mahsulot</th><th>Sotuvchi</th><th>Narx</th><th>Holat</th><th>Amallar</th></tr></thead><tbody>
  ${(data||[]).map(p=>{ const u = AH.safeUrl(p.img_url); return `<tr><td>${u?`<img class="thumb" src="${esc(u)}" alt="">`:'<div class="thumb"></div>'}</td>
    <td><b>${esc(p.name)}</b><br><span class="small muted">${esc(catName(p.cat))} · ${esc(AH.date(p.created_at))}</span>${p.descr?`<br><span class="small">${esc(p.descr)}</span>`:''}</td>
    <td>${esc(p.owner_name)}<br><span class="small muted">${p.tg?'@'+esc(p.tg):''} ${esc(p.phone||'')}</span></td><td>${money(p.price)}</td><td>${stBadge(p.status)}${p.stock?'':'<br><span class="badge bad">Tugagan</span>'}</td>
    <td><div class="row">${p.status!=='approved'?`<button class="btn sm" data-act="pSt" data-v="${p.id}" data-s="approved">✓ Tasdiqlash</button>`:''}${p.status!=='rejected'?`<button class="btn sm light" data-act="pSt" data-v="${p.id}" data-s="rejected">✕ Rad etish</button>`:''}<button class="btn sm light" data-act="pDel" data-v="${p.id}">🗑</button></div></td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">Bu ro\'yxat bo\'sh</td></tr>'}
  </tbody></table></div>`;
}

/* ---- Buyurtmalar ---- */
async function orders(){
  let q = sb.from('orders').select('*').order('created_at',{ascending:false}).limit(300);
  if(A.of!=='all') q = q.eq('status', A.of);
  const { data, error } = await q; if(error) throw error;
  $('admMain').innerHTML = `<h2 style="margin-bottom:12px">📦 Buyurtmalar</h2>
  <div class="chips">${[['all','Hammasi'],['yangi','Yangi'],['tayyor','Tayyorlanmoqda'],['yetdi','Yetkazildi'],['bekor','Bekor']].map(x=>`<button class="chip ${A.of===x[0]?'on':''}" data-act="of" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sana</th><th>Tarkib</th><th>Xaridor</th><th>Manzil</th><th>Sotuvchi</th><th>Summa</th><th>Holat</th></tr></thead><tbody>
  ${(data||[]).map(o=>`<tr><td>${esc(AH.date(o.created_at))}</td><td>${(o.items||[]).map(i=>esc(i.name)+' × '+i.qty).join('<br>')}${o.note?`<br><span class="small muted">💬 ${esc(o.note)}</span>`:''}</td>
    <td>${esc(o.buyer_name)}<br><a href="tel:${esc(String(o.phone).replace(/[^\d+]/g,''))}">${esc(o.phone)}</a></td>
    <td>${o.delivery?esc([o.region,o.addr,o.landmark].filter(Boolean).join(', '))+(AH.safeUrl(o.map_url)?` <a href="${esc(o.map_url)}" target="_blank" rel="noopener">📍</a>`:''):'Olib ketadi'}</td>
    <td>${esc(o.seller_name||'Ayollar Hub')}</td><td>${money(o.total)}</td>
    <td><select class="field" style="min-width:150px;margin:0" data-ord="${o.id}">${Object.keys(AH.ORDER_ST).map(k=>`<option value="${k}" ${o.status===k?'selected':''}>${esc(AH.ORDER_ST[k])}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Buyurtma yo\'q</td></tr>'}
  </tbody></table></div>`;
}

/* ---- Postlar ---- */
async function posts(){
  let q = sb.from('posts').select('id,board,text,hidden,hearts,reports,created_at').order('reports',{ascending:false}).order('created_at',{ascending:false}).limit(300);
  if(A.bf!=='all') q = q.eq('board', A.bf);
  const { data, error } = await q; if(error) throw error;
  const bn = {psych:'💗 Psixolog',feedback:'💬 Fikr',request:'🙋‍♀️ So\'rov'};
  $('admMain').innerHTML = `<h2 style="margin-bottom:12px">💬 Postlar moderatsiyasi</h2>
  <div class="chips">${[['all','Hammasi'],['psych','Psixologik taxta'],['feedback','Fikrlar'],['request',"So'rovlar"]].map(x=>`<button class="chip ${A.bf===x[0]?'on':''}" data-act="bf" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sana</th><th>Bo'lim</th><th>Matn</th><th>💗</th><th>⚠️</th><th>Holat</th><th>Amallar</th></tr></thead><tbody>
  ${(data||[]).map(p=>`<tr style="${p.reports>0&&!p.hidden?'background:rgba(214,69,80,.06)':''}"><td>${esc(AH.date(p.created_at))}</td><td>${bn[p.board]||esc(p.board)}</td><td style="max-width:380px">${esc(p.text)}</td><td>${p.hearts}</td><td>${p.reports}</td>
    <td>${p.hidden?'<span class="badge bad">Yashirin</span>':'<span class="badge ok">Ko\'rinadi</span>'}</td>
    <td><div class="row"><button class="btn sm light" data-act="postHide" data-v="${p.id}" data-h="${p.hidden?0:1}">${p.hidden?'👁 Ochish':'🙈 Yashirish'}</button><button class="btn sm light" data-act="postDel" data-v="${p.id}">🗑</button><button class="btn sm light" data-act="postBlock" data-v="${p.id}" title="Muallifni bloklash">⛔</button></div></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Post yo\'q</td></tr>'}
  </tbody></table></div><p class="small muted" style="margin-top:8px">⛔ — muallifni bloklaydi va uning barcha postlarini yashiradi (muallif kimligi ko'rsatilmaydi, anonimlik saqlanadi).</p>`;
}

/* ---- Foydalanuvchilar ---- */
async function users(){
  let q = sb.from('profiles').select('id,name,email,phone,role,is_blocked,shop_name,created_at').order('created_at',{ascending:false}).limit(500);
  const { data, error } = await q; if(error) throw error;
  const s = A.uq.toLowerCase();
  const list = (data||[]).filter(u=>!s || [u.name,u.email,u.phone,u.shop_name].join(' ').toLowerCase().includes(s));
  $('admMain').innerHTML = `<h2 style="margin-bottom:12px">👥 Foydalanuvchilar (${list.length})</h2>
  <input class="field" id="uq" placeholder="Ism, email yoki telefon bo'yicha qidirish" value="${esc(A.uq)}" style="max-width:420px">
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ism</th><th>Email</th><th>Telefon</th><th>Do'kon</th><th>Ro'yxat</th><th>Rol</th><th>Amallar</th></tr></thead><tbody>
  ${list.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email||'')}</td><td>${esc(u.phone||'')}</td><td>${esc(u.shop_name||'')}</td><td>${esc(AH.date(u.created_at))}</td>
    <td>${u.role==='admin'?'<span class="badge">Admin</span>':'Foydalanuvchi'}${u.is_blocked?'<br><span class="badge bad">Bloklangan</span>':''}</td>
    <td>${u.id===A.user.id?'<span class="small muted">Siz</span>':`<div class="row"><button class="btn sm light" data-act="uBlock" data-v="${u.id}" data-b="${u.is_blocked?0:1}">${u.is_blocked?'Blokdan chiqarish':'⛔ Bloklash'}</button><button class="btn sm light" data-act="uRole" data-v="${u.id}" data-r="${u.role==='admin'?'user':'admin'}">${u.role==='admin'?'Adminlikdan olish':'👑 Admin qilish'}</button></div>`}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Topilmadi</td></tr>'}
  </tbody></table></div>`;
}

/* ---- Amallar ---- */
const ACT = {
  tab: el => show(el.dataset.v),
  logout: async () => { await sb.auth.signOut(); gate(null); },
  claim: async () => { const { data, error } = await sb.rpc('claim_first_admin'); if(error) return fail(error); if(!data) return AH.toast('Admin allaqachon tayinlangan.'); AH.toast('Siz endi adminsiz 👑'); gate(A.user); },
  closeModal: () => AH.modal(false),
  pf: el => { A.pf = el.dataset.v; show('products'); },
  of: el => { A.of = el.dataset.v; show('orders'); },
  bf: el => { A.bf = el.dataset.v; show('posts'); },
  pSt: async el => { const { error } = await sb.from('products').update({ status:el.dataset.s }).eq('id', el.dataset.v); if(error) return fail(error); AH.toast('Saqlandi ✅'); show('products'); },
  pDel: async el => { if(!confirm("Mahsulot butunlay o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.")) return; const { error } = await sb.from('products').delete().eq('id', el.dataset.v); if(error) return fail(error); show('products'); },
  postHide: async el => { const { error } = await sb.from('posts').update({ hidden: el.dataset.h==='1' }).eq('id', el.dataset.v); if(error) return fail(error); show('posts'); },
  postDel: async el => { if(!confirm("Post butunlay o'chirilsinmi?")) return; const { error } = await sb.from('posts').delete().eq('id', el.dataset.v); if(error) return fail(error); show('posts'); },
  postBlock: async el => { if(!confirm('Bu post muallifi bloklansinmi? Uning barcha postlari yashiriladi.')) return; const { data, error } = await sb.rpc('admin_block_post_author', { p_post: el.dataset.v }); if(error) return fail(error); AH.toast(data ? 'Muallif bloklandi' : 'Muallif topilmadi'); show('posts'); },
  uBlock: async el => { const b = el.dataset.b==='1'; if(b && !confirm('Foydalanuvchi bloklansinmi? U post yozolmaydi, mahsulot joylay olmaydi va buyurtma bera olmaydi.')) return; const { error } = await sb.from('profiles').update({ is_blocked:b }).eq('id', el.dataset.v); if(error) return fail(error); show('users'); },
  uRole: async el => { if(!confirm(el.dataset.r==='admin' ? "Bu foydalanuvchiga admin huquqi berilsinmi? U hamma narsani boshqara oladi." : 'Adminlik huquqi olib tashlansinmi?')) return; const { error } = await sb.from('profiles').update({ role:el.dataset.r }).eq('id', el.dataset.v); if(error) return fail(error); show('users'); },
  newProd: () => {
    AH.modal(`<h3>➕ Platforma mahsuloti</h3><p class="small muted">Ayollar Hub do'koni nomidan, darhol tasdiqlangan holda qo'shiladi.</p>
      <select class="field" id="apCat">${Object.keys(AH.MARKET_CATS).map(k=>`<option value="${k}">${AH.MARKET_CATS[k][0]} ${esc(AH.MARKET_CATS[k][1])}</option>`).join('')}</select>
      <input class="field" id="apName" placeholder="Nomi" maxlength="80"><input class="field" id="apPrice" type="number" min="1" placeholder="Narxi (so'm)">
      <textarea class="field" id="apDesc" placeholder="Tavsif" maxlength="500"></textarea><input class="field" id="apTg" placeholder="Telegram (bo'sh bo'lsa: ${esc(AH_CONFIG.OWNER_TG)})">
      <label class="lbl">Rasm</label><input class="field" id="apImg" type="file" accept="image/*">
      <div class="row"><button class="btn grow" data-act="newProdSave">Qo'shish</button><button class="btn light" data-act="closeModal">Bekor</button></div><div class="msg-err" id="apErr"></div>`);
  },
  newProdSave: async el => {
    const name = $('apName').value.trim(), price = parseInt($('apPrice').value,10);
    if(name.length<2 || !(price>0)){ $('apErr').textContent = 'Nom va narxni kiriting.'; return; }
    el.disabled = true;
    try{
      const f = $('apImg').files && $('apImg').files[0];
      const img = f ? await AH.uploadImage(f, A.user.id) : '';
      const { error } = await sb.from('products').insert({ owner:null, owner_name:"Ayollar Hub do'koni", cat:$('apCat').value, name, price, descr:$('apDesc').value.trim(), img_url:img, tg:AH.tgName($('apTg').value)||AH_CONFIG.OWNER_TG, status:'approved' });
      if(error) throw error;
      AH.modal(false); AH.toast("Qo'shildi ✅"); A.pf = 'approved'; show('products');
    }catch(err){ el.disabled = false; $('apErr').textContent = AH.errText(err); }
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if(!el || !ACT[el.dataset.act]) return;
  try{ const r = ACT[el.dataset.act](el, e); if(r && r.catch) r.catch(fail); }catch(err){ fail(err); }
});
document.addEventListener('change', async e => {
  const id = e.target.dataset && e.target.dataset.ord; if(!id) return;
  const { error } = await sb.from('orders').update({ status:e.target.value }).eq('id', id);
  if(error) fail(error); else AH.toast('Holat yangilandi ✅');
});
let uqT; document.addEventListener('input', e => { if(e.target.id==='uq'){ A.uq = e.target.value; clearTimeout(uqT); uqT = setTimeout(()=>{ show('users'); setTimeout(()=>{ const i=$('uq'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length); } }, 400); }, 350); } });

(async()=>{ const { data } = await sb.auth.getSession(); gate(data.session ? data.session.user : null); })();
})();
