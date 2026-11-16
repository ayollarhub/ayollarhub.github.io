# Ayollar Hub — ish rejasi va holat

> Bu fayl loyihaning "xotirasi". Har safar ish shu yerdan davom ettiriladi.
> Oxirgi yangilanish: 2026-11-16 · Versiya: 1.0.0

## Maqsad
Ayollar Hub ilovasini (bitta HTML fayl) **sayt + telefon ilovasi (PWA)** ko'rinishida qayta qurish:
hamma joyda bir xil, bitta baza (Supabase) orqali ulangan, xatolarsiz, admin panel bilan. iOS va Android'da ishlaydi.

## Texnik tuzilma
| Qism | Joyi |
|---|---|
| Sayt (ilova) | `index.html`, `js/app.js`, `css/style.css` |
| Admin panel | `admin.html`, `js/admin.js` |
| Umumiy yadro | `js/core.js` (Supabase ulanishi, yordamchilar) |
| Kontent | `js/content.js` (retseptlar, kurslar, maslahatlar) |
| Tarjimalar | `js/i18n.js` (uz/ru/en interfeys) |
| Sozlamalar | `js/config.js` (Supabase URL + ochiq kalit) |
| Baza sxemasi | `supabase/schema.sql` (jadvallar, xavfsizlik qoidalari) |
| Baza testlari | `supabase/test/*.sql` |
| PWA | `manifest.webmanifest`, `sw.js`, `img/icons/` |

- Baza: Supabase (loyiha: `hjmhvcxekocmhphkkvcq`)
- Hosting: GitHub Pages (`Ziyodaziz/ayollar-hub`)
- Saytni yangilash: fayllarni GitHub'ga yuklash → 1-2 daqiqada sayt yangilanadi. `sw.js` ichidagi `VERSION` ni oshirish kerak.

## 1-bosqich (bajarildi ✅)
- [x] Bitta umumiy kod: sayt (kompyuter) + ilova (telefon, PWA, iOS "Bosh ekranga qo'shish")
- [x] Haqiqiy akkaunt tizimi (Supabase Auth, email + parol, parolni tiklash) — soxta SMS olib tashlandi
- [x] Ro'yxatdan o'tish 2 qadamga qisqartirildi (til → qiziqish + tug'ilgan kun)
- [x] Mehmon sifatida ko'rish (kirmasdan sayt bilan tanishish)
- [x] Tug'ilgan kun tabrigi va qiziqish bo'yicha "Siz uchun" bloki (oldin ma'lumot yig'ilib, ishlatilmasdi)
- [x] Bozor: mahsulotlar hamma foydalanuvchilarga ko'rinadi (oldin faqat bitta brauzerda edi)
- [x] Buyurtmalar sotuvchining paneliga haqiqatan tushadi + jonli bildirishnoma
- [x] Yangi mahsulotlar admin tasdig'idan o'tadi
- [x] Sevimlilar (❤️) saqlanadi va alohida ro'yxat
- [x] Anonim taxta: muallif ID'si bazada ham yashirin, 💗 har kimga 1 marta, shikoyat → 3 ta shikoyatda avto-yashirish
- [x] Bloklangan foydalanuvchi post/mahsulot/buyurtma qila olmaydi
- [x] Brend nomlari ("... uslubidagi") olib tashlandi, soxta homiy raqami olib tashlandi
- [x] `${''}` matn xatosi, ishlamaydigan funksiyalar, takroriy video bloklar, 10+ CSS qatlam tozalandi
- [x] Kurslar to'g'ridan-to'g'ri platformalarga olib boradi (Google qidiruv emas)
- [x] Yagona dizayn tizimi, tungi rejim (avto/yorug'/qorong'i), mobil + kompyuter
- [x] XSS himoyasi: foydalanuvchi matni hamma joyda ekranlanadi
- [x] Admin panel: statistika, mahsulot tasdiqlash, buyurtmalar, post moderatsiyasi, foydalanuvchilar (blok, admin)
- [x] Brauzer "Orqaga" tugmasi ishlaydi (hash marshrutlash)

## Keyingi bosqichlar (navbat bo'yicha)
1. [ ] Kontentni ru/en tillariga to'liq tarjima (hozir faqat interfeys tarjima qilingan)
2. [ ] Telegram bot: buyurtma sotuvchiga avtomatik xabar bo'lib borsin (hozir: panel + qo'lda Telegram)
3. [ ] To'lov: Click / Payme
4. [ ] Sotuvchi reytingi va xaridor sharhlari
5. [ ] Hayz kalendari / salomatlik trekeri
6. [ ] Mutaxassisga (psixolog, ginekolog) sana-vaqt tanlab yozilish
7. [ ] Retseptlar: rasm, qadamma-qadam, vaqt, kaloriya; admin paneldan tahrirlash
8. [ ] Push-bildirishnomalar
9. [ ] Kirill yozuvi (o'zbek kirill)
10. [ ] O'z domeni (masalan ayollarhub.uz)
11. [ ] Sotuvchi mahsulotni tahrirlasa, qayta tekshiruvga tushishi

## Muhim eslatmalar
- Admin: birinchi ro'yxatdan o'tgan akkaunt `admin.html` da "Meni admin qil" tugmasi orqali admin bo'ladi (faqat admin yo'q paytda ishlaydi).
- `img/products/b0.jpg` rasmida brend shishasi ko'rinadi — mahsulot original bo'lmasa, rasmni almashtirish kerak.
- Supabase → Authentication → URL Configuration: Site URL = sayt manzili bo'lishi shart (email tasdiqlash havolasi uchun).

## O'zgarishlar tarixi
- **1.0.0 (2026-11-16)** — Ilova to'liq qayta yozildi: Supabase, admin panel, PWA, GitHub Pages.
