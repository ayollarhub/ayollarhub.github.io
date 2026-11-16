# 🌸 Ayollar Hub

Ayollar uchun makon: retseptlar, ayollardan ayollarga bozor, go'zallik, sport, salomatlik, kurslar va anonim qo'llab-quvvatlash.

- **Sayt va ilova bitta kod:** kompyuterda sayt, telefonda ilova (PWA). iPhone'da Safari → Ulashish → "Bosh ekranga qo'shish".
- **Baza:** Supabase (`supabase/schema.sql`)
- **Admin panel:** `admin.html`
- **Reja va holat:** [PLAN.md](PLAN.md)

## Ishga tushirish (yangi Supabase loyiha uchun)
1. Supabase → SQL Editor → `supabase/schema.sql` ni to'liq ishga tushiring.
2. `js/config.js` ga loyiha URL va publishable kalitni yozing.
3. Supabase → Authentication → URL Configuration → Site URL = sayt manzili.
4. Saytda ro'yxatdan o'ting, so'ng `admin.html` da "Meni admin qil" ni bosing.
