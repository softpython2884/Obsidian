// Service Worker minimal pour Discord Clone PWA
const CACHE_NAME = 'discord-clone-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-512.png',
  // Ajouter les assets statiques ici
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Erreur d\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation terminée');
        return self.clients.claim();
      })
  );
});

// Stratégie de cache: Cache First pour les assets statiques
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes API (commencent par /api)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si trouvé dans le cache, le retourner
        if (response) {
          console.log('Service Worker: Servi depuis le cache:', event.request.url);
          return response;
        }

        // Sinon, faire la requête réseau
        console.log('Service Worker: Requête réseau:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();

            // Mettre en cache pour les prochaines fois
            if (shouldCache(event.request)) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('Service Worker: Mise en cache:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Erreur de fetch:', error);
            
            // Pour les pages HTML, retourner une page offline simple
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Fonction pour déterminer si on doit mettre en cache
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Mettre en cache les assets statiques
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    return true;
  }
  
  // Mettre en cache les fichiers locaux
  if (url.origin === self.location.origin) {
    return true;
  }
  
  return false;
}

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gérer les notifications push (si activé plus tard)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push reçu:', event);
  
  // Pour l'instant, on ignore les push
  // Plus tard: gérer les notifications push ici
});

// Gérer les clics sur notifications (si activé plus tard)
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification cliquée:', event);
  
  // Pour l'instant, on ignore
  // Plus tard: gérer les clics sur notifications ici
});

console.log('Service Worker: Chargé');
