import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { initRemotePromoCodes } from './store/useBookingStore'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/inrunparis/sw.js')
      .catch(() => {})
  })
}

// Fetch remote promo codes before first render so they're available immediately
initRemotePromoCodes().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
