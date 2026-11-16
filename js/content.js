/* Ayollar Hub — statik kontent (retseptlar, maslahatlar, kurslar va h.k.) */
window.AH = window.AH || {};

AH.RECIPES = [
 {n:'Medovik torti',c:'#d9a05b',c2:'#f0dcb8',i:['Asal','Un','Tuxum','Smetana','Shakar'],s:'Asalli qatlamlarni pishirib, smetana kremi bilan qatlamlang, 6-8 soat damlang.'},
 {n:'Napoleon torti',c:'#f0e2b8',c2:'#fff7e0',i:['Un',"Sariyog'",'Tuxum','Sut','Shakar'],s:'Yupqa qatlamlarni pishiring, zavarnoy krem bilan qatlamlang, bir kecha damlang.'},
 {n:'Cheesecake',c:'#fdf1d0',c2:'#fff9ec',i:['Krem-pishloq','Pechenye','Tuxum','Shakar',"Sariyog'"],s:"Pechenye asosini bosing, pishloq massasini quyib, past haroratda pishiring."},
 {n:'San Sebastian cheesecake',c:'#3a2415',c2:'#8a5a3a',i:['Krem-pishloq','Tuxum','Qaymoq','Shakar','Un'],s:"Qog'ozli qolipga quying, yuqori haroratda tepasi qorayguncha, ichi yumshoq qolguncha pishiring."},
 {n:'Chak-chak',c:'#e0a84a',c2:'#f7d998',i:['Un','Tuxum','Asal',"O'simlik yog'i"],s:'Xamirni yupqa kesib qovuring, issiq asal bilan aralashtirib shakl bering.'},
 {n:'Lokma',c:'#e8b24a',c2:'#fbe3a8',i:['Un','Xamirturush','Asal',"Yog'"],s:"Xamirni yumaloqlab qizdirilgan yog'da qovuring, asal siropga botiring."},
 {n:'Tiramisu',c:'#6b4a35',c2:'#e7d4bf',i:['Mascarpone','Savoiardi pechenye','Kofe','Kakao','Tuxum'],s:'Kofega botirilgan pechenyeni krem bilan qatlamlang, ustidan kakao sepib soveting.'},
 {n:'Red Velvet',c:'#9b2242',c2:'#f3c3d0',i:['Un','Kakao',"Qizil bo'yoq",'Kefir','Krem-pishloq'],s:'Pishirilgan qizil biskvitni pishloqli krem bilan qatlamlang.'},
 {n:'Makaron',c:'#f2a6c6',c2:'#fbe0ed',i:['Bodom uni','Qand kukuni','Oqsil','Krem'],s:"Bodomli massani halqa shaklda terib pishiring, orasiga krem qo'ying."},
 {n:'Ekler',c:'#6b4228',c2:'#d9b48f',i:['Un',"Sariyog'",'Tuxum','Krem','Shokolad'],s:"Zavarnoy xamirni cho'ziq shaklda pishiring, krem bilan to'ldirib shokolad bilan bezang."},
 {n:'Baklava',c:'#d99a3e',c2:'#f5deac',i:['Yupqa xamir',"Yong'oq",'Asal',"Sariyog'"],s:"Yupqa xamir qatlamlarini yong'oq bilan qatlamlang, pishirib asal sirop quying."},
 {n:'Halva',c:'#c98a4a',c2:'#ecc994',i:['Un',"Sariyog'",'Shakar',"Yong'oq"],s:"Unni yog'da qovurib, shakar siropi bilan aralashtiring, yong'oq qo'shing."},
 {n:'Sumalak',c:'#9a7a3d',c2:'#d9c48a',i:["Bug'doy ko'kati",'Un',"Yog'"],s:"Bug'doy sharbatini un bilan qaynatib, soatlab asta-sekin pishiring."},
 {n:'Brauni',c:'#4a2e1e',c2:'#8a5a3a',i:['Shokolad',"Sariyog'",'Tuxum','Un','Shakar'],s:"Eritilgan shokolad va yog'ni tuxum-shakar bilan aralashtirib pishiring."},
 {n:'Kapkeyk',c:'#f2c6d8',c2:'#fde9f0',i:['Un','Tuxum','Shakar',"Yog'",'Krem'],s:'Xamirni qolipga quying, pishiring, ustidan krem bilan bezang.'},
 {n:'Pavlova',c:'#fdf6ea',c2:'#ffffff',i:['Oqsil','Shakar','Krem','Mevalar'],s:"Oqsilni qattiq ko'pirtirib pishiring, ustiga krem va meva qo'ying."},
 {n:'Pudding',c:'#f2e0b8',c2:'#fff6e2',i:['Sut','Shakar','Kraxmal','Vanil'],s:'Sutni shakar va kraxmal bilan qaynatib qalinlashtiring, soveting.'},
 {n:'Vafli tort',c:'#b07a3e',c2:'#e3bd8c',i:['Vafli qatlamlar','Qaymoq',"Yong'oq"],s:'Vafli qatlamlarni qaymoqli krem bilan qatlamlab, damlab qo\'ying.'},
 {n:'Churros',c:'#c9863e',c2:'#f0cd9a',i:['Un','Suv','Shakar','Dolchin'],s:"Xamirni naycha shaklda qizdirilgan yog'da qovurib, shakar-dolchinga belang."},
 {n:'Muffin',c:'#8a5a2e',c2:'#d9a868',i:['Un','Tuxum','Shakar',"Shokolad bo'lakchalari"],s:'Barcha tarkibni aralashtirib qolipda pishiring.'},
 {n:'Kesil (milliy)',c:'#e0b84a',c2:'#f7e3a0',i:['Un',"Yog'",'Shakar'],s:"Xamirni yupqa yoyib bo'lak-bo'lak kesib, yog'da qovuring."}
];

