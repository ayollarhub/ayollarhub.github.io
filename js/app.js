/* ===== Ayollar Hub — asosiy ilova (sayt + PWA) ===== */
(function(){
const {esc, money, $, t} = {esc:AH.esc, money:AH.money, $:AH.$, t:AH.t};
const sb = AH.sb, C = window.AH_CONFIG;
const S = {
  user:null, profile:null, guest:false,
  products:[], prodLoaded:false, prodLoading:null, favs:new Set(),
  cart: AH.store.json('ah_cart', []),
  route:'home', sub:'', id:'',
  mk:{cat:'all', q:''}, quiz:{i:0,v:[0,0,0,0],last:null},
  cake:null, dress:{occ:0,len:1,style:0,done:false}, skin:{type:0,goal:0,done:false},
  goal:'Ozish', courseCat:'Hammasi', courseQ:'', recipeQ:'', recipesAll:false,
  myHearts:new Set(), lastTg:[], onbInterest:null
};
AH.S = S; // tekshirish uchun

/* ---------------- Yordamchilar ---------------- */
const isIn = () => !!S.user;
function requireLogin(){
  if(isIn()) return true;
  AH.modal(`<h3>🌸 ${esc(t('need_login'))}</h3><p class="muted" style="margin:8px 0 14px">Ro'yxatdan o'tish bepul va bir daqiqa vaqt oladi.</p>
    <div class="row"><button class="btn grow" data-act="goAuth">${esc(t('login'))}</button><button class="btn light" data-act="closeModal">${esc(t('cancel'))}</button></div>`);
  return false;
}
function video(key){
  const v = AH.VIDEOS[key]; if(!v) return '';
  return `<div class="video"><div class="ic">${v[0]}</div><div><small>${esc(v[1])}</small><h3>${esc(v[2])}</h3><p>${esc(v[3])}</p>
    <a class="btn sm" href="${esc(v[4])}" target="_blank" rel="noopener noreferrer">▶ YouTube</a></div></div>`;
}
const back = (to) => `<button class="backbtn" data-act="go" data-v="${to||'home'}">${esc(t('back'))}</button>`;
function sponsorCta(section){
  const txt = encodeURIComponent(`Salom! Ayollar Hub "${section}" bo'limida homiy bo'lmoqchiman.`);
  return `<div class="sp"><div><small>🤝 HOMIYLIK</small><b>Bu yerda sizning biznesingiz bo'lishi mumkin</b></div><a class="btn sm" target="_blank" rel="noopener" href="https://t.me/${C.OWNER_TG}?text=${txt}">Homiy bo'lish</a></div>`;
}
function saveCart(){ AH.store.setJson('ah_cart', S.cart); updateCartCount(); }
function updateCartCount(){
  const n = S.cart.reduce((s,c)=>s+c.qty,0), el = $('cartCnt');
  el.textContent = n; el.classList.toggle('hidden', !n);
}
function addToCart(it){
  const key = it.pid ? 'p:'+it.pid : 'n:'+it.name;
  const f = S.cart.find(c=>c.key===key);
  if(f) f.qty = Math.min(99, f.qty + (it.qty||1));
  else S.cart.push({key, pid:it.pid||null, name:it.name, price:it.price||0, qty:it.qty||1, img:it.img||'', seller:it.seller||null, seller_name:it.seller_name||'Ayollar Hub', seller_tg:AH.tgName(it.seller_tg||C.OWNER_TG)});
  saveCart(); AH.toast(t('added'));
}
function addService(name){ addToCart({name, price:0}); }
function dessertSVG(r){
  return `<svg viewBox="0 0 120 90" style="width:100%;height:90px;border-radius:12px;display:block" aria-hidden="true"><rect width="120" height="90" fill="${r.c2}"/><ellipse cx="60" cy="72" rx="46" ry="8" fill="#00000014"/><path d="M20 70 L30 30 Q60 14 90 30 L100 70 Z" fill="${r.c}"/><path d="M20 70 Q60 82 100 70 L100 76 Q60 88 20 76 Z" fill="${r.c2}"/></svg>`;
}
const anon = id => AH.ANON[String(id||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) % AH.ANON.length];
const catName = c => (AH.MARKET_CATS[c]||['🛍️','Mahsulot'])[1];
const catEmoji = c => (AH.MARKET_CATS[c]||['🛍️'])[0];
function imgTag(p, cls){
  const u = AH.safeUrl(p.img_url);
  return `<div class="${cls}" style="--tile:${esc(p.tone||'#f3c5d4')}">${u?`<img src="${esc(u)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">`:esc(catEmoji(p.cat))}</div>`;
}

/* ---------------- Ma'lumotlar ---------------- */
async function loadProducts(force){
  if(S.prodLoaded && !force) return S.products;
  if(S.prodLoading && !force) return S.prodLoading;
  S.prodLoading = (async()=>{
    const { data, error } = await sb.from('products').select('*').eq('status','approved').order('sort',{ascending:true}).order('created_at',{ascending:false});
    S.prodLoading = null;
    if(error){ AH.toast(AH.errText(error)); return S.products; }
    S.products = data||[]; S.prodLoaded = true; return S.products;
  })();
  return S.prodLoading;
}
async function loadFavs(){
  S.favs = new Set(); if(!isIn()) return;
  const { data } = await sb.from('favorites').select('product_id');
  (data||[]).forEach(r=>S.favs.add(r.product_id));
}
async function loadPosts(board, limit){
  const { data, error } = await sb.from('posts').select('id,board,text,hearts,reports,created_at').eq('board',board).eq('hidden',false).order('created_at',{ascending:false}).limit(limit||40);
  if(error) throw error; return data||[];
}
async function loadMyHearts(){
  S.myHearts = new Set(); if(!isIn()) return;
  const { data } = await sb.from('post_hearts').select('post_id');
  (data||[]).forEach(r=>S.myHearts.add(r.post_id));
}

/* ---------------- Marshrutlash ---------------- */
const PAGES = ['home','quiz','sweets','market','cart','design','cosmetics','courses','psych','fitness','health','feedback','profile'];
function parseHash(){
  const h = (location.hash||'').replace(/^#\/?/,'').split('/');
  S.route = PAGES.includes(h[0]) ? h[0] : 'home'; S.sub = h[1]||''; S.id = h[2]||'';
}
function go(path){ if(location.hash === '#/'+path) route(); else location.hash = '#/'+path; }
function route(){
  parseHash();
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('on', p.id==='p-'+S.route));
  document.querySelectorAll('[data-r]').forEach(a=>a.classList.toggle('on', a.dataset.r===S.route));
  const fn = RENDER[S.route]; if(fn) Promise.resolve(fn()).catch(err=>{ console.error(err); AH.toast(AH.errText(err)); });
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', route);

/* ---------------- Sahifalar ---------------- */
const RENDER = {};

RENDER.home = function(){
  const h = new Date().getHours();
  const g = t(h<5?'good_night':h<12?'good_morning':h<18?'good_day':'good_evening');
  const name = S.profile && S.profile.name ? ', '+esc(S.profile.name) : '';
  let bday = '';
  if(S.profile && S.profile.birth_date){
    const b = new Date(S.profile.birth_date+'T00:00:00'), n = new Date();
    if(b.getDate()===n.getDate() && b.getMonth()===n.getMonth())
      bday = `<div class="card bday"><h3>🎉 Tug'ilgan kuningiz bilan!</h3><p>Ayollar Hub jamoasi sizni chin qalbdan tabriklaydi. Bugun o'zingizni erkalashni unutmang 💐</p></div>`;
  }
  const forYou = {beauty:['💄','Kosmetika va parvarish','cosmetics'],creative:['🍰','Retseptlar va tort konstruktori','sweets'],growth:['🎓',"Kurslar va o'z ustida ishlash",'courses'],health:['🏃‍♀️','Sport va salomatlik','fitness']}[S.profile&&S.profile.interest];
  const d = AH.DAILY[Math.floor(Date.now()/864e5)%AH.DAILY.length];
  $('p-home').innerHTML = `
  <div class="hello"><h2>${esc(g)}${name} 🌸</h2><p>${esc(t('hello_sub'))}</p></div>
  ${bday}
  <div class="home-grid">
    <div>
      <div class="hero" data-act="go" data-v="market" role="link" tabindex="0">
        <small>Ayollardan ayollarga</small><h2>🛍️ ${esc(t('market'))}</h2>
        <p>Atir, sovg'a, taqinchoq va uy-ro'zg'or mahsulotlari</p>
        <div class="hero-cats">
          <button data-act="mkCatGo" data-v="atir"><b>🌸</b>Atir</button><button data-act="mkCatGo" data-v="sovga"><b>🎁</b>Sovg'a</button>
          <button data-act="mkCatGo" data-v="bijuteriya"><b>💎</b>Bijuteriya</button><button data-act="mkCatGo" data-v="uy"><b>🏠</b>Uy-ro'zg'or</button>
        </div>
        <div class="cta">Bozorga kirish →</div>
      </div>
      <h3 class="sec-title">${esc(t('sections'))}</h3>
      <div class="icons">
        <a href="#/sweets"><i style="--c1:#FF8FB1;--c2:#E2518A">🍰</i><span>${esc(t('sweets'))}</span></a>
        <a href="#/design"><i style="--c1:#A99BFF;--c2:#7C5CFF">🎨</i><span>${esc(t('design'))}</span></a>
        <a href="#/cosmetics"><i style="--c1:#FFB48A;--c2:#F0757A">💄</i><span>${esc(t('cosmetics'))}</span></a>
        <a href="#/courses"><i style="--c1:#5FD3B0;--c2:#2FA383">🎓</i><span>${esc(t('courses'))}</span></a>
        <a href="#/psych"><i style="--c1:#7FB6FF;--c2:#5B7CF0">🧠</i><span>${esc(t('psych'))}</span></a>
        <a href="#/feedback"><i style="--c1:#4FD6C8;--c2:#2AA9B8">💬</i><span>${esc(t('feedback'))}</span></a>
        <a href="#/fitness"><i style="--c1:#FF9E9E;--c2:#E5547A">🏃‍♀️</i><span>${esc(t('fitness'))}</span></a>
        <a href="#/health"><i style="--c1:#8EC5FF;--c2:#6C8EEB">🩺</i><span>${esc(t('health'))}</span></a>
      </div>
    </div>
    <div>
      ${forYou?`<a class="card" href="#/${forYou[2]}" style="display:block;text-decoration:none"><span class="tag v">Siz uchun</span><h3>${forYou[0]} ${esc(forYou[1])}</h3><p>Qiziqishingiz bo'yicha tanlangan bo'lim →</p></a>`:''}
      <a class="card" href="#/quiz" style="display:block;text-decoration:none"><h3>🧩 Test: qaysi shirinlik sizga mos?</h3><p>3 ta savol — natijani do'stlaringizga ulashing</p></a>
      <div class="card pick"><span class="tag" style="background:#ffffff33">Bugungi tanlov</span><h3>${esc(d[0])}</h3><p>${esc(d[1])}</p></div>
      <div id="streakBox"></div>
      <div class="card invite"><h3>💌 Do'stingizni taklif qiling</h3><p>Birga foydalansangiz, yanada qiziqarli</p><button class="btn light sm" data-act="share">Ulashish</button></div>
      <a class="card" href="https://t.me/${C.OWNER_TG}" target="_blank" rel="noopener" style="display:flex;gap:12px;align-items:center;text-decoration:none"><span style="font-size:28px">💬</span><div><h3 style="margin:0">Fikr bildirish</h3><p>Nima yoqdi, nima yoqmadi? Telegramda yozing</p></div></a>
    </div>
  </div>`;
  renderStreak();
};

function renderStreak(){
  const box = $('streakBox'); if(!box) return;
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset()*6e4)/864e5);
  const s = AH.store.json('ah_streak', {last:-9,n:0,hist:[]});
  const done = s.last===day, alive = s.last===day||s.last===day-1, n = alive?s.n:0, c = AH.CHALLENGES[day%AH.CHALLENGES.length];
  let dots=''; for(let i=6;i>=0;i--) dots += `<i class="${(s.hist||[]).includes(day-i)?'on':''}"></i>`;
  box.innerHTML = `<div class="card"><div class="streak"><div class="fire">🔥</div><div><b style="color:var(--primary)">${n} kunlik seriya</b><div class="dots">${dots}</div></div></div>
    <h3 style="margin-top:12px">${c[0]} Bugungi vazifa: ${esc(c[1])}</h3><p style="margin-bottom:10px">${esc(c[2])}</p>
    <button class="btn sm" data-act="streakDone" ${done?'disabled':''}>${done?'Bajarildi ✅':'Bajardim'}</button></div>`;
}

/* --- Test --- */
RENDER.quiz = function(){
  const Q = S.quiz, el = $('p-quiz');
  let h = back('home') + '<div class="card">';
  if(Q.i < AH.QUIZ.length){
    const s = AH.QUIZ[Q.i];
    h += `<p class="small muted" style="text-align:right">${Q.i+1}/${AH.QUIZ.length}</p><h3>${esc(s.q)}</h3>`;
    if(Q.last && Q.last.q===Q.i){
      const a = s.o.find(x=>x[1]===Q.last.a);
      h += `<div class="card soft" style="margin:10px 0"><b>Javobingiz: ${esc(a[0])}</b><p style="margin-top:6px;color:var(--text)">${esc(a[2])}</p><p style="margin-top:6px;color:var(--text)"><b>Maslahat:</b> ${esc(a[3])}</p></div>
        <button class="btn block" data-act="quizNext">${Q.i===AH.QUIZ.length-1?"Natijani ko'rish":'Keyingi savol'} →</button>`;
    } else h += s.o.map(x=>`<button class="opt" data-act="quizAns" data-v="${x[1]}">${esc(x[0])}</button>`).join('');
  } else {
    const r = AH.QUIZ_RES[Q.v.indexOf(Math.max(...Q.v))];
    h += `<div style="text-align:center"><div style="font-size:64px">${r[1]}</div><h3>${esc(r[0])}</h3><p>${esc(r[2])}</p>
      <div class="card soft" style="text-align:left;margin-top:14px"><p style="color:var(--text)"><b>Shaxsiy maslahat:</b> ${esc(r[3])}</p></div>
      <div class="row" style="justify-content:center"><button class="btn" data-act="share" data-text="Mening natijam: ${esc(r[0])} ${r[1]} — Ayollar Hub'da o'zingiznikini toping!">Ulashish</button>
      <button class="btn line" data-act="go" data-v="sweets">Buyurtma berish</button><button class="btn light" data-act="quizReset">Qayta boshlash</button></div></div>`;
  }
  el.innerHTML = h + '</div>';
};

/* --- Shirinliklar --- */
RENDER.sweets = function(){
  $('p-sweets').innerHTML = back('home') + video('sweets') + `
    <h3 class="sec-title">🧁 ${esc(t('recipes'))}</h3>
    <input class="field" id="recipeQ" data-in="recipeQ" placeholder="🔍 Retsept qidirish... (masalan: tiramisu)" value="${esc(S.recipeQ)}" style="max-width:480px">
    <div id="recipeList" class="rgrid" style="margin-top:10px"></div>
    <div class="two-col" style="margin-top:8px">
      <div><h3 class="sec-title">🎂 Tort konstruktori</h3><div id="ctor"></div></div>
      <div><h3 class="sec-title">🙋‍♀️ Kerakli mahsulotni so'rang</h3>
        <div class="card"><p>Katalogda yo'q narsa kerakmi? Yozing — talab yig'ilib, qo'shishga harakat qilamiz.</p>
        <div class="row" style="margin-top:10px"><input class="field grow" id="reqIn" maxlength="200" placeholder="Masalan: shakarsiz halva"><button class="btn" data-act="sendPost" data-v="request" data-in-id="reqIn" data-list="reqList">So'rash</button></div>
        <div id="reqList" style="margin-top:8px"></div></div>
        <h3 class="sec-title">💡 Maslahatlar</h3>
        <div class="card"><span class="tag">Retsept g'oyasi</span><h3>3 komponentli shokoladli desert</h3><p>Erigan shokolad + banan + yong'oq — 10 daqiqada tayyor.</p></div>
        <div class="card"><span class="tag">Maslahat</span><h3>Shakarni kamaytiring</h3><p>Retseptlarda shakarni 20% kamaytiring — ta'm deyarli o'zgarmaydi, foydaliroq bo'ladi.</p></div>
        <div class="card"><span class="tag">G'oya</span><h3>Mavsumiy mevali pirog</h3><p>Mavsumdagi mevalarni ishlating — arzon va ta'mliroq chiqadi.</p></div>
      </div>
    </div>` + sponsorCta('Shirinliklar');
  renderRecipes(); renderCake(); renderPostList('request','reqList',20);
};
function renderRecipes(){
  const q = S.recipeQ.toLowerCase().trim();
  let list = AH.RECIPES.map((r,i)=>({r,i})).filter(x=>!q || x.r.n.toLowerCase().includes(q));
  const total = list.length, cut = !q && !S.recipesAll && total>6;
  if(cut) list = list.slice(0,6);
  $('recipeList').innerHTML = (list.length ? list.map(({r,i})=>`<div class="card">${dessertSVG(r)}<h3 style="margin-top:8px">${esc(r.n)}</h3><p><b>Kerak:</b> ${r.i.map(esc).join(', ')}</p><p style="margin-top:6px">${esc(r.s)}</p>
    <div class="row" style="margin-top:10px"><button class="btn sm line" data-act="ingr" data-v="${i}">🧺 Mahsulotlarni savatga</button></div></div>`).join('') : '<p class="muted">Hech narsa topilmadi.</p>')
    + (cut ? `<button class="btn light" data-act="recipesAll" style="grid-column:1/-1">Yana ${total-6} ta retseptni ko'rish</button>` : '');
}
function cakePreview(){
  const d = AH.CAKES[S.cake.d];
  if(!d.def) return `<div style="text-align:center;font-size:72px;padding:18px 0;background:var(--surface);border-radius:14px">${d.e}</div>`;
  const c = S.cake.col>=0 ? AH.CAKE_COLORS[S.cake.col] : d.def, shp = d.shapes[S.cake.shape];
  let b;
  if(shp==='Kvadrat') b=`<rect x="78" y="40" width="144" height="70" rx="6" fill="${c}" stroke="#00000022"/>`;
  else if(shp==="To'rtburchak") b=`<rect x="60" y="42" width="180" height="68" rx="9" fill="${c}" stroke="#00000022"/>`;
  else if(shp==='Olti burchak') b=`<polygon points="95,28 205,28 245,66 205,104 95,104 55,66" fill="${c}" stroke="#00000022"/>`;
  else if(shp==='Sakkizburchak') b=`<polygon points="105,25 195,25 235,48 235,88 195,111 105,111 65,88 65,48" fill="${c}" stroke="#00000022"/>`;
  else if(shp==='Gul shakli') b=`<g fill="${c}" stroke="#00000022">${Array.from({length:8},(_,i)=>`<circle cx="${150+Math.cos(i*Math.PI/4)*42}" cy="${66+Math.sin(i*Math.PI/4)*28}" r="27"/>`).join('')}<circle cx="150" cy="66" r="35"/></g>`;
  else if(shp==='Yulduzcha') b=`<polygon points="150,20 164,49 196,51 172,72 179,103 150,87 121,103 128,72 104,51 136,49" fill="${c}" stroke="#00000022"/>`;
  else if(shp==='Yurakcha') b=`<path d="M150 112 L95 70 Q78 52 95 36 Q112 22 128 38 L150 58 L172 38 Q188 22 205 36 Q222 52 205 70 Z" fill="${c}" stroke="#00000022"/>`;
  else b=`<ellipse cx="150" cy="66" rx="80" ry="44" fill="${c}" stroke="#00000022"/><ellipse cx="150" cy="40" rx="80" ry="16" fill="#ffffff" opacity=".25"/>`;
  const top = AH.CAKE_TOP[S.cake.top][1] ? `<text x="150" y="72" text-anchor="middle" font-size="24">${AH.CAKE_TOP[S.cake.top][1]}</text>` : '';
  return `<div style="background:var(--surface);border-radius:14px;padding:8px;text-align:center"><svg viewBox="0 0 300 150" width="100%" style="max-height:170px" aria-hidden="true"><ellipse cx="150" cy="128" rx="120" ry="16" fill="#d9d3e6"/>${b}${top}</svg></div>`;
}
function renderCake(){
  const box = $('ctor'); if(!box) return;
  if(!S.cake){ box.innerHTML = '<div class="grid2">'+Object.keys(AH.CAKES).map(k=>`<button class="opt" data-act="cakeStart" data-v="${k}" style="margin:0"><span style="font-size:28px;display:block">${AH.CAKES[k].e}</span>${esc(AH.CAKES[k].n)}</button>`).join('')+'</div>'; return; }
  const K = S.cake, d = AH.CAKES[K.d], st = d.steps[K.i], last = K.i===d.steps.length-1;
  const opts = (list,key)=>'<div class="grid2" style="margin:10px 0">'+list.map((o,i)=>`<button class="opt ${K[key]===i?'on':''}" style="margin:0" data-act="cakeSet" data-k="${key}" data-v="${i}">${esc(o)}</button>`).join('')+'</div>';
  let h = `<div class="card"><button class="backbtn" data-act="cakeExit">← ${esc(d.n)}</button><div class="steps">${d.steps.map((s,i)=>`<div class="${i===K.i?'on':''}">${i+1}<br>${esc(s)}</div>`).join('')}</div>${cakePreview()}`;
  if(st==='Shakl') h += opts(d.shapes,'shape');
  else if(st==='Hajm') h += opts(d.sizes,'size');
  else if(st==="Ta'm") h += opts(d.flav,'flav');
  else if(st==='Rang') h += '<div class="colors">'+AH.CAKE_COLORS.map((c,i)=>`<button class="${K.col===i?'on':''}" style="background:${c}" aria-label="Rang ${i+1}" data-act="cakeSet" data-k="col" data-v="${i}"></button>`).join('')+'</div>';
  else if(st==='Bezak') h += '<div class="grid2" style="margin:10px 0">'+AH.CAKE_TOP.map((o,i)=>`<button class="opt ${K.top===i?'on':''}" style="margin:0" data-act="cakeSet" data-k="top" data-v="${i}">${o[1]} ${esc(o[0])}</button>`).join('')+'</div>';
  else if(st==='Yozuv') h += `<p class="small muted" style="margin:10px 0 6px">Yozuvni qandolatchi yozadi, rasmda ko'rinmaydi.</p><textarea class="field" id="cakeText" data-in="cakeText" maxlength="80" placeholder="Masalan: Tug'ilgan kun muborak!">${esc(K.text)}</textarea>`;
  else h += '<div style="margin:10px 0">'+AH.CAKE_EXT.map((x,i)=>`<button class="opt ${K.ext.includes(i)?'on':''}" data-act="cakeExt" data-v="${i}">${esc(x)}</button>`).join('')+'</div>';
  h += `<div class="row"><button class="btn light" data-act="cakePrev" ${K.i?'':'disabled'}>←</button><button class="btn grow" data-act="cakeNext">${last?"Savatga qo'shish":'Keyingi'}</button></div></div>`;
  box.innerHTML = h;
}

/* --- Postlar (so'rov, fikr, psixologik taxta) --- */
async function renderPostList(board, boxId, limit){
  const box = $(boxId); if(!box) return;
  box.innerHTML = `<p class="muted small">${esc(t('loading'))}</p>`;
  try{
    const items = await loadPosts(board, limit);
    if(!$(boxId)) return;
    if(!items.length){ box.innerHTML = `<p class="muted small">Hali yozuv yo'q. Birinchi bo'ling!</p>`; return; }
    box.innerHTML = items.map(p=>`<div class="post">${board==='psych'?`<b>${esc(anon(p.id))} · ${esc(AH.date(p.created_at))}</b>`:`<b>${esc(AH.date(p.created_at))}</b>`}${esc(p.text)}
      <div class="acts">${board!=='request'?`<button data-act="heart" data-v="${p.id}" aria-label="Yoqdi">${S.myHearts.has(p.id)?'💗':'🤍'} ${p.hearts||0}</button>`:''}<button class="gray" data-act="report" data-v="${p.id}">⚠️ Shikoyat</button></div></div>`).join('');
  }catch(err){ box.innerHTML = `<p class="msg-err">${esc(AH.errText(err))}</p>`; }
}

/* --- Bozor --- */
RENDER.market = async function(){
  const el = $('p-market');
  if(S.sub==='p') return renderProduct(S.id);
  if(S.sub==='sell') return renderSell();
  if(S.sub==='orders') return renderMyOrders();
  const tabs = `<div class="chips"><button class="chip on">${esc(t('buy'))}</button><button class="chip" data-act="go" data-v="market/sell">${esc(t('sell'))}</button><button class="chip" data-act="go" data-v="market/orders">${esc(t('my_orders'))}</button></div>`;
  el.innerHTML = back('home') + tabs + `
    <input class="field" id="mkQ" data-in="mkQ" placeholder="⌕  ${esc(t('search'))}" value="${esc(S.mk.q)}" aria-label="Mahsulot qidirish">
    <div class="chips" id="mkChips" style="margin-top:6px"></div>
    <div class="promo"><div><b>🌸 Sizga qaysi atir mos?</b><div class="small" style="opacity:.9">3 ta qisqa savol bilan mos hidni toping</div></div><button class="btn sm" data-act="perfume">Boshlash</button></div>
    <div id="mkGrid" class="pgrid"><div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>` + sponsorCta('Bozor');
  await loadProducts();
  renderMkGrid();
};
function renderMkGrid(){
  const grid = $('mkGrid'); if(!grid) return;
  const cats = ['all','fav'].concat(Object.keys(AH.MARKET_CATS).filter(k=>S.products.some(p=>p.cat===k)));
  $('mkChips').innerHTML = cats.map(c=>`<button class="chip ${S.mk.cat===c?'on':''}" data-act="mkCat" data-v="${c}">${c==='all'?esc(t('all')):c==='fav'?esc(t('favorites')):catEmoji(c)+' '+esc(catName(c))}</button>`).join('');
  const q = S.mk.q.toLowerCase().trim();
  const list = S.products.filter(p=>(S.mk.cat==='all' || (S.mk.cat==='fav' ? S.favs.has(p.id) : p.cat===S.mk.cat)) && (!q || (p.name+' '+p.owner_name+' '+catName(p.cat)).toLowerCase().includes(q)));
  if(S.mk.cat==='fav' && !isIn()){ grid.innerHTML = `<div class="card" style="grid-column:1/-1"><p>Sevimlilarni saqlash uchun hisobingizga kiring.</p><button class="btn sm" style="margin-top:10px" data-act="goAuth">${esc(t('login'))}</button></div>`; return; }
  grid.innerHTML = list.length ? list.map(p=>`<div class="prod" data-act="go" data-v="market/p/${p.id}" role="link" tabindex="0">
      ${imgTag(p,'im')}<button class="heart" data-act="fav" data-v="${p.id}" aria-label="Sevimli">${S.favs.has(p.id)?'❤️':'🤍'}</button>
      <h4>${esc(p.name)}</h4><div class="pr">${money(p.price)}</div><div class="sel">${esc(p.owner_name)}</div>
      ${p.stock?`<button class="btn sm block" data-act="addProd" data-v="${p.id}">${esc(t('add_cart'))}</button>`:'<span class="badge bad">Tugagan</span>'}</div>`).join('')
    : `<div class="card" style="grid-column:1/-1"><p>Mahsulot topilmadi.</p></div>`;
}
async function renderProduct(id){
  const el = $('p-market');
  el.innerHTML = `<button class="backbtn" data-act="go" data-v="market">← Bozorga qaytish</button><div class="skel"></div>`;
  await loadProducts();
  let p = S.products.find(x=>x.id===id);
  if(!p){ const r = await sb.from('products').select('*').eq('id',id).maybeSingle(); p = r.data; }
  if(!p){ el.innerHTML = `<button class="backbtn" data-act="go" data-v="market">← Bozorga qaytish</button><div class="card"><p>Mahsulot topilmadi yoki o'chirilgan.</p></div>`; return; }
  const tg = AH.tgName(p.tg || (p.owner?'':C.OWNER_TG));
  el.innerHTML = `<button class="backbtn" data-act="go" data-v="market">← Bozorga qaytish</button>
  <div class="card pdetail">${imgTag(p,'pbig')}<div>
    <span class="badge">${catEmoji(p.cat)} ${esc(catName(p.cat))}</span>${p.status!=='approved'?' <span class="badge warn">Tekshiruvda</span>':''}
    <h2 style="margin:12px 0 4px">${esc(p.name)}</h2><div style="font-size:1.5rem;font-weight:800;color:var(--primary)">${money(p.price)}</div>
    <p style="margin-top:8px">Sotuvchi: <b>${esc(p.owner_name)}</b></p>
    <div class="row" style="margin:10px 0">${p.phone?`<a class="btn sm line" href="tel:${esc(p.phone.replace(/[^\d+]/g,''))}">📞 Qo'ng'iroq</a>`:''}${tg?`<a class="btn sm line" target="_blank" rel="noopener" href="https://t.me/${esc(tg)}">✈️ Telegram</a>`:''}
      <button class="btn sm light" data-act="fav" data-v="${p.id}">${S.favs.has(p.id)?'❤️ Sevimlida':'🤍 Sevimliga'}</button></div>
    <p style="color:var(--text)">${esc(p.descr||'')}</p>
    ${p.recipe?`<div class="card soft" style="margin-top:12px"><h3>Retsept</h3><p>${esc(p.recipe)}</p></div>`:''}
    ${p.stock ? `<div class="row" style="margin-top:16px"><div class="qty"><button data-act="qtyD" aria-label="Kamaytirish">−</button><b id="pQty">1</b><button data-act="qtyU" aria-label="Ko'paytirish">+</button></div>
      <button class="btn grow" data-act="addProd" data-v="${p.id}" data-qty="1">${esc(t('add_cart'))}</button><button class="btn line" data-act="buyNow" data-v="${p.id}">Hozir olish</button></div>`
      : '<p class="msg-err">Hozircha tugagan</p>'}
  </div></div>`;
}

/* Sotuvchi paneli */
async function renderSell(){
  const el = $('p-market');
  const tabs = `<div class="chips"><button class="chip" data-act="go" data-v="market">${esc(t('buy'))}</button><button class="chip on">${esc(t('sell'))}</button><button class="chip" data-act="go" data-v="market/orders">${esc(t('my_orders'))}</button></div>`;
  if(!isIn()){ el.innerHTML = back('market') + tabs + `<div class="card"><h3>🏪 Mahsulot sotish</h3><p>Mahsulot joylash uchun hisobingizga kiring.</p><button class="btn" style="margin-top:12px" data-act="goAuth">${esc(t('login'))}</button></div>`; return; }
  el.innerHTML = back('market') + tabs + `<div class="skel"></div>`;
  const [mine, inc] = await Promise.all([
    sb.from('products').select('*').eq('owner', S.user.id).order('created_at',{ascending:false}),
    sb.from('orders').select('*').eq('seller', S.user.id).order('created_at',{ascending:false}).limit(100)
  ]);
  if(mine.error) throw mine.error; if(inc.error) throw inc.error;
  const P = S.profile||{}, my = inc.data||[];
  const stBadge = s => s==='approved'?'<span class="badge ok">Tasdiqlangan</span>':s==='rejected'?'<span class="badge bad">Rad etilgan</span>':'<span class="badge warn">Tekshiruvda</span>';
  el.innerHTML = back('market') + tabs + `<div class="two-col"><div>
    <div class="card"><h3>🏪 Do'kon profili</h3><p class="small">Xaridorlar siz bilan shu orqali bog'lanadi.</p>
      <input class="field" id="shN" placeholder="Do'kon nomi" maxlength="50" value="${esc(P.shop_name||'')}">
      <input class="field" id="shP" type="tel" placeholder="Telefon (+998...)" maxlength="20" value="${esc(P.shop_phone||'')}">
      <input class="field" id="shT" placeholder="Telegram username (masalan: dokonim)" maxlength="40" value="${esc(P.shop_tg||'')}">
      <button class="btn block" data-act="shopSave">${esc(t('save'))}</button></div>
    <div class="card"><h3>➕ Mahsulot qo'shish</h3><p class="small">Yangi mahsulot admin tekshiruvidan keyin bozorda ko'rinadi.</p>
      <select class="field" id="npCat" data-in="npCat">${Object.keys(AH.MARKET_CATS).map(k=>`<option value="${k}">${AH.MARKET_CATS[k][0]} ${esc(AH.MARKET_CATS[k][1])}</option>`).join('')}</select>
      <input class="field" id="npName" placeholder="Nomi" maxlength="80">
      <input class="field" id="npPrice" type="number" inputmode="numeric" min="1" placeholder="Narxi (so'm)">
      <textarea class="field" id="npDesc" rows="2" placeholder="Qisqa tavsif" maxlength="500"></textarea>
      <textarea class="field hidden" id="npRecipe" rows="3" placeholder="Retsept (ixtiyoriy)" maxlength="1500"></textarea>
      <label class="lbl" for="npImg">Rasm</label><input class="field" id="npImg" type="file" accept="image/*">
      <button class="btn block" data-act="addProduct" id="npBtn">Joylash</button><div id="npMsg"></div></div>
  </div><div>
    <div class="stats3"><div><b>${my.filter(o=>o.status==='yangi').length}</b><span>Yangi</span></div><div><b>${my.filter(o=>o.status==='tayyor').length}</b><span>Tayyorlanmoqda</span></div><div><b>${my.filter(o=>o.status==='yetdi').length}</b><span>Yetkazildi</span></div></div>
    <h3 class="sec-title">Mening mahsulotlarim</h3>
    ${(mine.data||[]).length ? mine.data.map(p=>`<div class="card" style="display:flex;gap:12px">${imgTag(p,'mini')}
      <div style="flex:1;min-width:0"><h3>${esc(p.name)}</h3><div style="color:var(--primary);font-weight:800">${money(p.price)}</div><div style="margin:4px 0">${stBadge(p.status)} ${p.stock?'':'<span class="badge bad">Tugagan</span>'}</div>
      <div class="row"><button class="btn sm light" data-act="pStock" data-v="${p.id}" data-s="${p.stock?1:0}">${p.stock?'⏸ Tugadi':'✅ Bor'}</button><button class="btn sm light" data-act="pPrice" data-v="${p.id}" data-p="${p.price}">✏️ Narx</button><button class="btn sm light" data-act="pDel" data-v="${p.id}">🗑</button></div></div></div>`).join('') : '<div class="card"><p>Hali mahsulot joylamadingiz.</p></div>'}
    <h3 class="sec-title">Kelgan buyurtmalar</h3>
    ${my.length ? my.map(o=>orderCard(o,true)).join('') : '<div class="card"><p>Hali buyurtma yo\'q.</p></div>'}
  </div></div>`;
}
function orderCard(o, seller){
  const items = (o.items||[]).map(i=>`${esc(i.name)} × ${i.qty}${i.price?' — '+money(i.price*i.qty):''}`).join('<br>');
  const stc = o.status==='yetdi'?'ok':o.status==='bekor'?'bad':o.status==='tayyor'?'warn':'';
  let h = `<div class="card"><div class="row" style="justify-content:space-between"><span class="badge ${stc}">${esc(AH.ORDER_ST[o.status])}</span><span class="small muted">${esc(AH.date(o.created_at))}</span></div>
    <p style="color:var(--text);margin-top:8px">${items}</p><p style="margin-top:6px"><b>Jami: ${money(o.total)}</b>${(o.items||[]).some(i=>!i.price)?' + kelishiladigan':''}</p>`;
  if(seller) h += `<p style="margin-top:6px">👤 ${esc(o.buyer_name)} · <a href="tel:${esc(String(o.phone).replace(/[^\d+]/g,''))}">${esc(o.phone)}</a><br>${o.delivery?`📍 ${esc([o.region,o.addr].filter(Boolean).join(', '))}${o.landmark?' (mo\'ljal: '+esc(o.landmark)+')':''}${AH.safeUrl(o.map_url)?` · <a href="${esc(o.map_url)}" target="_blank" rel="noopener">xaritada</a>`:''}`:'🚶 Olib ketadi'}${o.note?'<br>💬 '+esc(o.note):''}</p>`;
  else h += `<p style="margin-top:6px">Sotuvchi: ${esc(o.seller_name||'Ayollar Hub')}</p>`;
  if(seller && (o.status==='yangi'||o.status==='tayyor')) h += `<div class="row" style="margin-top:10px"><button class="btn sm" data-act="ordSt" data-v="${o.id}" data-s="tayyor">Tayyorlanmoqda</button><button class="btn sm" data-act="ordSt" data-v="${o.id}" data-s="yetdi">Yetkazildi</button><button class="btn sm light" data-act="ordSt" data-v="${o.id}" data-s="bekor">Bekor</button></div>`;
  if(!seller && o.status==='yangi') h += `<div class="row" style="margin-top:10px"><button class="btn sm light" data-act="ordSt" data-v="${o.id}" data-s="bekor">Bekor qilish</button></div>`;
  return h + '</div>';
}
async function renderMyOrders(){
  const el = $('p-market');
  const tabs = `<div class="chips"><button class="chip" data-act="go" data-v="market">${esc(t('buy'))}</button><button class="chip" data-act="go" data-v="market/sell">${esc(t('sell'))}</button><button class="chip on">${esc(t('my_orders'))}</button></div>`;
  if(!isIn()){ el.innerHTML = back('market')+tabs+`<div class="card"><p>Buyurtmalaringizni ko'rish uchun hisobingizga kiring.</p><button class="btn" style="margin-top:12px" data-act="goAuth">${esc(t('login'))}</button></div>`; return; }
  el.innerHTML = back('market') + tabs + '<div class="skel"></div>';
  const { data, error } = await sb.from('orders').select('*').eq('buyer', S.user.id).order('created_at',{ascending:false}).limit(100);
  if(error) throw error;
  el.innerHTML = back('market') + tabs + '<div class="narrow">' + ((data||[]).length ? data.map(o=>orderCard(o,false)).join('') : '<div class="card"><p>Siz hali buyurtma bermagansiz.</p></div>') + '</div>';
}

/* --- Savat --- */
RENDER.cart = function(){
  const el = $('p-cart'), s = AH.store.json('ah_addr', {});
  if(!S.cart.length){ el.innerHTML = back('market') + `<div class="card"><h3>🧺 ${esc(t('cart'))}</h3><p>${esc(t('empty_cart'))}</p><button class="btn" style="margin-top:12px" data-act="go" data-v="market">Bozorga o'tish</button></div><div id="orderDone"></div>`; return; }
  let tot = 0, unk = false;
  const rows = S.cart.map((c,i)=>{ if(c.price) tot += c.price*c.qty; else unk = true;
    return `<div class="cart-row">${AH.safeUrl(c.img)?`<img src="${esc(c.img)}" alt="">`:''}<div class="nm"><b>${esc(c.name)}</b><span class="small muted">${c.price?money(c.price):'Narx kelishiladi'} · ${esc(c.seller_name)}</span></div>
      <div class="qty"><button data-act="cq" data-v="${i}" data-d="-1" aria-label="Kamaytirish">−</button><b>${c.qty}</b><button data-act="cq" data-v="${i}" data-d="1" aria-label="Ko'paytirish">+</button></div>
      <button class="icon-btn" data-act="crm" data-v="${i}" aria-label="O'chirish">✕</button></div>`; }).join('');
  el.innerHTML = back('market') + `<div class="card"><h3>🧺 ${esc(t('cart'))}</h3>${rows}<p style="margin-top:12px"><b>Jami: ${money(tot)}</b>${unk?' + narxi kelishiladigan mahsulotlar':''}</p></div>
  <div class="card"><h3>📦 Kimga va qayerga?</h3>
    <input class="field" id="oN" placeholder="Qabul qiluvchi ismi" maxlength="60" value="${esc(s.n||(S.profile&&S.profile.name)||'')}">
    <input class="field" id="oP" type="tel" inputmode="tel" placeholder="Telefon (+998...)" maxlength="20" value="${esc(s.p||(S.profile&&S.profile.phone)||'')}">
    <select class="field" id="oD" data-in="oD"><option value="y">🚚 Yetkazib berish</option><option value="o" ${s.d==='o'?'selected':''}>🚶 Olib ketaman</option></select>
    <div id="oAddr" class="${s.d==='o'?'hidden':''}"><select class="field" id="oR">${AH.REGIONS.map(v=>`<option ${s.r===v?'selected':''}>${esc(v)}</option>`).join('')}</select>
      <input class="field" id="oA" placeholder="Tuman, ko'cha, uy / xonadon" maxlength="200" value="${esc(s.a||'')}">
      <input class="field" id="oM" placeholder="Mo'ljal (ixtiyoriy)" maxlength="120" value="${esc(s.m||'')}">
      <button class="btn sm line" data-act="geo">📍 Joylashuvimni yuborish</button><div id="geoMsg" class="small" style="margin-top:6px"></div></div>
    <input class="field" id="oC" placeholder="Izoh (qachonga kerak...)" maxlength="300">
    <button class="btn block" data-act="checkout" id="coBtn" style="margin-top:8px">${esc(t('order_now'))}</button>
    <div id="coMsg"></div>
    <p class="small muted" style="margin-top:10px">To'lov: qabul qilganda naqd yoki sotuvchi bilan kelishuv. Telefon va manzilingiz faqat shu buyurtmaning sotuvchisiga ko'rinadi.</p>
  </div><div id="orderDone"></div>`;
};

/* --- Dizayn --- */
RENDER.design = function(){
  $('p-design').innerHTML = back('home') + video('design') + `<div class="two-col"><div>
    <h3 class="sec-title">👗 Kiyim va tikuv maslahatchisi</h3><div class="card" id="dressBox"></div></div><div>
    <h3 class="sec-title">✨ Zamonaviy ko'ylaklar ilhomi</h3><div class="gallery" style="grid-template-columns:repeat(2,minmax(0,1fr))">${AH.FASHION.map(f=>`<figure><img loading="lazy" src="${esc(f[0])}" alt="${esc(f[1])}"><figcaption>${esc(f[1])}</figcaption></figure>`).join('')}</div></div></div>
    <h3 class="sec-title">🏠 Xona dizayni</h3><div class="rgrid">${AH.ROOM.map(r=>`<div class="card"><svg viewBox="0 0 120 70" style="width:100%;height:60px;border-radius:10px;display:block;margin-bottom:8px;background:var(--surface)" aria-hidden="true">${r[4]}</svg>
      <span class="tag v">${esc(r[0])}</span><h3>${esc(r[1])}</h3><p>${esc(r[2])}</p>${r[3]?`<div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="Xizmat: ${esc(r[1])}">+ Savatga</button></div>`:''}</div>`).join('')}</div>` + sponsorCta('Dizayn');
  renderDress();
};
function dressSVG(style, big){
  const d = AH.DRESS_TIPS[style], w = big?160:60, h = big?150:56;
  let s;
  if(style==='Abaya') s=`<path d="M50 20 Q50 10 60 10 L80 10 Q90 10 90 20 L96 120 L44 120 Z" fill="${d.c}"/>`;
  else if(style==='Milliy') s=`<path d="M58 14 Q70 6 82 14 L88 50 L100 120 L40 120 L52 50 Z" fill="${d.c}"/><circle cx="70" cy="55" r="5" fill="${d.c2}"/><circle cx="58" cy="75" r="5" fill="${d.c2}"/><circle cx="82" cy="75" r="5" fill="${d.c2}"/><circle cx="70" cy="95" r="5" fill="${d.c2}"/>`;
  else if(style==='Zamonaviy') s=`<path d="M60 14 L80 14 L90 55 Q96 60 88 65 L96 120 L44 120 L52 65 Q44 60 50 55 Z" fill="${d.c}"/><rect x="48" y="62" width="44" height="6" fill="${d.c2}"/>`;
  else s=`<path d="M58 14 L82 14 L88 50 L98 120 L42 120 L52 50 Z" fill="${d.c}"/>`;
  return `<svg viewBox="0 0 140 130" style="width:${w}px;height:${h}px;display:block;margin:0 auto" aria-hidden="true"><ellipse cx="70" cy="70" rx="68" ry="64" fill="${d.c2}" opacity=".35"/><circle cx="70" cy="18" r="10" fill="#e8c9a0"/>${s}</svg>`;
}
function renderDress(){
  const D = S.dress, box = $('dressBox'); if(!box) return;
  const opts = (arr,key)=>'<div class="grid2">'+arr.map((x,i)=>`<button class="opt ${D[key]===i?'on':''}" style="margin:0" data-act="dressSet" data-k="${key}" data-v="${i}">${esc(x)}</button>`).join('')+'</div>';
  if(!D.done){
    box.innerHTML = `<h3>Sizga mos kiyimni toping</h3><p class="small" style="margin:8px 0 4px">Tadbir turi:</p>${opts(AH.DRESS_OCC,'occ')}<p class="small" style="margin:10px 0 4px">Uzunlik:</p>${opts(AH.DRESS_LEN,'len')}
      <p class="small" style="margin:10px 0 4px">Uslub:</p><div class="grid4">${AH.DRESS_STYLE.map((x,i)=>`<button class="opt ${D.style===i?'on':''}" style="margin:0;padding:6px" data-act="dressSet" data-k="style" data-v="${i}">${dressSVG(x)}<span class="small">${esc(x)}</span></button>`).join('')}</div>
      <button class="btn block" style="margin-top:12px" data-act="dressGo">Maslahat olish</button>`; return; }
  const st = AH.DRESS_STYLE[D.style], sum = `${AH.DRESS_OCC[D.occ]} · ${AH.DRESS_LEN[D.len]} · ${st}`;
  box.innerHTML = `${dressSVG(st,true)}<h3 style="text-align:center;margin-top:8px">Sizga mos: ${esc(st)} uslub</h3><p class="small" style="text-align:center;margin-bottom:8px">${esc(sum)}</p><p>${esc(AH.DRESS_TIPS[st].d)}</p>
    <div class="row" style="margin-top:12px"><button class="btn sm" data-act="service" data-v="Tikuvga buyurtma: ${esc(sum)}">Tikishga buyurtma</button><button class="btn sm light" data-act="dressReset">Qayta boshlash</button></div>`;
}

/* --- Kosmetika --- */
RENDER.cosmetics = function(){
  $('p-cosmetics').innerHTML = back('home') + video('cosmetics') + `<div class="two-col"><div>
    <h3 class="sec-title">🧴 Teri va parvarish maslahatchisi</h3><div class="card" id="skinBox"></div>
    <div class="card alert"><span class="tag p">Muhim</span><h3>Doimiy muammo bo'lsa — mutaxassisga</h3><p>Akne, allergiya yoki uzoq davom etadigan teri muammolari uchun dermatologga murojaat qiling — bu yerdagi maslahatlar umumiy xarakterda.</p>
      <div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="So'rov: Kosmetolog konsultatsiyasi">Konsultatsiya so'rash</button></div></div>
    <div class="card"><span class="tag p">Maslahat</span><h3>Terini avval tozalang</h3><p>Har qanday krem yoki pardozdan oldin yuzni tozalash samarani oshiradi.</p></div>
    <div class="card"><span class="tag p">G'oya</span><h3>Kam, lekin sifatli</h3><p>10 ta o'rtacha mahsulot o'rniga 3 ta sifatli mahsulot tanlang.</p></div>
  </div><div><h3 class="sec-title">🛍 Mahsulotlar (narx kelishiladi)</h3>
    ${AH.COSMETICS.map(c=>`<div class="card"><span class="tag p">Mahsulot</span><h3>${esc(c[0])}</h3><p>${esc(c[1])}</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="${esc(c[0])}">${esc(t('add_cart'))}</button></div></div>`).join('')}
    <button class="btn line block" data-act="mkCatGo" data-v="kosmetika">Bozordagi kosmetika →</button></div></div>` + sponsorCta('Kosmetika');
  renderSkin();
};
function renderSkin(){
  const K = S.skin, box = $('skinBox'); if(!box) return;
  const opts = (arr,key)=>'<div class="grid2">'+arr.map((x,i)=>`<button class="opt ${K[key]===i?'on':''}" style="margin:0" data-act="skinSet" data-k="${key}" data-v="${i}">${esc(x)}</button>`).join('')+'</div>';
  if(!K.done){ box.innerHTML = `<h3>Terangizga mos parvarishni toping</h3><p class="small" style="margin:8px 0 4px">Teri turi:</p>${opts(AH.SKIN_TYPE,'type')}<p class="small" style="margin:10px 0 4px">Maqsad:</p>${opts(AH.SKIN_GOAL,'goal')}<button class="btn block" style="margin-top:12px" data-act="skinGo">Maslahat olish</button>`; return; }
  const ty = AH.SKIN_TYPE[K.type], g = AH.SKIN_GOAL[K.goal];
  box.innerHTML = `<h3>${esc(ty)} teri · ${esc(g)}</h3><p style="margin-top:6px">${esc(AH.SKIN_TIPS[ty])}</p><p style="margin-top:8px">${esc(AH.SKIN_GOAL_TIPS[g])}</p><button class="btn sm light" style="margin-top:12px" data-act="skinReset">Qayta boshlash</button>`;
}

/* --- Kurslar --- */
RENDER.courses = function(){
  $('p-courses').innerHTML = back('home') + video('courses') + `<h3 class="sec-title">🎓 Kerakli kurslar</h3>
    <input class="field" id="courseQ" data-in="courseQ" placeholder="🔍 Kurs qidirish..." value="${esc(S.courseQ)}">
    <div class="chips" id="courseCats" style="margin-top:6px"></div><div id="courseList"></div>
    <p class="small muted" style="margin-top:8px">Havolalar haqiqiy ta'lim platformalariga (Coursera, Duolingo, freeCodeCamp va h.k.) olib boradi — sertifikatni o'sha platforma beradi.</p>` + sponsorCta('Kurslar');
  renderCourses();
};
function renderCourses(){
  $('courseCats').innerHTML = AH.COURSE_CATS.map(c=>`<button class="chip ${c===S.courseCat?'on':''}" data-act="courseCat" data-v="${esc(c)}">${esc(c)}</button>`).join('');
  const q = S.courseQ.toLowerCase().trim();
  const list = AH.COURSES.filter(c=>(S.courseCat==='Hammasi'||c[1]===S.courseCat)&&(!q||c[0].toLowerCase().includes(q)));
  $('courseList').innerHTML = list.length ? list.map(c=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><h3 style="margin:0">${esc(c[0])}</h3><p class="small">${esc(c[1])} · ${esc(c[2])}</p></div>
    <a class="btn sm line" target="_blank" rel="noopener noreferrer" href="${esc(c[3])}">Ochish ↗</a></div>`).join('') : '<p class="muted">Hech narsa topilmadi.</p>';
}

/* --- Psixolog --- */
RENDER.psych = function(){
  $('p-psych').innerHTML = back('home') + `
  <div class="card alert"><h3>🆘 Shoshilinch yordam kerak bo'lsa</h3><p>Xotin-qizlarga ijtimoiy, psixologik va huquqiy yordam — <b><a href="tel:1146">1146</a></b> (ishonch telefoni, bepul). Favqulodda xavf bo'lsa — <b><a href="tel:102">102</a></b>.</p></div>
  ${video('psych')}
  <div class="card"><span class="tag s">Xizmat</span><h3>Psixolog bilan suhbat so'rovi</h3><p>Suhbat vaqtini so'rash uchun so'rov yuboring, mutaxassis bog'lanadi (pullik).</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="So'rov: Psixolog bilan suhbat">So'rov yuborish</button></div></div>
  <h3 class="sec-title">💗 Anonim qo'llab-quvvatlash taxtasi</h3>
  <div class="card"><p style="margin-bottom:8px">Dardingizni yozing yoki boshqa ayollarning fikrini o'qing. Ismingiz hech kimga ko'rinmaydi. Nomaqbul yozuvlar shikoyat orqali yashiriladi.</p>
    <textarea class="field" id="psyIn" maxlength="600" placeholder="Nima his qilyapsiz?..."></textarea>
    <button class="btn" data-act="sendPost" data-v="psych" data-in-id="psyIn" data-list="psyList">${esc(t('send'))}</button>
    <div id="psyList" style="margin-top:12px"></div></div>
  <div class="card"><span class="tag s">Maslahat</span><h3>Hissiyotlaringizni nomlang</h3><p>"Men ... his qilyapman" deb boshlab, holatingizni aniq ta'riflash yengillik beradi.</p></div>
  <div class="card"><span class="tag s">Maslahat</span><h3>Kuniga 5 daqiqa jimlik</h3><p>Nafas olishga e'tibor qaratish stressni kamaytirishi mumkin.</p></div>
  <div class="card"><span class="tag s">Muhim</span><h3>Bu taxta professional yordam emas</h3><p>Og'ir holatda albatta yuqoridagi raqamlarga yoki mutaxassisga murojaat qiling.</p></div>` + sponsorCta('Psixolog');
  loadMyHearts().then(()=>renderPostList('psych','psyList',40));
};

/* --- Sport --- */
RENDER.fitness = function(){
  $('p-fitness').innerHTML = back('home') + video('fitness') + `<h3 class="sec-title">🎯 Maqsadingiz qanday?</h3><div class="card" id="goalBox"></div>
  <h3 class="sec-title">🤝 Mutaxassis bilan ishlash</h3>
  <div class="card"><span class="tag">Xizmat</span><h3>Fitnes murabbiy so'rovi</h3><p>Shaxsiy mashq rejasi uchun professional murabbiyga so'rov yuboring.</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="So'rov: Fitnes murabbiy">So'rov yuborish</button></div></div>
  <div class="card"><span class="tag">Xizmat</span><h3>Dietolog konsultatsiyasi so'rovi</h3><p>Xavfsiz, shaxsiy ovqatlanish rejasi uchun dietolog bilan bog'lanish.</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="So'rov: Dietolog konsultatsiyasi">So'rov yuborish</button></div></div>
  <h3 class="sec-title">👟 Kerakli jihozlar</h3>
  ${[['Sport krossovka',"Qulay, nafas oluvchi va mashq turiga mos poyabzal."],['Sport kiyim seti',"Harakatni cheklamaydigan, nafas oluvchi mato."],['Yoga gilamchasi',"Uy mashqlari va cho'zilish uchun."]].map(x=>`<div class="card"><span class="tag">Mahsulot</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="${esc(x[0])}">${esc(t('add_cart'))}</button></div></div>`).join('')}
  <h3 class="sec-title">💡 Maslahatlar</h3>
  <div class="card"><span class="tag">Maslahat</span><h3>Kuniga 20-30 daqiqa yurish</h3><p>Muntazam sayr yurak sog'lig'i va kayfiyat uchun eng oddiy va samarali usul.</p></div>
  <div class="card"><span class="tag">Maslahat</span><h3>Kuch va cho'zilish mashqlarini birlashtiring</h3><p>Faqat kardio emas, yengil kuch mashqlari va cho'zilish tanani mutanosib rivojlantiradi.</p></div>
  <div class="card alert"><span class="tag">Muhim</span><h3>Tez natija va'da qiluvchi usullardan ehtiyot bo'ling</h3><p>Sog'lom o'zgarish asta-sekin bo'ladi. Maxsus dieta yoki dori boshlashdan oldin shifokor yoki dietolog bilan maslahatlashing.</p></div>` + sponsorCta('Sport');
  renderGoal();
};
function renderGoal(){
  const box = $('goalBox'); if(!box) return;
  box.innerHTML = '<div class="row" style="margin-bottom:10px">'+Object.keys(AH.GOALS).map(g=>`<button class="opt grow ${g===S.goal?'on':''}" style="margin:0;width:auto" data-act="goal" data-v="${esc(g)}">${esc(g)}</button>`).join('')+`</div><p>${esc(AH.GOALS[S.goal])}</p>`;
}

/* --- Salomatlik --- */
RENDER.health = function(){
  $('p-health').innerHTML = back('home') + `<div class="card alert"><h3>Bu bo'lim tashxis qo'ymaydi</h3><p>Bu yerdagi ma'lumotlar umumiy xarakterda, shaxsiy tibbiy maslahat emas. Alomat sezsangiz yoki xavotir bo'lsangiz, shifokorga murojaat qiling. Favqulodda holatda — <a href="tel:103"><b>103</b></a>.</p></div>
  ${video('health')}
  <div class="two-col"><div class="card"><span class="tag s">Xizmat</span><h3>Terapevt konsultatsiyasi so'rovi</h3><p>Umumiy tekshiruv uchun vaqt so'rash.</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="So'rov: Terapevt konsultatsiyasi">So'rov yuborish</button></div></div>
  <div class="card"><span class="tag s">Xizmat</span><h3>Ginekolog konsultatsiyasi so'rovi</h3><p>Ayollarga xos tekshiruv uchun vaqt so'rash.</p><div class="row" style="margin-top:10px"><button class="btn sm" data-act="service" data-v="So'rov: Ginekolog konsultatsiyasi">So'rov yuborish</button></div></div></div>
  <h3 class="sec-title">📋 Ayollarda tez-tez uchraydigan mavzular</h3>
  <div class="rgrid">${AH.HEALTH.map(h=>`<div class="card"><span class="tag s">Mavzu</span><h3>${esc(h[0])}</h3><p>${esc(h[1])}</p></div>`).join('')}</div>` + sponsorCta('Salomatlik');
};

/* --- Fikr --- */
RENDER.feedback = function(){
  $('p-feedback').innerHTML = back('home') + `<a class="card" href="https://t.me/${C.OWNER_TG}" target="_blank" rel="noopener" style="display:flex;gap:12px;align-items:center;text-decoration:none"><span style="font-size:28px">✈️</span><div><h3 style="margin:0">Telegramda yozish</h3><p>Shaxsiy fikr yoki taklif uchun</p></div></a>
  <div class="card"><h3>💬 Fikr-mulohaza guruhi</h3><p style="margin-bottom:10px">Saytda nima yetishmayapti? Fikringizni yozing — boshqalar ham ko'radi.</p>
    <textarea class="field" id="fbIn" maxlength="600" placeholder="Fikringiz yoki taklifingiz..."></textarea>
    <button class="btn" data-act="sendPost" data-v="feedback" data-in-id="fbIn" data-list="fbList">${esc(t('send'))}</button>
    <div id="fbList" style="margin-top:14px"></div></div>`;
  loadMyHearts().then(()=>renderPostList('feedback','fbList',50));
};

/* --- Profil --- */
RENDER.profile = async function(){
  if(isIn()){ try{ const fresh = await AH.loadProfile(S.user.id); if(fresh) S.profile = fresh; }catch(e){} }
  const el = $('p-profile'), P = S.profile||{};
  const theme = AH.store.get('ah_theme')||'auto';
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const settings = `<div class="card"><h3>⚙️ Sozlamalar</h3>
    <label class="lbl">${esc(t('language'))}</label><div class="row">${['uz','ru','en'].map(l=>`<button class="chip ${AH.lang===l?'on':''}" data-act="setLang" data-v="${l}">${l.toUpperCase()}</button>`).join('')}</div>
    <label class="lbl">${esc(t('theme'))}</label><div class="row">${[['auto','theme_auto'],['light','theme_light'],['dark','theme_dark']].map(x=>`<button class="chip ${theme===x[0]?'on':''}" data-act="setTheme" data-v="${x[0]}">${esc(t(x[1]))}</button>`).join('')}</div></div>
    ${standalone?'':`<div class="card"><h3>📲 ${esc(t('install'))}</h3>${isIOS?`<p>iPhone/iPad: Safari'da <b>Ulashish</b> (⬆️) tugmasini bosing → <b>"Bosh ekranga qo'shish"</b> (Add to Home Screen).</p>`:`<p>Brauzer menyusidan <b>"Ilovani o'rnatish"</b> yoki <b>"Bosh ekranga qo'shish"</b>ni tanlang.</p><button class="btn sm hidden" id="installBtn" data-act="install" style="margin-top:10px">O'rnatish</button>`}</div>`}`;
  if(!isIn()){
    el.innerHTML = back('home') + `<div class="card"><h3>👤 Mehmon</h3><p>Buyurtma berish, mahsulot sotish, sevimlilar va postlar uchun hisobingizga kiring.</p><button class="btn" style="margin-top:12px" data-act="goAuth">${esc(t('login'))} / ${esc(t('register'))}</button></div>` + settings;
    showInstall(); return;
  }
  el.innerHTML = back('home') + `<div class="card"><div class="row"><div style="width:56px;height:56px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-size:1.4rem;font-weight:800">${esc((P.name||'?').charAt(0).toUpperCase())}</div>
    <div class="grow"><h3 style="margin:0">${esc(P.name||'')}</h3><p class="small">${esc(S.user.email||'')}</p></div></div>
    <label class="lbl" for="pfN">${esc(t('name'))}</label><input class="field" id="pfN" maxlength="40" value="${esc(P.name||'')}">
    <label class="lbl" for="pfP">${esc(t('phone'))}</label><input class="field" id="pfP" type="tel" maxlength="20" placeholder="+998..." value="${esc(P.phone||'')}">
    <label class="lbl" for="pfB">${esc(t('birthday_q'))}</label><input class="field" id="pfB" type="date" value="${esc(P.birth_date||'')}">
    <button class="btn block" data-act="saveProfile" style="margin-top:8px">${esc(t('save'))}</button><div id="pfMsg"></div></div>
  <div class="card"><div class="row"><a class="btn line grow" href="#/market/orders">${esc(t('my_orders'))}</a><a class="btn line grow" href="#/market/sell">${esc(t('sell'))}</a></div>
    ${P.role==='admin'?`<a class="btn block" href="admin.html" style="margin-top:10px">🛠 Admin panel</a>`:''}</div>
  ${settings}
  <button class="btn danger block" data-act="logout">${esc(t('logout'))}</button>`;
  showInstall();
};
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; showInstall(); });
function showInstall(){ const b = $('installBtn'); if(b && deferredInstall) b.classList.remove('hidden'); }

