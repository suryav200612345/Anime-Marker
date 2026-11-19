/* OtakuLog PWA service worker.
 * Handles Android Web Share Target POSTs locally and stores only file metadata,
 * never the shared video bytes.
 */
const CACHE_NAME = 'otakulog-shell-v3';
const SHARE_DB_NAME = 'otakulog-share-v1';
const SHARE_STORE_NAME = 'incoming';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
const SHARE_PATH = new URL('share-target', self.registration.scope).pathname;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.addAll(APP_SHELL); } catch (error) { /* Hosting may be updating; network fallback remains available. */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('otakulog-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function openShareDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SHARE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SHARE_STORE_NAME)) db.createObjectStore(SHARE_STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSharedFileMetadata(request) {
  const formData = await request.formData();
  const sharedFiles = formData.getAll('files').filter(item => item && typeof item === 'object' && 'name' in item);
  if (!sharedFiles.length) throw new Error('No video file was included in the share.');

  const db = await openShareDb();
  try {
    const tx = db.transaction(SHARE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(SHARE_STORE_NAME);
    sharedFiles.slice(0, 5).forEach((file, index) => {
      store.put({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        name: String(file.name || 'Shared video').slice(0, 240),
        type: String(file.type || 'video/*').slice(0, 100),
        size: Number(file.size) || 0,
        receivedAt: Date.now()
      });
    });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Share metadata could not be saved.'));
    });
  } finally {
    db.close();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method === 'POST' && url.origin === self.location.origin && url.pathname === SHARE_PATH) {
    event.respondWith((async () => {
      try {
        await saveSharedFileMetadata(request);
        return Response.redirect(new URL('./?shared=1', self.registration.scope).toString(), 303);
      } catch (error) {
        return new Response('OtakuLog could not receive this file. Open the app and use Import downloaded video instead.', {
          status: 400,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  if (request.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      if (request.mode === 'navigate') {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) cache.put('./index.html', fresh.clone());
          return fresh;
        } catch (error) {
          return (await cache.match(request)) || (await cache.match('./index.html')) || Response.error();
        }
      }
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch (error) {
        return Response.error();
      }
    })());
  }
});
