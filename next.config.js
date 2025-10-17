const withPWA = require('next-pwa')({
  dest: 'public',
  // Disable PWA in development (speeds up dev server)
  disable: process.env.NODE_ENV === 'development',
  // Register service worker immediately (skipWaiting + clientsClaim)
  register: true,
  skipWaiting: true,
  // Custom service worker for advanced caching
  sw: 'sw.js',
  // Ensure service worker updates properly
  reloadOnOnline: true,
  // Don't precache everything (for better update control)
  dynamicStartUrl: true,
  // Workbox options for custom caching strategies
  runtimeCaching: [
    {
      // HTML pages - NetworkFirst (always try network first for updates)
      urlPattern: /^https?.*/,
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
      // API routes - StaleWhileRevalidate (use cache but update in background)
      urlPattern: /^https?.*\/api\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-only headers for proper caching
  async headers() {
    return [
      {
        // HTML pages - no caching (always check for updates)
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '.*text/html.*'
          }
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      },
      {
        // Static assets with hash - cache forever
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Service worker - never cache (must always be fresh)
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  }
}

module.exports = withPWA(nextConfig)
