/* 정청비 투게더: 항상 최신 버전을 먼저 받고(네트워크 우선), 인터넷이 끊겼을 때만 저장본 사용 */
const CACHE = 'jcb-together-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icons/icon2-192.png', './icons/icon2-512.png', './icons/apple-touch-icon2.png', './icons/favicon2.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('jcb-together-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
