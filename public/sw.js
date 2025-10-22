// Custom Service Worker with immediate activation
// This file is processed by next-pwa during build

// CRITICAL: Immediate activation strategy
// This ensures new SW activates without waiting for old tabs to close

// STEP 1: Skip waiting on install
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...')
  // Activate immediately, don't wait for old SW to finish
  self.skipWaiting()
})

// STEP 2: Take control immediately on activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...')

  event.waitUntil(
    (async () => {
      // Take control of all clients immediately
      // This includes already-open tabs/windows
      await self.clients.claim()

      // AGGRESSIVE: Delete ALL caches on activate (nuclear option for migration)
      // This ensures old cache doesn't interfere with new SW
      const cacheNames = await caches.keys()
      console.log('[SW] Found', cacheNames.length, 'caches to delete')

      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('[SW] Deleting cache:', cacheName)
          return caches.delete(cacheName)
        })
      )

      console.log('[SW] All old caches deleted')

      // Notify all clients that new SW is active
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach(client => {
        console.log('[SW] Notifying client about activation:', client.id)
        client.postMessage({
          type: 'SW_ACTIVATED',
          message: 'New service worker activated successfully'
        })
      })

      console.log('[SW] Activation complete, claimed', clients.length, 'clients')
    })()
  )
})

// STEP 3: Listen for SKIP_WAITING message from client
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data)

  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING command, activating immediately...')
    self.skipWaiting()
  }
})

// STEP 4: Handle fetch events (will be enhanced by next-pwa)
self.addEventListener('fetch', (event) => {
  // next-pwa will inject Workbox strategies here during build
  // This is just a fallback for any requests not handled by Workbox

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // For now, just let the browser handle it
  // Workbox strategies from next.config.js will override this
})

console.log('[SW] Service Worker script loaded, waiting for next-pwa injection...')

// NOTE: next-pwa will inject Workbox code below this line during build
// Including precaching manifest and runtime caching strategies
