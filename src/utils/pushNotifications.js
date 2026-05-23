let cfg = { appId: '' }

export async function initPushConfig() {
  try {
    const res = await fetch('/inrunparis/push-config.json', { cache: 'no-store' })
    if (res.ok) cfg = await res.json()
  } catch {}
}

export function getPushAppId() {
  return cfg?.appId || ''
}

export async function initOneSignal() {
  const appId = getPushAppId()
  if (!appId) return

  // SDK is loaded via <script defer> in index.html — just queue the init
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId,
        safari_web_id: 'web.onesignal.auto.0534d2b4-18a9-4e11-8788-4e680cd265b6',
        serviceWorkerPath: '/inrunparis/sw.js',
        serviceWorkerParam: { scope: '/inrunparis/' },
        notifyButton: { enable: true },
        allowLocalhostAsSecureOrigin: true,
      })
    } catch {}
  })
}

export async function requestPushPermission() {
  try {
    if (window.OneSignal?.Notifications) {
      await window.OneSignal.Notifications.requestPermission()
      return window.OneSignal.Notifications.permission === true
    }
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      return perm === 'granted'
    }
  } catch {}
  return false
}

export function isPushPermissionGranted() {
  if (window.OneSignal?.Notifications?.permission) return true
  if ('Notification' in window) return Notification.permission === 'granted'
  return false
}
