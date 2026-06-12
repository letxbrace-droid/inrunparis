const DEFAULT_WORKER_URL = 'https://inrun-hub.letxbrace.workers.dev'

let cfg = { vapidPublicKey: '', workerUrl: DEFAULT_WORKER_URL }

export async function initPushConfig() {
  try {
    const res = await fetch('/inrunparis/push-config.json', { cache: 'no-store' })
    if (res.ok) cfg = { workerUrl: DEFAULT_WORKER_URL, ...(await res.json()) }
  } catch {}
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Called on app start — recreates subscription if permission already granted
export async function autoResubscribe() {
  if (!isPushSupported() || Notification.permission !== 'granted' || !cfg.vapidPublicKey) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) await subscribeToVapid()
  } catch {}
}

export async function subscribeToVapid() {
  if (!isPushSupported() || !cfg.vapidPublicKey) return null
  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) return existing
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.vapidPublicKey),
    })
  } catch (e) {
    console.warn('[VAPID] subscribe error', e)
    return null
  }
}

// Auto-register the subscription with the hub Worker — no manual step needed.
// Returns true on success; caller falls back to the WhatsApp flow on failure.
export async function registerWithWorker(sub, name = null) {
  if (!cfg.workerUrl) return false
  try {
    const res = await fetch(`${cfg.workerUrl}/subscribe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, sub: sub.toJSON ? sub.toJSON() : sub }),
    })
    return res.ok
  } catch {
    return false
  }
}

// Encode subscription as base64 for sharing via WhatsApp
export function encodeSubscription(sub) {
  return btoa(JSON.stringify(sub.toJSON ? sub.toJSON() : sub))
}

export function getWhatsAppShareUrl(sub, driverPhone) {
  const encoded = encodeSubscription(sub)
  const msg = encodeURIComponent(`NOTIF:${encoded}`)
  return `https://wa.me/${driverPhone}?text=${msg}`
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
