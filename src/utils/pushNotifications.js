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

  window.OneSignalDeferred = window.OneSignalDeferred || []

  await new Promise(resolve => {
    const s = document.createElement('script')
    s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    s.async = true
    s.onload = resolve
    s.onerror = resolve
    document.head.appendChild(s)
  })

  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/inrunparis/sw.js',
        serviceWorkerParam: { scope: '/inrunparis/' },
        notifyButton: { enable: false },
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
