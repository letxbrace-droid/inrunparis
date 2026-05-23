let cfg = { vapidPublicKey: '', gistId: '', gistToken: '' }

export async function initPushConfig() {
  try {
    const res = await fetch('/inrunparis/push-config.json', { cache: 'no-store' })
    if (res.ok) cfg = await res.json()
  } catch {}
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Called on app start — re-registers existing subscription with Gist if permission is already granted
export async function autoResubscribe() {
  if (!isPushSupported() || Notification.permission !== 'granted' || !cfg.vapidPublicKey) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      saveSubscriptionToGist(sub.toJSON()).catch(() => {})
    } else {
      await subscribeToVapid()
    }
  } catch {}
}

export async function subscribeToVapid() {
  if (!isPushSupported() || !cfg.vapidPublicKey) return null
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.vapidPublicKey),
    })
    saveSubscriptionToGist(sub.toJSON()).catch(() => {})
    return sub
  } catch (e) {
    console.warn('[VAPID] subscribe error', e)
    return null
  }
}

async function saveSubscriptionToGist(subJSON) {
  if (!cfg.gistId || !cfg.gistToken) return
  const headers = {
    'Authorization': `Bearer ${cfg.gistToken}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }
  const readRes = await fetch(`https://api.github.com/gists/${cfg.gistId}`, { headers })
  if (!readRes.ok) return
  const gist = await readRes.json()
  const content = gist.files?.['subscriptions.json']?.content || '[]'
  let subs = []
  try { subs = JSON.parse(content) } catch {}
  if (subs.some(s => s.endpoint === subJSON.endpoint)) return
  subs.push(subJSON)
  await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ files: { 'subscriptions.json': { content: JSON.stringify(subs) } } }),
  })
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
