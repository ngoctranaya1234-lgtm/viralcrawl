'use strict';
const CACHE_NAME='2techmn-public-v5';
const ASSETS=[
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/bootstrap.mjs',
  './js/api-client.mjs',
  './js/app-state.mjs',
  './js/dom.mjs',
  './js/router.mjs',
  './js/checkout-themes.mjs',
  './js/pages/dashboard.mjs',
  './js/pages/download-link.mjs',
  './js/pages/downloaded.mjs',
  './js/pages/history.mjs',
  './js/pages/pricing.mjs',
  './js/pages/settings.mjs',
  './js/pages/support.mjs',
  './js/pages/unavailable.mjs',
  './assets/logo.svg'
];
const assetPaths=new Set(ASSETS.map(p=>new URL(p,self.registration.scope).pathname));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('mnhut-')||k.startsWith('viralcrawl-')||k.startsWith('2techmn-public-'))&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/')||url.pathname.includes('/admin/'))return;
 if(!assetPaths.has(url.pathname)&&e.request.mode!=='navigate')return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&assetPaths.has(url.pathname)){const copy=r.clone();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)));}return r;}).catch(async()=>await caches.match(e.request)||(e.request.mode==='navigate'?caches.match(new URL('./index.html',self.registration.scope).href):Response.error())));
});
