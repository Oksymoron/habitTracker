'use client'

import { useEffect, useState } from 'react'

interface UseServiceWorkerReturn {
  needsUpdate: boolean
  updateApp: () => void
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    let refreshing = false

    // Rejestracja SW
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration)

        // KROK 1: Sprawdź czy już jest waiting worker przy loadzie
        if (registration.waiting) {
          console.log('[PWA] Worker already waiting')
          setWaitingWorker(registration.waiting)
          setNeedsUpdate(true)
        }

        // KROK 2: Nasłuchuj na nową instalację
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('[PWA] Update found, installing...')

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('[PWA] New worker state:', newWorker.state)

              // Gdy nowy SW jest installed i czeka na aktywację
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('[PWA] New worker installed, waiting to activate')
                setWaitingWorker(newWorker)
                setNeedsUpdate(true)
              }
            })
          }
        })

        // KROK 3: Wymuszaj sprawdzanie aktualizacji co 60s
        const interval = setInterval(() => {
          console.log('[PWA] Checking for updates...')
          registration.update()
        }, 60000)

        return () => clearInterval(interval)
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
      })

    // KROK 4: Nasłuchuj na zmianę kontrolera (= nowy SW przejął kontrolę)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return

      console.log('[PWA] Controller changed, reloading page...')
      refreshing = true
      window.location.reload()
    })

    // KROK 5: Nasłuchuj na wiadomości od SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        console.log('[PWA] Received SW_ACTIVATED message')
        setNeedsUpdate(true)
      }
    })
  }, [])

  // Funkcja do aktywacji nowego SW
  const updateApp = () => {
    console.log('[PWA] User clicked update button')

    if (waitingWorker) {
      // Wyślij SKIP_WAITING do czekającego SW
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      setNeedsUpdate(false)
    } else {
      // Fallback - po prostu przeładuj
      console.log('[PWA] No waiting worker, forcing reload')
      window.location.reload()
    }
  }

  return { needsUpdate, updateApp }
}