/* ---------------- Amallar (hodisalarni bitta joyda boshqarish) ---------------- */
const ACT = {
  go: el => go(el.dataset.v),
  closeModal: () => AH.modal(false),
  goAuth: () => { AH.modal(false); showAuth(); },
  authTab: el => setAuthTab(el.dataset.v),
  guest: () => { S.guest = true; AH.store.set('ah_guest','1'); showApp(); },
  forgot: async () => {
    const email = $('lEmail').value.trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(email)){ $('lErr').textContent = "Avval email manzilingizni yozing."; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    $('lErr').textContent = ''; if(error) $('lErr').textContent = AH.errText(error); else AH.toast('Parolni tiklash havolasi emailingizga yuborildi 📩', 4000);
  },
  onbLang: el => { setLang(el.dataset.v); $('onb1').classList.add('hidden'); $('onb2').classList.remove('hidden'); },
  onbInt: el => { S.onbInterest = el.dataset.v; document.querySelectorAll('[data-act="onbInt"]').forEach(b=>b.classList.toggle('on', b===el)); },
  onbDone: async el => {
    const bd = $('onbBd').value || null;
    if(bd && (new Date(bd) > new Date() || new Date(bd).getFullYear() < 1920)){ $('onbErr').textContent = "Sana noto'g'ri."; return; }
    el.disabled = true;
    const { error } = await sb.from('profiles').update({ lang:AH.lang, interest:S.onbInterest, birth_date:bd, onboarded:true }).eq('id', S.user.id);
    el.disabled = false;
    if(error){ $('onbErr').textContent = AH.errText(error); return; }
    S.profile = Object.assign(S.profile||{}, { lang:AH.lang, interest:S.onbInterest, birth_date:bd, onboarded:true });
    showApp();
  },
  share: async el => {
    const url = location.origin + location.pathname;
    const text = el.dataset.text || "Ayollar Hub — ayollar uchun retseptlar, bozor, salomatlik va boshqalar. Birga sinab ko'raylik! 🌸";
    try{ if(navigator.share){ await navigator.share({ title:'Ayollar Hub', text, url }); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text + ' ' + url); AH.toast('Havola nusxalandi ✅'); }catch(e){ AH.modal(`<h3>Havola</h3><input class="field" readonly value="${esc(url)}"><button class="btn block" data-act="closeModal">OK</button>`); }
  },
  streakDone: () => {
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset()*6e4)/864e5), s = AH.store.json('ah_streak',{last:-9,n:0,hist:[]});
    if(s.last===day) return;
    s.n = s.last===day-1 ? s.n+1 : 1; s.last = day; s.hist = (s.hist||[]).filter(x=>x>day-7).concat(day);
    AH.store.setJson('ah_streak', s); renderStreak(); AH.toast('Barakalla! 🔥');
  },
  quizAns: el => { const k = +el.dataset.v; S.quiz.v[k]++; S.quiz.last = {q:S.quiz.i, a:k}; RENDER.quiz(); },
  quizNext: () => { S.quiz.i++; S.quiz.last = null; RENDER.quiz(); },
  quizReset: () => { S.quiz = {i:0,v:[0,0,0,0],last:null}; RENDER.quiz(); },
  recipesAll: () => { S.recipesAll = true; renderRecipes(); },
  ingr: el => { AH.RECIPES[+el.dataset.v].i.forEach(x=>addToCart({name:x, price:0})); },
  cakeStart: el => { S.cake = {d:el.dataset.v,i:0,shape:0,size:0,flav:0,col:-1,top:0,text:'',ext:[]}; renderCake(); },
  cakeExit: () => { S.cake = null; renderCake(); },
  cakeSet: el => { S.cake[el.dataset.k] = +el.dataset.v; renderCake(); },
  cakeExt: el => { const i = +el.dataset.v, a = S.cake.ext, k = a.indexOf(i); if(k<0) a.push(i); else a.splice(k,1); renderCake(); },
  cakePrev: () => { if(S.cake.i>0){ S.cake.i--; renderCake(); } },
  cakeNext: () => {
    const K = S.cake, d = AH.CAKES[K.d];
    if(K.i < d.steps.length-1){ K.i++; renderCake(); return; }
    let n = `${d.n} · ${d.sizes[K.size]} · ${d.flav[K.flav]}`;
    if(d.def){ n += ' · '+d.shapes[K.shape]; if(K.col>=0) n += ' · rang '+AH.CAKE_COLORS[K.col]; if(K.top) n += ' · '+AH.CAKE_TOP[K.top][0]; if(K.text.trim()) n += ` · Yozuv: "${K.text.trim()}"`; }
    if(K.ext.length) n += ' · ' + K.ext.map(i=>AH.CAKE_EXT[i]).join(', ');
    addService(n); S.cake = null; renderCake();
  },
  sendPost: async el => {
    if(!requireLogin()) return;
    const inp = $(el.dataset.inId), text = inp.value.trim();
    if(text.length < 2){ AH.toast('Iltimos, matn yozing.'); inp.focus(); return; }
    el.disabled = true;
    const { error } = await sb.from('posts').insert({ board:el.dataset.v, text });
    el.disabled = false;
    if(error){ AH.toast(AH.errText(error)); return; }
    inp.value = ''; AH.toast('Yuborildi ✅');
    renderPostList(el.dataset.v, el.dataset.list, el.dataset.v==='request'?20:50);
  },
  heart: async el => {
    if(!requireLogin()) return;
    const id = el.dataset.v, had = S.myHearts.has(id);
    el.disabled = true;
    const r = had ? await sb.from('post_hearts').delete().eq('post_id', id).eq('user_id', S.user.id) : await sb.from('post_hearts').insert({ post_id:id });
    el.disabled = false;
    if(r.error && !/duplicate/i.test(r.error.message)){ AH.toast(AH.errText(r.error)); return; }
    if(had) S.myHearts.delete(id); else S.myHearts.add(id);
    const m = el.textContent.match(/\d+/), n = (m?+m[0]:0) + (had?-1:1);
    el.textContent = (had?'🤍 ':'💗 ') + Math.max(0,n);
  },
  report: async el => {
    if(!requireLogin()) return;
    if(!confirm("Bu yozuv haqida shikoyat yuborilsinmi? 3 ta shikoyatdan keyin u avtomatik yashiriladi.")) return;
    const { error } = await sb.from('reports').insert({ post_id:el.dataset.v });
    if(error){ AH.toast(/duplicate/i.test(error.message) ? 'Siz allaqachon shikoyat qilgansiz.' : AH.errText(error)); return; }
    AH.toast('Shikoyat qabul qilindi. Rahmat!');
  },
  mkCat: el => { S.mk.cat = el.dataset.v; renderMkGrid(); },
  mkCatGo: (el, e) => { e.stopPropagation(); S.mk.cat = el.dataset.v; go('market'); },
  fav: async (el, e) => {
    e.stopPropagation(); if(!requireLogin()) return;
    const id = el.dataset.v, has = S.favs.has(id);
    const r = has ? await sb.from('favorites').delete().eq('product_id', id).eq('user_id', S.user.id) : await sb.from('favorites').insert({ product_id:id });
    if(r.error && !/duplicate/i.test(r.error.message)){ AH.toast(AH.errText(r.error)); return; }
    if(has) S.favs.delete(id); else S.favs.add(id);
    if(S.sub==='p') renderProduct(id); else renderMkGrid();
  },
  addProd: (el, e) => {
    e.stopPropagation();
    const p = S.products.find(x=>x.id===el.dataset.v); if(!p || !p.stock) return;
    const q = $('pQty') && S.sub==='p' ? +$('pQty').textContent : 1;
    addToCart({ pid:p.id, name:p.name, price:p.price, qty:q, img:AH.safeUrl(p.img_url), seller:p.owner, seller_name:p.owner_name, seller_tg:p.tg || (p.owner?'':C.OWNER_TG) });
  },
  buyNow: el => { ACT.addProd(el, {stopPropagation(){}}); go('cart'); },
  qtyD: () => { const q = $('pQty'); q.textContent = Math.max(1, +q.textContent-1); },
  qtyU: () => { const q = $('pQty'); q.textContent = Math.min(99, +q.textContent+1); },
  perfume: () => {
    AH.modal(`<h3>🌷 Atir tanlash testi</h3>
      <label class="lbl">Qaysi hid yoqadi?</label><select class="field" id="pf1"><option value="floral">Gulli va nafis</option><option value="fresh">Toza, sitrusli</option><option value="sweet">Shirin, vanilli</option><option value="woody">Yog'ochsimon, iliq</option></select>
      <label class="lbl">Qachon ishlatasiz?</label><select class="field" id="pf2"><option value="kundalik foydalanishga">Har kuni</option><option value="kechki tadbirga">Kechki tadbirda</option><option value="maxsus kunlarga">Maxsus kunlarda</option></select>
      <label class="lbl">Qanday kuchlilik yoqadi?</label><select class="field" id="pf3"><option>yengil</option><option>o'rtacha</option><option>to'q va sezilarli</option></select>
      <button class="btn block" data-act="perfumeGo" style="margin-top:10px">Menga mos atirni top ✨</button><div id="pfRes"></div>`);
  },
  perfumeGo: () => {
    const a = AH.PERFUME[$('pf1').value];
    $('pfRes').innerHTML = `<div class="card soft" style="margin-top:12px"><b>✨ Tavsiya: ${esc(a[0])}</b><p style="margin-top:6px">${esc(a[1])}, ${esc($('pf2').value)} mos. Kuchlilik: ${esc($('pf3').value)}.</p><p class="small" style="margin-top:6px">Maslahat: avval terida oz miqdorda sinab ko'ring.</p>
      <button class="btn sm" style="margin-top:10px" data-act="perfumeShow">Atirlarni ko'rish</button></div>`;
  },
  perfumeShow: () => { AH.modal(false); S.mk.cat = 'atir'; go('market'); renderMkGrid(); },
  shopSave: async el => {
    const v = { shop_name:$('shN').value.trim(), shop_phone:$('shP').value.trim(), shop_tg:AH.tgName($('shT').value) };
    if(v.shop_phone && !AH.phoneOk(v.shop_phone)){ AH.toast("Telefon raqam noto'g'ri."); return; }
    el.disabled = true;
    const { error } = await sb.from('profiles').update(v).eq('id', S.user.id);
    el.disabled = false;
    if(error){ AH.toast(AH.errText(error)); return; }
    Object.assign(S.profile, v); AH.toast('Saqlandi ✅');
  },
  addProduct: async el => {
    const msg = $('npMsg'), P = S.profile||{};
    const name = $('npName').value.trim(), price = parseInt($('npPrice').value, 10), cat = $('npCat').value;
    msg.className = 'msg-err';
    if(name.length < 2){ msg.textContent = 'Mahsulot nomini yozing.'; return; }
    if(!(price > 0)){ msg.textContent = "Narxni to'g'ri kiriting."; return; }
    if(!P.shop_tg && !P.shop_phone){ msg.textContent = "Avval do'kon profilida telefon yoki Telegram'ni saqlang — xaridorlar siz bilan bog'lanishi kerak."; return; }
    el.disabled = true; msg.className = 'muted small'; msg.textContent = 'Yuklanmoqda…';
    try{
      let img = '';
      const f = $('npImg').files && $('npImg').files[0];
      if(f) img = await AH.uploadImage(f, S.user.id);
      const row = { owner:S.user.id, owner_name:(P.shop_name||P.name||'Sotuvchi').slice(0,50), cat, name, price, descr:$('npDesc').value.trim(), img_url:img, tg:P.shop_tg||'', phone:P.shop_phone||'' };
      if(cat==='shirinlik') row.recipe = $('npRecipe').value.trim();
      const { error } = await sb.from('products').insert(row);
      if(error) throw error;
      AH.toast("Mahsulot yuborildi — admin tasdiqlagach bozorda ko'rinadi ✅", 4000);
      renderSell();
    }catch(err){ msg.className = 'msg-err'; msg.textContent = AH.errText(err); el.disabled = false; }
  },
  pStock: async el => { const { error } = await sb.from('products').update({ stock: el.dataset.s!=='1' }).eq('id', el.dataset.v); if(error) AH.toast(AH.errText(error)); else { S.prodLoaded = false; renderSell(); } },
  pPrice: el => {
    AH.modal(`<h3>✏️ Yangi narx</h3><input class="field" id="newPrice" type="number" inputmode="numeric" min="1" value="${esc(el.dataset.p)}"><div class="row"><button class="btn grow" data-act="pPriceSave" data-v="${esc(el.dataset.v)}">${esc(t('save'))}</button><button class="btn light" data-act="closeModal">${esc(t('cancel'))}</button></div>`);
  },
  pPriceSave: async el => {
    const n = parseInt($('newPrice').value, 10); if(!(n>0)){ AH.toast("Narx noto'g'ri"); return; }
    const { error } = await sb.from('products').update({ price:n }).eq('id', el.dataset.v);
    if(error){ AH.toast(AH.errText(error)); return; }
    AH.modal(false); S.prodLoaded = false; renderSell();
  },
  pDel: async el => {
    if(!confirm("Mahsulot o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.")) return;
    const { error } = await sb.from('products').delete().eq('id', el.dataset.v);
    if(error) AH.toast(AH.errText(error)); else { S.prodLoaded = false; renderSell(); }
  },
  ordSt: async el => {
    if(el.dataset.s==='bekor' && !confirm('Buyurtma bekor qilinsinmi?')) return;
    el.disabled = true;
    const { error } = await sb.from('orders').update({ status:el.dataset.s }).eq('id', el.dataset.v);
    if(error){ el.disabled = false; AH.toast(AH.errText(error)); return; }
    AH.toast('Holat yangilandi ✅'); route();
  },
  cq: el => { const c = S.cart[+el.dataset.v]; if(!c) return; c.qty = Math.min(99, Math.max(1, c.qty + (+el.dataset.d))); saveCart(); RENDER.cart(); },
  crm: el => { S.cart.splice(+el.dataset.v, 1); saveCart(); RENDER.cart(); },
  geo: () => {
    const m = $('geoMsg');
    if(!navigator.geolocation){ m.textContent = 'Bu qurilma joylashuvni bermaydi — manzilni yozing.'; return; }
    m.textContent = 'Aniqlanmoqda…';
    navigator.geolocation.getCurrentPosition(p=>{ S.geo = p.coords.latitude.toFixed(6)+','+p.coords.longitude.toFixed(6);
      m.innerHTML = `✅ Joylashuv olindi · <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${S.geo}">xaritada ko'rish</a>`; },
      ()=>{ m.textContent = "Ruxsat berilmadi — manzilni qo'lda yozing."; }, { enableHighAccuracy:true, timeout:12000 });
  },
  checkout: async el => {
    const msg = $('coMsg'); msg.className = 'msg-err'; msg.textContent = '';
    if(!S.cart.length) return;
    if(!requireLogin()) return;
    const g = id => ($(id) ? $(id).value.trim() : '');
    const name = g('oN'), phone = g('oP'), del = g('oD')==='y', addr = g('oA');
    if(name.length < 2 || !AH.phoneOk(phone)){ msg.textContent = "Ism va to'g'ri telefon raqamini kiriting."; return; }
    if(del && addr.length < 5 && !S.geo){ msg.textContent = 'Manzil yozing yoki joylashuvni yuboring 📍'; return; }
    AH.store.setJson('ah_addr', { n:name, p:phone, d:del?'y':'o', r:g('oR'), a:addr, m:g('oM') });
    const groups = {};
    S.cart.forEach(c=>{ const k = c.seller || 'platform'; (groups[k] = groups[k] || []).push(c); });
    const mapUrl = del && S.geo ? 'https://www.google.com/maps?q='+S.geo : '';
    const rows = Object.keys(groups).map(k=>{ const L = groups[k];
      return { seller: k==='platform'?null:k, seller_name:L[0].seller_name, seller_tg:L[0].seller_tg,
        items: L.map(c=>({ pid:c.pid, name:c.name, price:c.price, qty:c.qty })), total: L.reduce((s,c)=>s+(c.price||0)*c.qty,0),
        buyer_name:name, phone, delivery:del, region:del?g('oR'):'', addr:del?addr:'', landmark:del?g('oM'):'', map_url:mapUrl, note:g('oC') }; });
    el.disabled = true; el.textContent = 'Yuborilmoqda…';
    const { error } = await sb.from('orders').insert(rows);
    if(error){ el.disabled = false; el.textContent = t('order_now'); msg.textContent = AH.errText(error); return; }
    S.lastTg = rows.map(r=>({ tg:r.seller_tg || C.OWNER_TG, text: '🛍 Yangi buyurtma (Ayollar Hub)\n' + r.items.map(i=>'• '+i.name+' × '+i.qty+(i.price?' — '+money(i.price*i.qty):'')).join('\n')
      + '\nJami: '+money(r.total)+'\n👤 '+name+'\n📞 '+phone+'\n'+(del?'📍 '+[r.region,r.addr].filter(Boolean).join(', ')+(r.landmark?' (mo\'ljal: '+r.landmark+')':'')+(mapUrl?'\n🗺 '+mapUrl:''):'🚶 Olib ketadi')+(r.note?'\n💬 '+r.note:''), name:r.seller_name }));
    S.cart = []; S.geo = ''; saveCart(); RENDER.cart();
    $('orderDone').innerHTML = `<div class="card soft"><h3>Buyurtma qabul qilindi ✅</h3><p style="color:var(--text)">Buyurtma sotuvchining paneliga tushdi. Tezroq javob olish uchun sotuvchiga Telegramda ham yozing — matn avtomatik nusxalanadi, chatga joylashtirasiz.</p>
      <div class="row" style="margin-top:10px">${S.lastTg.map((x,i)=>`<button class="btn sm" data-act="tgSend" data-v="${i}">✈️ ${esc(x.name)} (@${esc(x.tg)})</button>`).join('')}<a class="btn sm line" href="#/market/orders">📦 Buyurtmalarim</a></div></div>`;
  },
  tgSend: async el => {
    const x = S.lastTg[+el.dataset.v]; if(!x) return;
    try{ await navigator.clipboard.writeText(x.text); AH.toast('Buyurtma matni nusxalandi — chatga joylashtiring', 3500); }catch(e){}
    window.open('https://t.me/' + encodeURIComponent(x.tg), '_blank', 'noopener');
  },
  service: el => addService(el.dataset.v),
  dressSet: el => { S.dress[el.dataset.k] = +el.dataset.v; renderDress(); },
  dressGo: () => { S.dress.done = true; renderDress(); },
  dressReset: () => { S.dress = {occ:0,len:1,style:0,done:false}; renderDress(); },
  skinSet: el => { S.skin[el.dataset.k] = +el.dataset.v; renderSkin(); },
  skinGo: () => { S.skin.done = true; renderSkin(); },
  skinReset: () => { S.skin = {type:0,goal:0,done:false}; renderSkin(); },
  courseCat: el => { S.courseCat = el.dataset.v; renderCourses(); },
  goal: el => { S.goal = el.dataset.v; renderGoal(); },
  setLang: async el => { setLang(el.dataset.v); if(isIn()) await sb.from('profiles').update({ lang:AH.lang }).eq('id', S.user.id); route(); },
  setTheme: el => { AH.applyTheme(el.dataset.v); RENDER.profile(); },
  install: async () => { if(!deferredInstall) return; deferredInstall.prompt(); try{ await deferredInstall.userChoice; }catch(e){} deferredInstall = null; },
  saveProfile: async el => {
    const v = { name:$('pfN').value.trim().slice(0,40), phone:$('pfP').value.trim(), birth_date:$('pfB').value || null };
    const m = $('pfMsg');
    if(v.name.length < 2){ m.className='msg-err'; m.textContent = 'Ismingizni yozing.'; return; }
    if(v.phone && !AH.phoneOk(v.phone)){ m.className='msg-err'; m.textContent = "Telefon raqam noto'g'ri."; return; }
    el.disabled = true;
    const { error } = await sb.from('profiles').update(v).eq('id', S.user.id);
    el.disabled = false;
    if(error){ m.className='msg-err'; m.textContent = AH.errText(error); return; }
    Object.assign(S.profile, v); m.className='msg-ok'; m.textContent = 'Saqlandi ✅';
  },
  logout: async () => { await sb.auth.signOut(); AH.store.del('ah_guest'); S.user = null; S.profile = null; S.favs = new Set(); showAuth(); },
  newPass: async el => {
    const p = $('np1').value;
    if(p.length < 8){ $('npErr').textContent = 'Kamida 8 ta belgi.'; return; }
    el.disabled = true;
    const { error } = await sb.auth.updateUser({ password:p });
    el.disabled = false;
    if(error){ $('npErr').textContent = AH.errText(error); return; }
    AH.modal(false); AH.toast('Parol yangilandi ✅');
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if(!el) return;
  const fn = ACT[el.dataset.act]; if(!fn) return;
  if(el.tagName==='A' && el.getAttribute('href')==null) e.preventDefault();
  try{ const r = fn(el, e); if(r && r.catch) r.catch(err=>{ console.error(err); AH.toast(AH.errText(err)); }); }
  catch(err){ console.error(err); AH.toast(AH.errText(err)); }
});
document.addEventListener('keydown', e => {
  if(e.key!=='Enter') return;
  const el = e.target.closest('[role="link"][data-act]'); if(el){ e.preventDefault(); el.click(); }
});
/* Matn kiritish (qidiruvlar) */
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.in; if(!k) return;
  const v = e.target.value;
  if(k==='recipeQ'){ S.recipeQ = v; renderRecipes(); }
  else if(k==='mkQ'){ S.mk.q = v; renderMkGrid(); }
  else if(k==='courseQ'){ S.courseQ = v; renderCourses(); }
  else if(k==='cakeText'){ S.cake.text = v; }
  else if(k==='oD'){ $('oAddr').classList.toggle('hidden', v!=='y'); }
  else if(k==='npCat'){ $('npRecipe').classList.toggle('hidden', v!=='shirinlik'); }
});
document.addEventListener('change', e => {
  const k = e.target.dataset && e.target.dataset.in;
  if(k==='oD') $('oAddr').classList.toggle('hidden', e.target.value!=='y');
  if(k==='npCat') $('npRecipe').classList.toggle('hidden', e.target.value!=='shirinlik');
});

