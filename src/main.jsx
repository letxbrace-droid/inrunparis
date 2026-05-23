import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { initRemotePromoCodes } from './store/useBookingStore'
import { initPushConfig, initOneSignal } from './utils/pushNotifications'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/inrunparis/sw.js').catch(() => {})
  })
}

Promise.all([
  initRemotePromoCodes(),
  initPushConfig().then(initOneSignal),
]).finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