AH.SHAPES = ['Dumaloq','Kvadrat',"To'rtburchak",'Yurakcha','Olti burchak','Sakkizburchak','Gul shakli','Yulduzcha'];
AH.CAKES = {
 tort:{n:'Tort',e:'🎂',def:'#f6c6d0',shapes:AH.SHAPES,sizes:['Bento · 2 kishilik','Kichik · 4 kishilik','Klassik · 6 kishilik','Katta · 10 kishilik'],flav:['Vanil','Shokolad','Mevali','Pistasiya','Karamel','Qulupnay','Red Velvet'],steps:['Shakl','Hajm',"Ta'm",'Rang','Bezak','Yozuv',"Qo'shimcha"]},
 medovik:{n:'Medovik',e:'🍯',def:'#d9a05b',shapes:AH.SHAPES.slice(0,3),sizes:["Kichik · 4 kishilik","O'rta · 6 kishilik",'Katta · 8 kishilik'],flav:['Klassik asalli',"Yong'oqli",'Pistasiyali','Shokoladli'],steps:['Shakl','Hajm',"Ta'm",'Bezak','Yozuv',"Qo'shimcha"]},
 napoleon:{n:'Napoleon',e:'🥮',def:'#f0e2b8',shapes:AH.SHAPES.slice(0,3),sizes:["Kichik · 4 kishilik","O'rta · 6 kishilik",'Katta · 8 kishilik'],flav:['Klassik krem','Shokoladli krem','Pistasiyali krem'],steps:['Shakl','Hajm',"Ta'm",'Bezak','Yozuv',"Qo'shimcha"]},
 chakchak:{n:'Chak-chak',e:'🍥',sizes:['500 g','1 kg','1.5 kg'],flav:['Asalli','Shakar upali',"Yong'oqli",'Mevali'],steps:['Hajm',"Ta'm","Qo'shimcha"]},
 lokma:{n:'Lokma',e:'🍩',sizes:['20 dona','40 dona','60 dona'],flav:['Asal sirop','Shokolad sousi','Pudra qand'],steps:['Hajm',"Ta'm","Qo'shimcha"]}
};
AH.CAKE_COLORS = ['#ffffff','#bfe7ff','#cfe8c8','#f6c6d0','#ffe08a','#7bd0e3','#66b76b','#f59e3b','#a184c8','#d0508a','#222222'];
AH.CAKE_TOP = [['Bezaksiz',''],['Mevalar','🍓'],['Shokolad','🍫'],["Yong'oq",'🌰'],['Gullar','🌸'],['Yulduzchalar','✨'],['Rangli siniqlar','🍪']];
AH.CAKE_EXT = ['Sham',"Sovg'a qutisi",'Tabrik kartochkasi'];

