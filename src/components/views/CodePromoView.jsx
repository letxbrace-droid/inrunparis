import { useState } from 'react'
import useBookingStore, { PROMO_CODES } from '../../store/useBookingStore'

export default function CodePromoView({ open, onClose }) {
  const promo    = useBookingStore((s) => s.promo)
  const setPromo = useBookingStore((s) => s.setPromo)

  const [input,  setInput]  = useState('')
  const [status, setStatus] = useState(null) // 'ok' | 'error'

  const handleApply = () => {
    const code = input.trim().toUpperCase()
    if (!code) return
    const found = PROMO_CODES[code]
    if (found) {
      setPromo({ code, ...found })
      setStatus('ok')
    } else {
      setStatus('error')
    }
  }

  const handleRemove = () => {
    setPromo(null)
    setInput('')
    setStatus(null)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Code promo"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:    '#001621',
        transform:     open ? 'translateX(0)' : 'translateX(100%)',
        visibility:    open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition:    open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .28s cubic-bezier(.55,0,.1,1), visibility 0s linear .28s',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 flex-shrink-0"
        style={{ paddingTop: 'calc(var(--safe-top) + 18px)', paddingBottom: 16 }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: 'rgba(245,241,232,.07)', border: '1px solid rgba(245,241,232,.12)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Code promo</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>Entrez votre code pour réduire votre tarif</p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-6" style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}>

        {/* Active promo banner */}
        {promo && (
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-4 mb-6"
            style={{
              background: 'rgba(52,211,153,.08)',
              border: '1px solid rgba(52,211,153,.25)',
            }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: '#34d399' }}>{promo.code}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(52,211,153,.7)' }}>{promo.label}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-xs underline cursor-pointer"
              style={{ color: 'rgba(52,211,153,.6)' }}
            >
              Retirer
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setStatus(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
            placeholder="CODE PROMO"
            maxLength={20}
            className="flex-1 px-4 py-4 rounded-2xl text-sm font-mono font-bold tracking-widest outline-none transition-colors duration-200"
            style={{
              background:   'rgba(245,241,232,.05)',
              border:       `1px solid ${status === 'error' ? 'rgba(248,113,113,.5)' : status === 'ok' ? 'rgba(52,211,153,.4)' : 'rgba(245,241,232,.12)'}`,
              color:        '#F5F1E8',
            }}
            aria-label="Code promotionnel"
          />
          <button
            onClick={handleApply}
            disabled={!input.trim()}
            className="px-5 py-4 rounded-2xl text-sm font-semibold cursor-pointer disabled:opacity-40 active:scale-95 transition-all duration-200"
            style={{
              background: '#ff4103',
              color: '#F5F1E8',
              boxShadow: input.trim() ? '0 0 20px rgba(255,65,3,.35)' : 'none',
            }}
          >
            Appliquer
          </button>
        </div>

        {status === 'error' && (
          <p className="text-xs px-1" style={{ color: 'rgba(248,113,113,.8)' }}>
            Code invalide. Vérifiez l'orthographe ou contactez-nous.
          </p>
        )}
        {status === 'ok' && (
          <p className="text-xs px-1" style={{ color: 'rgba(52,211,153,.8)' }}>
            Code appliqué ! La réduction sera visible à l'étape Tarif.
          </p>
        )}

        {/* Hint */}
        <div
          className="mt-8 rounded-2xl px-4 py-4"
          style={{
            background: 'rgba(245,241,232,.03)',
            border: '1px solid rgba(245,241,232,.08)',
          }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(245,241,232,.5)' }}>
            Comment obtenir un code ?
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Fidélité : après votre 5ème course",
              "Parrainage : partagez l'app avec un ami",
              "Newsletter I&N RUN",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span style={{ color: '#ff4103', flexShrink: 0, marginTop: 2 }}>·</span>
                <span className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