/* ---------------- Kirish oqimi ---------------- */
function setLang(l){ AH.lang = ['uz','ru','en'].includes(l) ? l : 'uz'; AH.store.set('ah_lang', AH.lang); AH.applyI18n(); }
function setAuthTab(v){
  document.querySelectorAll('[data-act="authTab"]').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  $('loginForm').classList.toggle('hidden', v!=='login'); $('regForm').classList.toggle('hidden', v!=='register');
}
function showAuth(){ $('auth').classList.remove('hidden'); $('onb').classList.add('hidden'); }
function showOnb(){ $('auth').classList.add('hidden'); $('onb').classList.remove('hidden'); $('onb1').classList.remove('hidden'); $('onb2').classList.add('hidden'); }
function showApp(){ $('auth').classList.add('hidden'); $('onb').classList.add('hidden'); route(); }

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('lEmail').value.trim().toLowerCase(), password = $('lPass').value, err = $('lErr'), btn = e.target.querySelector('button[type=submit]');
  err.textContent = '';
  if(!/^\S+@\S+\.\S+$/.test(email) || !password){ err.textContent = 'Email va parolni kiriting.'; return; }
  btn.disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false;
  if(error){ err.textContent = AH.errText(error); return; }
  /* onAuthStateChange davom ettiradi */
});
$('regForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('rName').value.trim(), email = $('rEmail').value.trim().toLowerCase(), password = $('rPass').value, err = $('rErr'), ok = $('rOk'), btn = e.target.querySelector('button[type=submit]');
  err.textContent = ''; ok.textContent = '';
  if(name.length < 2){ err.textContent = 'Ismingizni kiriting.'; return; }
  if(!/^\S+@\S+\.\S+$/.test(email)){ err.textContent = "To'g'ri email manzilini kiriting."; return; }
  if(password.length < 8){ err.textContent = "Parol kamida 8 ta belgidan iborat bo'lsin."; return; }
  btn.disabled = true;
  const { data, error } = await sb.auth.signUp({ email, password, options:{ data:{ name, lang:AH.lang }, emailRedirectTo: location.origin + location.pathname } });
  btn.disabled = false;
  if(error){ err.textContent = AH.errText(error); return; }
  if(data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0){ err.textContent = "Bu email bilan akkaunt allaqachon bor. Kirish bo'limidan foydalaning."; return; }
  if(!data.session){ ok.textContent = `📩 ${email} manziliga tasdiqlash xati yuborildi. Xatdagi havolani bosing, so'ng shu yerda kiring.`; setTimeout(()=>{ setAuthTab('login'); $('lEmail').value = email; }, 300); }
});

