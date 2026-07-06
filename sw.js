// ★ デプロイするたびにこのバージョンを変える（ビルド時刻と合わせる）
const VERSION = '2026.07.07-08:52';
const CACHE_NAME = 'bujo-' + VERSION;

// キャッシュするファイル
const ASSETS = [
  './',
  './bujo.html',
];

// インストール時：新しいキャッシュを作る
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // 即座にアクティブ化（待機しない）
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// フェッチ時：ネットワーク優先、失敗時はキャッシュ
self.addEventListener('fetch', e => {
  // GASへのリクエストはキャッシュしない
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功したらキャッシュを更新
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