AH.DAILY = [
 ['Bugun bitta yangi narsa sinang',"Yangi retsept, yangi rang yoki yangi mashq — kichik yangilik kayfiyatni ko'taradi."],
 ["5 daqiqa o'zingizga","Telefonni qo'yib, nafas oling va choy ichib o'tiring."],
 ['Uch rang qoidasi',"Xonada 3 tadan ko'p asosiy rang ishlatmang — ko'z dam oladi."],
 ['Bir stakan suv','Hozir bir stakan suv iching — energiya uchun eng oddiy qadam.'],
 ["Kimgadir iliq so'z ayting","Kichik e'tibor ikki tomonni ham xursand qiladi."]
];

AH.CHALLENGES = [
 ['💧','Bugun 8 stakan suv iching','Tanangiz sizga rahmat aytadi'],
 ['🚶‍♀️','20 daqiqa piyoda yuring',"Yengil sayr kayfiyatni ko'taradi"],
 ['🍰',"Yangi retsept tanlab ko'ring","Retseptlar bo'limidan birini sinang"],
 ['🧘‍♀️','5 daqiqa nafas mashqi qiling',"Ko'zni yumib, sekin nafas oling"],
 ['🎁',"Yaqiningizga yaxshi so'z yozing","Kichik e'tibor katta quvonch"],
 ['🛍️',"Bozordan bitta yangi narsa ko'ring","Atir testidan o'tib ko'ring"],
 ['📚',"Yangi kurs haqida o'qing","Kurslar bo'limiga kiring"]
];

AH.QUIZ = [
 {q:'Kayfiyatingiz qanday?',o:[['Tinch va iliq',0,'Sizga sokin, qulay muhit mos.',"Bugun 5–10 daqiqa o'zingizga ajrating: choy, kitob yoki sokin musiqa."],['Ijodkor',1,"Siz yangi g'oyalar va chiroyli narsalardan energiya olasiz.",'Kichik ijodiy vazifa tanlang: ranglar, kiyim kombinatsiyasi yoki yangi retsept.'],['Ishonchli va kuchli',2,"Siz aniq maqsad va natijani yaxshi ko'rasiz.","Bugun bitta muhim ishni tanlab, uni 20–30 daqiqalik kichik bosqichga bo'lib bajaring."],['Quvnoq va faol',3,'Siz harakat va muloqotdan kuch olasiz.',"10–20 daqiqa yurish, cho'zilish yoki yengil uy mashqini qo'shing."]]},
 {q:'Dam olish kuni rejangiz?',o:[['Uyda choy va kitob',0,'Siz tiklanish va sokinlikni qadrlaysiz.',"Telefonni bir muddat chetga qo'yib, kamida 20 daqiqa tinch dam oling."],["Yangi narsa o'rganish",1,'Siz rivojlanish va yangilikka qiziqasiz.',"Bitta kichik mavzuni tanlang va 15–30 daqiqa amaliy video yoki dars ko'ring."],['Mehmon kutish',2,"Siz samimiy muhit va yaqinlar bilan vaqt o'tkazishni yoqtirasiz.",'Mehmon uchun murakkab reja shart emas: bitta oson taom va iliq suhbat yetarli.'],["Do'stlar bilan sayr",3,'Siz muloqot va faol dam olishdan zavq olasiz.',"Qisqa sayrni rejalashtiring va yo'lda suv ichishni unutmang."]]},
 {q:"Qaysi ta'm yoqadi?",o:[['Asalli',0,"Siz klassik, iliq va tanish ta'mlarni yoqtirasiz.","Retsept tanlaganda sodda tarkib va me'yoriy shirinlikni afzal ko'ring."],['Kremli',1,"Siz nafis va yumshoq ta'mlarni qadrlaysiz.","Porsiyani kichikroq saqlab, shirinlikni me'yorida tanovul qiling."],["Yong'oqli",2,"Siz to'qroq va teksturali ta'mlarni yoqtirasiz.","Yong'oqni oz miqdorda ishlating va allergiya bo'lsa ehtiyot bo'ling."],['Mevali',3,"Siz yengil va yangi ta'mlarni afzal ko'rasiz.","Mavsumiy mevalarni tanlang va shirinlikka meva qo'shib, porsiyani yengillashtiring."]]}
];
AH.QUIZ_RES = [
 ['Medovik','🍯','Siz iliq va samimiysiz — medovik kabi qatlam-qatlam mehr.',"Sokin muhit va yaqinlaringiz bilan iliq vaqt sizga yaxshi mos keladi."],
 ['Napoleon','🥮',"Siz nafis va ijodkorsiz — napoleon kabi nozik va ta'sirli.","Ijodiy mashg'ulot, yangi retsept yoki dizayn g'oyasini sinab ko'ring."],
 ['Chak-chak','🍥',"Siz bag'rikeng va mehmondo'stsiz — chak-chak dasturxon bezagi.","Yaqinlar bilan vaqt o'tkazish va kichik mehmondorchilik sizga ijobiy energiya beradi."],
 ['Cheesecake','🍰','Siz yengil va zamonaviysiz — cheesecake kabi hammaga yoqasiz.',"Yangi, sodda va yengil g'oyalarni sinab ko'rish sizga mos."]
];

