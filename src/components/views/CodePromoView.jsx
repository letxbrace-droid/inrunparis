import { useState } from 'react'
import useBookingStore, { getPromoCodes } from '../../store/useBookingStore'

export default function CodePromoView({ open, onClose }) {
  const promo    = useBookingStore((s) => s.promo)
  const setPromo = useBookingStore((s) => s.setPromo)

  const [input,  setInput]  = useState('')
  const [status, setStatus] = useState(null)

  const handleApply = () => {
    const code = input.trim().toUpperCase()
    if (!code) return
    const codes = getPromoCodes()
    const found = codes[code]
    if (found) { setPromo({ code, ...found }); setStatus('ok') }
    else        { setStatus('error') }
  }

  const handleRemove = () => { setPromo(null); setInput(''); setStatus(null) }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Code promo"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:    '#050505',
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
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{
          paddingTop: 'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background: '#0D0D0D',
          
          
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <button onClick={onClose} aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Code promo</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>Réduisez votre tarif</p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 px-5 pt-6 overflow-y-auto scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >

        {/* Active promo */}
        {promo && (
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-4 mb-6"
            style={{
              background: '#111111',
              borderRadius: 16,
              border: '1px solid rgba(52,211,153,.3)',
              animation: 'scale-in .3s ease both',
            }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: '#34d399' }}>{promo.code}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(52,211,153,.65)' }}>{promo.label}</p>
            </div>
            <button onClick={handleRemove} className="text-xs underline cursor-pointer" style={{ color: 'rgba(52,211,153,.55)' }}>
              Retirer
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="flex gap-3 mb-3" style={{ animation: 'fade-up .38s ease both 40ms' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setStatus(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
            placeholder="CODE PROMO"
            maxLength={20}
            className="flex-1 px-4 py-4 rounded-2xl text-sm font-mono font-bold tracking-widest outline-none transition-all duration-200"
            style={{
              background: '#161616',
              border: `1px solid ${status === 'error' ? 'rgba(248,113,113,.5)' : status === 'ok' ? 'rgba(52,211,153,.4)' : 'rgba(255,255,255,.05)'}`,
              color: '#F5F1E8',
            }}
            aria-label="Code promotionnel"
          />
          <button
            onClick={handleApply}
            disabled={!input.trim()}
            className="cta-glow px-5 py-4 rounded-2xl text-sm font-bold text-white cursor-pointer disabled:opacity-40 active:scale-95 transition-transform overflow-hidden relative"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)' }} />
            Appliquer
          </button>
        </div>

        {status === 'error' && (
          <p className="text-xs px-1 mb-2" style={{ color: 'rgba(248,113,113,.8)', animation: 'fade-in .2s ease' }}>
            Code invalide. Vérifiez l'orthographe ou contactez-nous.
          </p>
        )}
        {status === 'ok' && (
          <p className="text-xs px-1 mb-2" style={{ color: 'rgba(52,211,153,.8)', animation: 'fade-in .2s ease' }}>
            Code appliqué — la réduction sera visible à l'étape Tarif.
          </p>
        )}

        {/* Hint card */}
        <div
          className="rounded-2xl px-4 py-4 mt-6"
          style={{
            background: '#111111',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.05)',
            animation: 'fade-up .38s ease both 80ms',
          }}
        >
          <p className="mb-3" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(245,241,232,.4)' }}>
            Comment obtenir un code ?
          </p>
          {[
            "Fidélité : après votre 5ème course",
            "Parrainage : partagez l'app avec un ami",
            "Newsletter I&N RUN",
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 mb-2">
              <span style={{ color: 'rgba(245,241,232,.34)', flexShrink: 0, marginTop: 2 }}>·</span>
              <span className="text-xs" style={{ color: 'rgba(245,241,232,.45)', lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
