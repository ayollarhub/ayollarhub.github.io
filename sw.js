/* Ayollar Hub service worker — oflayn qobiq. Har yangilanishda VERSION ni oshiring. */
const VERSION = 'ah-v1.0.2';
const SHELL = ['./','index.html','css/style.css','js/supabase.js','js/config.js','js/i18n.js','js/content.js','js/core.js','js/app.js','manifest.webmanifest','img/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Supabase so'rovlari keshlanmaydi
  // Avval tarmoq (yangi versiya darhol chiqadi), internet bo'lmasa — kesh
  e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
