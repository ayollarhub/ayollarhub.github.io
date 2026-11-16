/* Ayollar Hub — umumiy yadro (sayt va admin panel uchun) */
window.AH = window.AH || {};
(function(){
  /* iOS (xususiy rejim, fayl ko'rinishi) localStorage'ni cheklashi mumkin — xotirada zaxira */
  const mem = Object.create(null);
  AH.store = {
    get(k){ try{ const v = localStorage.getItem(k); return v===null ? (k in mem ? mem[k] : null) : v; }catch(e){ return k in mem ? mem[k] : null; } },
    set(k,v){ v=String(v); mem[k]=v; try{ localStorage.setItem(k,v); }catch(e){} },
    del(k){ delete mem[k]; try{ localStorage.removeItem(k); }catch(e){} },
    json(k,d){ try{ const v = AH.store.get(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
    setJson(k,v){ AH.store.set(k, JSON.stringify(v)); }
  };

  const C = window.AH_CONFIG;
  AH.sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY, {
    auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true,
      storage:{ getItem:k=>AH.store.get(k), setItem:(k,v)=>AH.store.set(k,v), removeItem:k=>AH.store.del(k) } }
  });

  AH.esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  AH.money = n => Number(n||0).toLocaleString('ru-RU').replace(/,/g,' ') + " so'm";
  AH.date = d => { try{ return new Date(d).toLocaleDateString('ru-RU'); }catch(e){ return ''; } };
  AH.$ = id => document.getElementById(id);
  AH.safeUrl = u => { u=String(u||''); return /^(https?:\/\/|img\/)/i.test(u) ? u : ''; };
  AH.tgName = t => String(t||'').replace(/^@/,'').replace(/[^A-Za-z0-9_]/g,'').slice(0,32);
  AH.phoneOk = p => String(p||'').replace(/\D/g,'').length >= 9;

  let toastT;
  AH.toast = (msg, ms) => {
    const el = AH.$('toast'); if(!el) return;
    el.textContent = msg; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove('on'), ms||2600);
  };

  AH.modal = html => {
    const m = AH.$('modal'), i = AH.$('modalIn');
    if(html===false){ m.classList.add('hidden'); i.innerHTML=''; return; }
    i.innerHTML = html; m.classList.remove('hidden');
  };
  document.addEventListener('click', e => { if(e.target && e.target.id==='modal') AH.modal(false); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') AH.modal(false); });

  /* Xatolarni tushunarli matnga aylantirish */
  AH.errText = err => {
    const m = String((err && (err.message||err.error_description)) || err || '');
    if(/Invalid login credentials/i.test(m)) return "Email yoki parol noto'g'ri.";
    if(/Email not confirmed/i.test(m)) return "Email hali tasdiqlanmagan. Pochtangizdagi havolani bosing.";
    if(/User already registered/i.test(m)) return "Bu email bilan akkaunt allaqachon bor. Kirish bo'limidan foydalaning.";
    if(/Password should be/i.test(m)) return "Parol juda oddiy. Kamida 8 ta belgi kiriting.";
    if(/rate limit|too many/i.test(m)) return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.";
    if(/row-level security|Ruxsat/i.test(m)) return "Bu amalga ruxsat yo'q (akkaunt bloklangan bo'lishi mumkin).";
    if(/Failed to fetch|NetworkError|network/i.test(m)) return AH.t ? AH.t('net_err') : "Internet bilan muammo.";
    return m || "Kutilmagan xatolik.";
  };

  /* Rasmni kichraytirib JPEG qilish (telefon rasmlari katta bo'ladi) */
  AH.compressImage = (file, max) => new Promise((res, rej) => {
    if(!file || !/^image\//.test(file.type)) return rej(new Error('Rasm fayl tanlang'));
    const r = new FileReader();
    r.onerror = () => rej(new Error("Rasmni o'qib bo'lmadi"));
    r.onload = () => { const im = new Image();
      im.onerror = () => rej(new Error("Rasm formati qo'llab-quvvatlanmaydi"));
      im.onload = () => { const s = Math.min(1, (max||900)/Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width*s); c.height = Math.round(im.height*s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(b => b ? res(b) : rej(new Error('Rasm xatosi')), 'image/jpeg', .82); };
      im.src = r.result; };
    r.readAsDataURL(file);
  });
  AH.uploadImage = async (file, uid) => {
    const blob = await AH.compressImage(file, 900);
    const path = uid + '/' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.jpg';
    const { error } = await AH.sb.storage.from('products').upload(path, blob, { contentType:'image/jpeg', upsert:false });
    if(error) throw error;
    return AH.sb.storage.from('products').getPublicUrl(path).data.publicUrl;
  };

  AH.applyTheme = t => {
    const r = document.documentElement;
    if(t==='dark'||t==='light'){ r.setAttribute('data-theme', t); AH.store.set('ah_theme', t); }
    else { r.removeAttribute('data-theme'); AH.store.del('ah_theme'); }
  };

  AH.loadProfile = async uid => {
    const { data, error } = await AH.sb.from('profiles').select('*').eq('id', uid).maybeSingle();
    if(error) throw error;
    return data;
  };
})();
