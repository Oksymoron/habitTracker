const withPWA = require('next-pwa')({
  dest: 'public',
  // Disable PWA in development (speeds up dev server)
  disable: process.env.NODE_ENV === 'development',
  // Register service worker immediately (skipWaiting + clientsClaim)
  register: true,
  skipWaiting: true,
  // CRITICAL for iOS: new SW takes control immediately
  // Note: next-pwa doesn't have clientsClaim option, we handle it in sw.js
  // Custom service worker for advanced caching
  sw: 'sw.js',
  // Ensure service worker updates properly
  reloadOnOnline: true,
  // Don't precache everything (for better update control)
  dynamicStartUrl: true,
  // IMPORTANT: Clean up old caches automatically
  cleanupOutdatedCaches: true,
  // Fix for Next.js 15: Exclude build manifests from precaching
  buildExcludes: [/app-build-manifest\.json$/, /middleware-manifest\.json$/],
  // Workbox options for custom caching strategies
  runtimeCaching: [
    {
      // HTML pages - NetworkFirst (always try network first for updates)
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      // Next.js static assets - CacheFirst (immutable with hash)
      urlPattern: /^\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year (these have hash in URL)
        }
      }
    },
    {
      // Images with hash - CacheFirst
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      // API routes - NetworkFirst (try network first, fallback to cache)
      urlPattern: /^https?.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 5
      }
    },
    {
      // Convex API - StaleWhileRevalidate (fast response + background update)
      urlPattern: /^https?.*convex.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'convex-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // AGGRESSIVE CACHE HEADERS - Force fresh content always
  async headers() {
    return [
      {
        // HTML + ALL PAGES - ZERO CACHE (always fetch from server)
        // Excludes: _next/static, favicon, robots, sitemap
        source: '/:path((?!_next/static/|_next/image/|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store'
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store'
          }
          // REMOVED: Clear-Site-Data causes CSS to fail loading (MIME type issue)
          // Alternative: Users manually unregister SW or it updates via skipWaiting
        ]
      },
      {
        // Static assets with fingerprint - cache forever (immutable)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Service Worker - NEVER CACHE (critical)
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store'
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        // Workbox generated files - never cache
        source: '/workbox-:hash.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          }
        ]
      },
      {
        // Version.json - always fresh (for auto-reload check)
        source: '/version.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store'
          }
        ]
      }
    ]
  }
}

module.exports = withPWA(nextConfig)