AH.DRESS_OCC = ['Kundalik','Ish/rasmiy','Bayram',"To'y/katta tadbir"];
AH.DRESS_LEN = ['Qisqa','Tizza osti','Uzun'];
AH.DRESS_STYLE = ['Klassik','Zamonaviy','Abaya','Milliy'];
AH.DRESS_TIPS = {
 'Klassik':{c:'#4a3b52',c2:'#ded3e6',d:"To'g'ri qirqim, neytral ranglar (qora, kulrang, bej) va sifatli mato — har qanday qomatga mos tushadi."},
 'Zamonaviy':{c:'#c9457a',c2:'#f6c9db',d:"Assimetrik qirqim yoki kamar bilan bel chizig'ini ta'kidlang, yorqin yoki bosma mato bilan jonli ko'rinish bering."},
 'Abaya':{c:'#2b2230',c2:'#c8c0cc',d:"Silliq tushadigan mato (krep, astarli shifon), minimal bezak va uzun, erkin qirqim — vazminlik va qulaylik beradi."},
 'Milliy':{c:'#b8842e',c2:'#f0d9a0',d:"An'anaviy atlas yoki adras matodan, milliy naqsh bilan, zamonaviy qirqimga moslab tikish mumkin."}
};
AH.FASHION = [
 ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80','Nafis kundalik uslub'],
 ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80',"Bayramona ko'rinish"],
 ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80','Minimalist uslub'],
 ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=80','Trenddagi kombinatsiya']
];
AH.ROOM = [
 ['Xizmat','Xona uchun rang tanlash maslahati',"Xonangiz uchun mos rang palitrasi bo'yicha konsultatsiya.",true,'<circle cx="35" cy="35" r="16" fill="#E2518A"/><circle cx="60" cy="35" r="16" fill="#8F7BF0" opacity=".85"/><circle cx="85" cy="35" r="16" fill="#FF9A6B" opacity=".85"/>'],
 ['Xizmat','Kichik makon dizayni rejasi','Tor xona yoki studiya uchun joylashuv rejasi tayyorlanadi.',true,'<rect x="14" y="16" width="38" height="38" fill="#d9c9e0"/><rect x="58" y="30" width="48" height="24" fill="#E2518A" opacity=".8"/><rect x="58" y="16" width="20" height="12" fill="#8F7BF0"/>'],
 ['Maslahat','Uch rangli qoida',"Har qanday xonada 3 tadan ortiq asosiy rang ishlatmang — ko'z chalg'imaydi.",false,'<rect x="14" y="20" width="26" height="26" fill="#E2518A"/><rect x="47" y="20" width="26" height="26" fill="#8F7BF0"/><rect x="80" y="20" width="26" height="26" fill="#FF9A6B"/>'],
 ['Maslahat',"Tabiiy yorug'lik","Mebelni yorug'lik tushadigan tomonga qarab joylashtiring, derazani to'smang.",false,'<rect x="30" y="8" width="60" height="40" rx="4" fill="#ffe08a" opacity=".5"/><path d="M60 14 L60 42 M46 28 L74 28" stroke="#e0a15c" stroke-width="3"/>'],
 ["G'oya",'Minimalizm — ko\'proq bo\'shliq','Kam narsa, lekin sifatli — xonani kengroq va tinch qiladi.',false,'<rect x="10" y="10" width="100" height="50" fill="none" stroke="#E2518A" stroke-width="3" stroke-dasharray="6 6"/><circle cx="60" cy="35" r="6" fill="#E2518A"/>'],
 ['Maslahat','Mato va rang bir-biriga mos kelsin',"Pardalar, yostiqlar va gilam uchun bir rang oilasidan 2-3 ton tanlang — xona uyg'un ko'rinadi.",false,'<rect x="40" y="18" width="40" height="34" fill="#f6c6d0"/><rect x="48" y="26" width="24" height="4" fill="#fff" opacity=".6"/>']
];