async function afterLogin(user){
  S.user = user; S.guest = false; AH.store.del('ah_guest');
  try{ S.profile = await AH.loadProfile(user.id); }catch(e){ S.profile = null; }
  if(!S.profile){ /* trigger hali ishlamagan bo'lsa */ S.profile = { id:user.id, name:(user.user_metadata||{}).name||'', onboarded:false, role:'user' }; }
  if(S.profile.is_blocked) AH.toast("Akkauntingiz vaqtincha cheklangan. Savollar bo'lsa Telegram orqali yozing.", 5000);
  if(S.profile.lang && S.profile.lang!==AH.lang) setLang(S.profile.lang);
  $('profBtn').textContent = (S.profile.name||'👤').charAt(0).toUpperCase();
  loadFavs().then(()=>{ if(S.route==='market') renderMkGrid(); });
  subscribeRealtime();
  if(!S.profile.onboarded) showOnb(); else showApp();
}

let rt = null;
function subscribeRealtime(){
  if(rt || !S.user) return;
  try{
    rt = sb.channel('ah-live')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'orders', filter:'seller=eq.'+S.user.id }, () => { AH.toast('🛍 Sizga yangi buyurtma keldi!', 4000); if(S.route==='market' && S.sub==='sell') renderSell(); })
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'orders', filter:'buyer=eq.'+S.user.id }, p => { const st = p.new && AH.ORDER_ST[p.new.status]; if(st) AH.toast('📦 Buyurtma holati: '+st, 4000); if(S.route==='market' && S.sub==='orders') renderMyOrders(); })
      .subscribe();
  }catch(e){ console.warn('realtime', e); }
}

