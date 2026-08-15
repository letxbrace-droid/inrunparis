import { useEffect, useRef } from 'react'

/**
 * Keep the screen awake while `active` is true.
 *
 * Used while the client is waiting on their driver — the phone sitting on a
 * lap shouldn't black out on the one screen they're actually watching.
 *
 * The browser drops the lock whenever the page is hidden (tab switch, screen
 * off), so it is re-acquired on visibilitychange. Apple fixed Wake Lock inside
 * installed PWAs in iOS 18.4; everywhere else this is a silent no-op.
 */
export default function useWakeLock(active) {
  const lockRef = useRef(null)

  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let cancelled = false

    const acquire = async () => {
      if (lockRef.current || document.visibilityState !== 'visible') return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) { lock.release().catch(() => {}); return }
        lockRef.current = lock
        lock.addEventListener('release', () => { lockRef.current = null })
      } catch {
        /* denied, low battery, or unsupported — degrade silently */
      }
    }

    const onVisibility = () => { if (document.visibilityState === 'visible') acquire() }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      lockRef.current?.release().catch(() => {})
      lockRef.current = null
    }
  }, [active])
}