AH.SKIN_TYPE = ["Yog'li",'Quruq','Aralash','Normal'];
AH.SKIN_GOAL = ['Namlash',"Yorug'lantirish",'Aknega qarshi','Yosh belgilariga qarshi'];
AH.SKIN_TIPS = {
 "Yog'li":"Yengil, moysiz (oil-free) mahsulotlar tanlang; kuniga 2 marta yumshoq tozalash yetarli, ortiqcha ishqalash yog' ishlab chiqarishni kuchaytiradi.",
 'Quruq':"Qalinroq namlantiruvchi va moy asosidagi serumlar foydali; spirtli tonik va qattiq sovundan saqlaning.",
 'Aralash':"T-zonani (peshona, burun, iyak) yengil, yonoqlarni namlantiruvchi vosita bilan parvarish qiling.",
 'Normal':"Mavjud muvozanatni saqlash uchun oddiy 3 qadamli tartib (tozalash-namlash-SPF) yetarli."
};
AH.SKIN_GOAL_TIPS = {
 'Namlash':"Gialuron kislotali serum va kechasi qalinroq krem ishlating, kuniga yetarli suv iching.",
 "Yorug'lantirish":"Ertalab C vitaminli serum va har kuni SPF — dog'larning oldini olishning asosi.",
 'Aknega qarshi':"Yuzni qo'l bilan ushlamang, yostiq jildini tez-tez almashtiring; davomli bo'lsa dermatologga ko'rining.",
 'Yosh belgilariga qarshi':"Har kuni SPF, yetarli uyqu va namlantirish — eng samarali va xavfsiz asos."
};
AH.COSMETICS = [
 ['Kunlik parvarish seti',"Tozalovchi, tonik va namlantiruvchi — 3 qadamli oddiy to'plam."],
 ['SPF krem','Kunlik himoya uchun yengil tuzilishli quyosh kremi.'],
 ["Tabiiy lab bo'yog'i","Kunlik foydalanish uchun yengil va nam beruvchi tarkib."],
 ['Serum (vitamin C / gialuron)','Yorqinlik yoki namlik uchun konsentratsiyalangan parvarish vositasi.'],
 ["Asos bo'yoq (tonal krem)",'Turli teri tonlariga mos keluvchi qamrov.'],
 ['Atir-upa','Kundalik yoki kechki foydalanish uchun.'],
 ['Soch parvarishi seti',"Shampun, balzam va moy — soch turiga mos tanlanadi."]
];

