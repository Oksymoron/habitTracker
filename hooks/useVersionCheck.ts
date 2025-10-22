'use client'

import { useEffect, useRef } from 'react'

interface VersionInfo {
  version: string
  buildTime: string
  commit: string
  deploymentId: string
}

/**
 * Periodically checks /version.json for new deployments
 * Auto-reloads when version changes
 */
export function useVersionCheck(intervalMs: number = 60000) {
  const currentVersionRef = useRef<string | null>(null)
  const isCheckingRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkVersion = async () => {
      // Prevent concurrent checks
      if (isCheckingRef.current) return
      isCheckingRef.current = true

      try {
        const res = await fetch('/version.json', {
          cache: 'no-store', // CRITICAL: always fetch fresh
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (!res.ok) {
          console.warn('[Version] Failed to fetch version.json:', res.status)
          return
        }

        const data: VersionInfo = await res.json()

        // First check - just store current version
        if (currentVersionRef.current === null) {
          currentVersionRef.current = data.deploymentId
          console.log('[Version] Initial version:', data.deploymentId, 'commit:', data.commit)
          return
        }

        // Compare deployment ID (most reliable)
        if (currentVersionRef.current !== data.deploymentId) {
          console.log('[Version] 🚀 NEW VERSION DETECTED!')
          console.log('[Version] Old:', currentVersionRef.current)
          console.log('[Version] New:', data.deploymentId)
          console.log('[Version] Commit:', data.commit)
          console.log('[Version] Reloading in 2 seconds...')

          // Small delay to show console message
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          console.log('[Version] ✓ Up to date:', data.deploymentId)
        }
      } catch (error) {
        console.error('[Version] Check failed:', error)
      } finally {
        isCheckingRef.current = false
      }
    }

    // Check immediately on mount
    checkVersion()

    // Then check periodically
    const interval = setInterval(checkVersion, intervalMs)

    // Cleanup
    return () => clearInterval(interval)
  }, [intervalMs])
}
