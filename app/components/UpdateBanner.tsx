'use client'

import { useServiceWorker } from '@/hooks/useServiceWorker'

export default function UpdateBanner() {
  const { needsUpdate, updateApp } = useServiceWorker()

  if (!needsUpdate) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50"
      role="alert"
      aria-live="polite"
    >
      <div
        className="bg-amber-700 border-4 border-amber-500 rounded-none p-4 max-w-md mx-auto animate-slide-in"
        style={{ boxShadow: '0 8px 32px rgba(217, 119, 6, 0.6)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">⚡</span>
            <div>
              <div className="text-white font-bold tracking-wide text-base sm:text-lg">
                NOWA WERSJA
              </div>
              <div className="text-amber-100 text-xs sm:text-sm">
                Odśwież aby zobaczyć zmiany
              </div>
            </div>
          </div>

          <button
            onClick={updateApp}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-white hover:bg-amber-50 active:bg-amber-100 text-amber-900 font-bold text-sm sm:text-base border-2 border-amber-900 transition-all whitespace-nowrap"
            aria-label="Odśwież aplikację do nowej wersji"
          >
            ODŚWIEŻ
          </button>
        </div>
      </div>
    </div>
  )
}