AH.COURSE_CATS = ['Hammasi','Tillar','Kasb',"Uy-ro'zg'or",'Bolalar','Shaxsiy rivojlanish'];
/* p: platforma, u: to'g'ridan-to'g'ri o'sha platformadagi qidiruv havolasi */
AH.COURSES = [
 ['Ingliz tili','Tillar','Duolingo','https://www.duolingo.com/course/en/ru/'],
 ['Rus tili','Tillar','Coursera','https://www.coursera.org/search?query=russian%20language'],
 ['Arab tili','Tillar','Coursera','https://www.coursera.org/search?query=arabic'],
 ['Turk tili','Tillar','Duolingo','https://www.duolingo.com/course/tr/en/'],
 ['Koreys tili','Tillar','Duolingo','https://www.duolingo.com/course/ko/en/'],
 ['Nemis tili','Tillar','Duolingo','https://www.duolingo.com/course/de/en/'],
 ['Fransuz tili','Tillar','Duolingo','https://www.duolingo.com/course/fr/en/'],
 ['Xitoy tili','Tillar','Coursera','https://www.coursera.org/search?query=chinese%20language'],
 ['Grafik dizayn asoslari','Kasb','Coursera','https://www.coursera.org/search?query=graphic%20design'],
 ['Dasturlash asoslari','Kasb','freeCodeCamp','https://www.freecodecamp.org/learn'],
 ['Raqamli marketing','Kasb','Google Skillshop','https://skillshop.withgoogle.com/'],
 ['Moliyaviy savodxonlik','Kasb','Coursera','https://www.coursera.org/search?query=financial%20literacy'],
 ['Buxgalteriya asoslari','Kasb','Coursera','https://www.coursera.org/search?query=accounting%20fundamentals'],
 ['Fotografiya','Kasb','Coursera','https://www.coursera.org/search?query=photography'],
 ['Kosmetologiya asoslari','Kasb','Udemy','https://www.udemy.com/courses/search/?q=cosmetology'],
 ['Pazandachilik',"Uy-ro'zg'or",'YouTube','https://www.youtube.com/results?search_query=pazandachilik+darslari'],
 ['Tikuvchilik asoslari',"Uy-ro'zg'or",'YouTube','https://www.youtube.com/results?search_query=tikuvchilik+darslari+boshlovchilar'],
 ["Bog'dorchilik","Uy-ro'zg'or",'YouTube','https://www.youtube.com/results?search_query=bogdorchilik+maslahatlar'],
 ['Uyni tashkillashtirish',"Uy-ro'zg'or",'YouTube','https://www.youtube.com/results?search_query=uyni+tartibga+solish'],
 ['Erta rivojlantirish (0-3 yosh)','Bolalar','Coursera','https://www.coursera.org/search?query=early%20childhood%20development'],
 ['Bolalar psixologiyasi','Bolalar','Coursera','https://www.coursera.org/search?query=child%20psychology'],
 ["Uyda ta'lim asoslari",'Bolalar','Khan Academy','https://www.khanacademy.org/'],
 ['Vaqtni boshqarish','Shaxsiy rivojlanish','Coursera','https://www.coursera.org/search?query=time%20management'],
 ["Nutq so'zlash mahorati",'Shaxsiy rivojlanish','Coursera','https://www.coursera.org/search?query=public%20speaking'],
 ['Meditatsiya va stress boshqaruvi','Shaxsiy rivojlanish','Insight Timer','https://insighttimer.com/']
];

AH.GOALS = {
 'Ozish':"Kichik, barqaror o'zgarishlar eng xavfsiz yo'l: muntazam harakat (yurish, mashq), to'yimli va xilma-xil ovqatlanish, yetarli uyqu va suv. Qattiq dietadan ko'ra, dietolog bilan shaxsiy reja tuzish xavfsizroq.",
 'Vazn olish':"Sog'lom vazn olish uchun oqsil va foydali yog'larga boy ovqatlanish, kuch mashqlari va muntazam ovqatlanish tartibi tavsiya etiladi. Shaxsiy reja uchun dietolog yoki shifokor bilan maslahatlashing.",
 'Shaklda saqlash':"Haftada 3-4 marta aralash mashqlar (kardio + kuch + cho'zilish), muvozanatli ovqatlanish va yetarli dam olish — barqaror natija uchun yetarli."
};

AH.HEALTH = [
 ["Hayz davri og'rig'i","Issiq grelka, yengil harakat va dam olish ko'pincha yengillik beradi. Og'riq kuchli yoki hayotni qiyinlashtirsa, bu normal emas — ginekologga ko'rining."],
 ["Doimiy charchoq, rangi oqarish","Temir yetishmovchiligi (anemiya) belgisi bo'lishi mumkin. Go'sht, dukkakli va yashil sabzavotlar foydali, lekin aniqlash uchun qon tahlili kerak."],
 ["Siydik yo'li infeksiyasi belgilari","Ko'proq suv ichish va gigiyena foydali. Achishish yoki tez-tez siyish bo'lsa, shifokorga murojaat qiling — o'zi o'tib ketishini kutmang."],
 ['Homiladorlikni rejalashtirish',"Rejalashtirishdan oldin shifokor bilan umumiy tekshiruvdan o'tish va folat kislotasi haqida maslahatlashish tavsiya etiladi."],
 ['Menopauza davri',"Issiqlik to'lqinlari, uyqu buzilishi tabiiy, lekin kuchli bo'lsa ginekolog-endokrinolog kuzatuvi foydali."],
 ['Qalqonsimon bez belgilari',"Sababsiz charchoq, vazn o'zgarishi yoki soch to'kilishi qalqonsimon bez bilan bog'liq bo'lishi mumkin — tahlil aniqlik beradi."],
 ["Ko'krak sog'lig'i","Oyiga bir marta o'z-o'zini tekshirish odatini shakllantiring va yillik ko'rikni o'tkazib yubormang — erta aniqlash hal qiluvchi ahamiyatga ega."],
 ["Suyak sog'lig'i","Kaltsiy va D vitaminga boy ovqatlanish hamda quyoshda bo'lish suyaklarni mustahkamlaydi."],
 ["Yillik profilaktik ko'rik","Ginekolog va terapevtga muntazam tashrif muammolarni erta aniqlashga yordam beradi."],
 ['Uyqu va suv rejimi',"Kuniga 7-8 soat uyqu va yetarli suv ichish umumiy sog'liq uchun asosdir."]
];

