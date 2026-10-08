import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { initRemotePromoCodes } from './store/useBookingStore'
import { initPushConfig, autoResubscribe } from './utils/pushNotifications'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/inrunparis/sw.js').catch(() => {})
  })
}

Promise.all([
  initRemotePromoCodes(),
  initPushConfig().then(autoResubscribe),
]).finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
})