sb.auth.onAuthStateChange((event, session) => {
  setTimeout(()=>{ /* Supabase tavsiyasi: callback ichida await qilmaslik */
    if(event==='PASSWORD_RECOVERY'){
      AH.modal(`<h3>🔐 Yangi parol</h3><input class="field" id="np1" type="password" minlength="8" placeholder="Kamida 8 ta belgi" autocomplete="new-password"><button class="btn block" data-act="newPass">${esc(t('save'))}</button><div class="msg-err" id="npErr"></div>`);
    }
    if(event==='SIGNED_IN' && session && (!S.user || S.user.id!==session.user.id)) afterLogin(session.user);
    if(event==='SIGNED_OUT'){ S.user = null; S.profile = null; if(rt){ sb.removeChannel(rt); rt = null; } $('profBtn').textContent = '👤'; }
  }, 0);
});

/* ---------------- Ishga tushirish ---------------- */
(async function boot(){
  $('year').textContent = new Date().getFullYear();
  setLang(AH.store.get('ah_lang') || 'uz');
  updateCartCount();
  let session = null;
  try{ const r = await sb.auth.getSession(); session = r.data && r.data.session; }catch(e){ console.warn(e); }
  if(session){ await afterLogin(session.user); }
  else if(AH.store.get('ah_guest')==='1'){ S.guest = true; showApp(); }
  else { showAuth(); route(); }
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
})();
})();