/* Har bo'lim uchun bitta video blok (takrorlanmaydi) */
AH.VIDEOS = {
 sweets:['🍰','VIDEO',"Retseptni videoda ko'ring","Oson desert, tort va uy taomlari bo'yicha videolar.",'https://www.youtube.com/results?search_query=uzbekcha+oson+retsept+tort+desert'],
 design:['👗','VIDEO',"Kiyim va dizayn darslari","Kiyim kombinatsiyasi, tikuvchilik va xona dizayni.",'https://www.youtube.com/results?search_query=ayollar+kiyim+kombinatsiyasi+tikuvchilik'],
 cosmetics:['🧴','SPF',"SPF ishlatishdagi 5 asosiy xato","Teri parvarishi bo'yicha qisqa video.",'https://www.youtube.com/watch?v=N7auLO78qHw'],
 courses:['🎓','VIDEO',"O'qish va rivojlanish","Kurs tanlashdan oldin mavzuni bepul videolar orqali sinab ko'ring.",'https://www.youtube.com/results?search_query=online+kurs+self+development'],
 psych:['💗','VIDEO',"Nafas mashqi va stressni boshqarish","Mindfulness va tinchlanish bo'yicha amaliy videolar.",'https://www.youtube.com/results?search_query=stressni+kamaytirish+nafas+mashqi'],
 fitness:['🏃‍♀️','7 DAQIQA',"Uyda boshlang'ich full-body mashq","Jihozsiz 7 daqiqalik mashq.",'https://www.youtube.com/watch?v=5BwlDW0CAuU'],
 health:['🩷','SALOMATLIK','Ayollar salomatligi haqida video',"Ginekolog bilan suhbat. Tashxis o'rnini bosmaydi.",'https://www.youtube.com/watch?v=zZkvQQlzAmo']
};

AH.MARKET_CATS = {atir:['🌸','Atir'],uy:['🏠',"Uy-ro'zg'or"],tozalash:['🧼','Tozalash'],sovga:['🎁',"Sovg'a"],bijuteriya:['💎','Bijuteriya'],shirinlik:['🍰','Shirinlik'],aksessuar:['⌚','Aksessuarlar'],kiyim:['👗','Kiyim'],kosmetika:['💄','Kosmetika']};
AH.ORDER_ST = {yangi:'Yangi',tayyor:'Tayyorlanmoqda',yetdi:'Yetkazildi',bekor:'Bekor qilindi'};
AH.REGIONS = ['Toshkent shahri','Toshkent viloyati','Samarqand','Buxoro',"Farg'ona",'Andijon','Namangan','Qashqadaryo','Surxondaryo','Xorazm','Navoiy','Jizzax','Sirdaryo',"Qoraqalpog'iston"];
AH.ANON = ['Bir ayol','Bahorgul','Kumush','Sevinch','Munisa','Gulnoza','Nilufar','Dilnoza'];
AH.PERFUME = {floral:['Gulli va musk notali atir','Nafis va yumshoq hid'],fresh:['Sitrusli yoki yashil notali atir','Toza va tetik hid'],sweet:['Vanil yoki mevali notali atir','Iliq va shirin hid'],woody:['Sandal yoki amber notali atir','Iliq va chuqur hid']};
