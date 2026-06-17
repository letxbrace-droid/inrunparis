import { AnimatePresence, motion } from 'framer-motion'

const BURST = [
  { a: 0,   d: 92,  c: '#FF5A1F', s: 7 },
  { a: 38,  d: 112, c: '#F5C518', s: 5 },
  { a: 78,  d: 98,  c: '#34d399', s: 6 },
  { a: 126, d: 106, c: '#FF5A1F', s: 4 },
  { a: 170, d: 90,  c: '#F5C518', s: 7 },
  { a: 218, d: 108, c: '#34d399', s: 5 },
  { a: 262, d: 94,  c: '#FF5A1F', s: 6 },
  { a: 306, d: 115, c: '#F5C518', s: 4 },
  { a: 348, d: 100, c: '#34d399', s: 5 },
]

export default function BookingConfirmToast({ open, bonNumber, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer select-none"
          style={{ background: 'rgba(2,3,6,0.94)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        >
          {/* ── Burst ring ── */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 140 }}>
            {/* Radial halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.55, 0], scale: [0.3, 2.4, 3.0] }}
              transition={{ duration: 1.0, delay: 0.08, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(52,211,153,0.55) 0%, transparent 68%)',
              }}
            />

            {/* Particles */}
            {BURST.map((p, i) => {
              const rad = (p.a * Math.PI) / 180
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 0, x: Math.cos(rad) * p.d, y: Math.sin(rad) * p.d, scale: 0.15 }}
                  transition={{ duration: 0.72, delay: 0.14 + i * 0.022, ease: [0.23, 1, 0.32, 1] }}
                  style={{
                    position: 'absolute',
                    width: p.s, height: p.s,
                    borderRadius: '50%',
                    background: p.c,
                    top: '50%', left: '50%',
                    marginTop: -p.s / 2, marginLeft: -p.s / 2,
                  }}
                />
              )
            })}

            {/* Check circle */}
            <motion.div
              initial={{ scale: 0, rotate: -28 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 13, stiffness: 230, delay: 0.05 }}
              style={{
                position: 'relative',
                width: 90, height: 90,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(140deg, #34d399 0%, #059669 100%)',
                boxShadow: '0 0 52px rgba(52,211,153,0.48), 0 0 0 1px rgba(52,211,153,0.25)',
              }}
            >
              <motion.svg
                width="42" height="42" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.46, delay: 0.22, ease: 'easeOut' }}
              >
                <motion.path d="M4 12.5l5 5L20 6" />
              </motion.svg>
            </motion.div>
          </div>

          {/* Title & message */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: [0.23, 1, 0.32, 1], delay: 0.26 }}
            style={{ textAlign: 'center', marginTop: 28, padding: '0 40px' }}
          >
            <h2 style={{
              fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em',
              color: '#F5F1E8', lineHeight: 1.12, margin: 0,
            }}>
              Réservation<br />envoyée !
            </h2>
            <p style={{
              fontSize: 15, color: 'rgba(245,241,232,.52)',
              marginTop: 12, lineHeight: 1.58,
            }}>
              {bonNumber ? `Bon n°${bonNumber} · ` : ''}Nourdine vous recontacte<br />pour confirmer votre trajet.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, ease: [0.23, 1, 0.32, 1], delay: 0.42 }}
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="active:scale-[.95] transition-transform duration-100"
            style={{
              marginTop: 36,
              padding: '14px 44px',
              borderRadius: 999,
              background: '#FF5A1F',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              boxShadow: '0 8px 28px rgba(255,90,31,.55), inset 0 1px 0 rgba(255,255,255,.2)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Parfait 👍
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.4 }}
            style={{ marginTop: 16, fontSize: 12, color: 'rgba(245,241,232,.22)', userSelect: 'none' }}
          >
            Toucher n'importe où pour fermer
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
