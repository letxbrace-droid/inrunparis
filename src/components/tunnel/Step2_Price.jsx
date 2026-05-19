import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import GlowingCTA  from '../ui/GlowingCTA'
import useAppTheme from '../../hooks/useAppTheme'

// ── Hairline divider ──────────────────────────────────────────────────────────
function Div({ th }) {
  return <div style={{ height: 1, background: th.divider, marginLeft: 20, marginRight: 20 }} />
}

// ── Line item ─────────────────────────────────────────────────────────────────
function LineItem({ icon, label, value, valueColor, th }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg"
        style={{ background: th.isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)' }}>
        {icon}
      </span>
      <span className="flex-1 text-[13px] font-semibold" style={{ color: th.inkMid }}>
        {label}
      </span>
      <span className="text-[13px] font-bold" style={{ color: valueColor || th.inkFull }}>
        {value}
      </span>
    </div>
  )
}

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerV = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }
const itemV      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } } }

export default function Step2Price({ onNext, onBack }) {
  const th = useAppTheme()
  const { depart, arrive, price } = useBookingStore()

  if (!price) return (
    <div className="flex flex-col items-center justify-center gap-4 px-5 py-16">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,65,3,.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p className="text-sm text-center" style={{ color: th.inkMuted }}>
        Revenez à l'étape 1 pour calculer le trajet
      </p>
      <button onClick={onBack} className="text-sm underline cursor-pointer" style={{ color: '#ff4103' }}>
        ← Retour
      </button>
    </div>
  )

  return (
    <motion.div
      className="flex flex-col gap-4 px-5 pb-6"
      variants={containerV}
      initial="hidden"
      animate="show"
    >

      {/* ── Trajet compact ───────────────────────────────────────── */}
      <motion.div variants={itemV} className="flex items-center gap-2 px-1">
        <div className="flex flex-col items-center flex-shrink-0" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff4103' }} />
          <span className="w-px my-1" style={{ height: 10, background: 'linear-gradient(to bottom, rgba(255,65,3,.5), rgba(255,65,3,.12))' }} />
          <span className="w-1.5 h-1.5 rounded-full border" style={{ borderColor: 'rgba(255,65,3,.6)', background: th.bgCard }} />
        </div>
        <p className="flex-1 text-[12px] font-semibold truncate" style={{ color: th.inkMid }}>
          {depart?.name?.split(',')[0] ?? '—'}
        </p>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,65,3,.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <p className="flex-1 text-[12px] font-semibold truncate" style={{ color: th.inkMid }}>
          {arrive?.name?.split(',')[0] ?? '—'}
        </p>
      </motion.div>

      {/* ── Receipt card ─────────────────────────────────────────── */}
      <motion.div
        variants={itemV}
        className="rounded-2xl overflow-hidden"
        style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
      >

        {/* Price hero row */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-baseline gap-1">
            <span style={{
              fontSize: '3.6rem', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1,
              color: th.inkFull,
            }}>
              {price.final}
            </span>
            <span style={{
              fontSize: '1.6rem', fontWeight: 800,
              color: '#ff4103', letterSpacing: '-0.02em',
            }}>
              €
            </span>
          </div>

          {/* Distance + durée */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={th.inkMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-[13px] font-bold tabular-nums" style={{ color: th.inkMid }}>
                ≈ {price.mins} min
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={th.inkMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
                <path d="M12 8v4l2.5 2.5"/>
              </svg>
              <span className="text-[13px] font-bold tabular-nums" style={{ color: th.inkMuted }}>
                {price.km} km
              </span>
            </div>
          </div>
        </div>

        <Div th={th} />

        {/* Line items — supplements */}
        {price.isAirport && (
          <>
            <LineItem
              th={th}
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#ff4103" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5c-1.5-1.5-3.5-1.5-5 0L11 6 2.8 4.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 6.2 7.3c.4.4.9.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                </svg>
              }
              label="Supplément aéroport"
              value="Inclus"
              valueColor="rgba(255,65,3,.75)"
            />
            <Div th={th} />
          </>
        )}

        {price.isNight && (
          <>
            <LineItem
              th={th}
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={th.inkMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              }
              label="Tarif nuit"
              value="Inclus"
              valueColor="rgba(255,65,3,.75)"
            />
            <Div th={th} />
          </>
        )}

        {price.savings > 0 && (
          <>
            <LineItem
              th={th}
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              }
              label="Économie vs apps"
              value={`−${price.savings} €`}
              valueColor="#34d399"
            />
            <Div th={th} />
          </>
        )}

        {/* Tarif fixe */}
        <LineItem
          th={th}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={th.inkMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          }
          label="Tarif fixe garanti"
          value="✓"
          valueColor="rgba(255,65,3,.80)"
        />

      </motion.div>

      {/* ── Trust strip ──────────────────────────────────────────── */}
      <motion.div variants={itemV}
        className="flex items-center justify-center gap-3 px-2"
      >
        {[
          'Aucune surprise',
          'Chauffeur privé',
          'Ponctualité garantie',
        ].map((t, i) => (
          <span key={t} className="flex items-center gap-1">
            {i > 0 && <span style={{ color: th.inkDim }}>·</span>}
            <span className="text-[11px] font-medium" style={{ color: th.inkDim }}>{t}</span>
          </span>
        ))}
      </motion.div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <motion.div variants={itemV} className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-none px-5 py-4 rounded-2xl text-sm font-semibold cursor-pointer active:scale-95 transition-transform"
          style={th.backBtn}
        >
          ← Retour
        </button>
        <GlowingCTA onClick={onNext} className="flex-1">
          Continuer →
        </GlowingCTA>
      </motion.div>

    </motion.div>
  )
}
