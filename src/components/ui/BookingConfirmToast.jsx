import { AnimatePresence, motion } from 'framer-motion'

export default function BookingConfirmToast({ open, bonNumber, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: -140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -140, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={onClose}
          className="fixed left-4 right-4 z-[200] flex items-center gap-3.5 rounded-2xl px-4 py-3.5 cursor-pointer overflow-hidden"
          style={{
            top:        'calc(var(--safe-top) + 12px)',
            maxWidth:   520,
            marginLeft: 'auto',
            marginRight:'auto',
            background: '#0F0F0F',
            border:     '1px solid rgba(52,211,153,.32)',
            boxShadow:  '0 8px 24px rgba(0,0,0,.7)',
          }}
        >
          {/* Specular top line */}
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,.45), transparent)' }} />

          {/* Animated check badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 320, delay: 0.12 }}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: '#10b981',
            }}
          >
            <motion.svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#04221b" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.26, ease: 'easeOut' }}
            >
              <motion.path d="M4 12.5l5 5L20 6" />
            </motion.svg>
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight" style={{ color: '#F5F1E8' }}>
              Réservation envoyée
            </p>
            <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(245,241,232,.5)' }}>
              {bonNumber ? `Bon ${bonNumber} · ` : ''}Nourdine vous recontacte pour confirmer.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            aria-label="Fermer"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,.06)' }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="rgba(245,241,232,.6)" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
