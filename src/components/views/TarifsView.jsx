import { motion } from 'framer-motion'
import useAppTheme from '../../hooks/useAppTheme'
import SignatureTrace from '../ui/SignatureTrace'

const WA_MAD = `https://wa.me/33767742220?text=${encodeURIComponent('*DEMANDE DE DEVIS — MISE À DISPOSITION*\n\nBonjour Nourdine,\n\nJe souhaite réserver votre service de mise à disposition :\n\n📅 Date : \n🕒 Horaires : \n⏱️ Durée estimée : \n📍 Point de départ : \n🎯 Type de prestation : (Business / Mariage / Tourisme / Autre)\n👥 Nombre de passagers : \n\nMerci de me confirmer votre disponibilité et le tarif final.')}`

const TRAJETS = [
  {
    title:    'Aéroports & gares',
    subtitle: 'CDG · Orly · Beauvais · Gares TGV',
    price:    'dès 45 €',
    emoji:    '✈️',
    accent:   'rgba(255,90,31,0.14)',
  },
  {
    title:    'Longue distance',
    subtitle: "Province · Côte d'Azur · Genève",
    price:    'Sur devis',
    emoji:    '🗺️',
    accent:   'rgba(245,197,24,0.12)',
  },
]

const MAD_ROWS = [
  { duration: '2 heures', note: 'Forfait court',   price: '80 €',     highlight: false },
  { duration: '4 heures', note: 'Demi-journée',    price: '150 €',    highlight: true  },
  { duration: 'Journée',  note: '8h · Conseillé',  price: 'Sur devis', highlight: false },
]

const REVIEWS = [
  { init: 'SM', name: 'Sophie M.', route: 'CDG → Paris 8e',           text: "Chauffeur ponctuel, tarif honoré sans discussion. Le service premium sans l'attente des applis." },
  { init: 'TR', name: 'Thomas R.', route: 'Ris-Orangis → La Défense', text: 'Réservation WhatsApp, confirmation rapide, devis garanti. Ponctuel, discret, professionnel.'    },
  { init: 'AK', name: 'Amina K.',  route: 'Orly → Versailles',        text: 'Service courtois, conduite souple. Une vraie alternative premium aux grandes plateformes.'        },
]

const COMPARE = [
  'Prix annoncé avant le départ',
  'Aucune commission cachée',
  'Confirmation WhatsApp en 2 min',
  'Chauffeur unique & connu',
]

const EASE = [0.23, 1, 0.32, 1]

function reveal(delay = 0) {
  return {
    initial:    { opacity: 0, y: 28 },
    whileInView:{ opacity: 1, y: 0  },
    viewport:   { once: true, margin: '-48px' },
    transition: { duration: 0.48, ease: EASE, delay },
  }
}

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        background: 'rgba(255,90,31,0.12)',
        border: '1px solid rgba(255,90,31,0.22)',
      }}>
        {children}
      </span>
    </div>
  )
}

function StarRow() {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#F5C518">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export default function TarifsView({ open, onClose, onReserve }) {
  const th = useAppTheme()
  const HAIRLINE = `1px solid ${th.divider}`
  const CARD = {
    background:   th.bgCard,
    borderRadius: 18,
    border:       `1px solid ${th.borderFaint}`,
    overflow:     'hidden',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tarifs et services"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:    th.bgBase,
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
        className="flex-shrink-0 flex items-center gap-3 px-5 relative z-10"
        style={{
          paddingTop:    'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background:    th.bgHeader,
          borderBottom:  `1px solid ${th.divider}`,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform flex-shrink-0"
          style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.inkHigh} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <SignatureTrace width={52} loop={false} strokeOpacity={0.5} style={{ marginBottom: 7 }} />
          <h1 className="text-[17px] font-bold" style={{ color: th.inkFull }}>Tarifs & services</h1>
          <p className="text-xs" style={{ color: th.inkMuted }}>Transparents · Sans surprise</p>
        </div>
      </div>

      {/* Body */}
      <div
        key={open}
        className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 120px)' }}
      >
        {/* ── Hero ── */}
        <motion.section className="px-5 pt-6" {...reveal(0)}>
          <div
            style={{
              borderRadius: 20,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(140deg, #1A0F06 0%, #0D0A08 55%, #0A0D18 100%)',
              border: '1px solid rgba(255,90,31,0.18)',
              boxShadow: '0 0 0 1px rgba(255,90,31,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Accent top line */}
            <span aria-hidden="true" style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent 5%, var(--accent) 38%, #FF8C3F 52%, var(--accent) 66%, transparent 95%)',
            }} />
            {/* Ambient glow */}
            <span aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 80% 60% at 10% 0, rgba(255,90,31,0.12), transparent 55%)',
            }} />

            <h2 style={{
              fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em',
              color: '#F5F1E8', lineHeight: 1.18, margin: 0,
            }}>
              Prix annoncé avant<br />chaque course
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(245,241,232,.48)', marginTop: 8, lineHeight: 1.5 }}>
              Aéroports, longue distance et mise à disposition.
            </p>

            <div
              className="grid grid-cols-3 gap-3 mt-5 pt-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              {[{ val: '5/5', lab: 'Excellence' }, { val: '2 min', lab: 'Réponse' }, { val: 'EVTC', lab: 'Certifié' }].map((s, i) => (
                <motion.div
                  key={s.lab}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.12 + i * 0.08 }}
                >
                  <span style={{ display: 'block', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)' }}>
                    {s.val}
                  </span>
                  <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(245,241,232,0.40)', marginTop: 3 }}>
                    {s.lab}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Trajets fixes ── */}
        <motion.section className="px-5 pt-7" {...reveal(0.06)}>
          <SectionLabel>Trajets fixes</SectionLabel>
          <div style={CARD}>
            {TRAJETS.map((t, i) => (
              <div
                key={t.title}
                className="flex items-center gap-4 px-4 py-4"
                style={{ borderBottom: i < TRAJETS.length - 1 ? HAIRLINE : 'none' }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 42, height: 42,
                    borderRadius: 13,
                    background: t.accent,
                    fontSize: 20,
                  }}
                >
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight" style={{ color: th.inkFull }}>{t.title}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: th.inkMuted }}>{t.subtitle}</div>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                  {t.price}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Mise à disposition ── */}
        <motion.section className="px-5 pt-7" {...reveal(0.06)}>
          <SectionLabel>Mise à disposition</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MAD_ROWS.map((row) => (
              <div
                key={row.duration}
                className="flex items-center justify-between px-4 py-4"
                style={{
                  borderRadius: 14,
                  background: row.highlight
                    ? (th.isDark ? 'rgba(255,90,31,0.10)' : 'rgba(255,90,31,0.07)')
                    : th.bgCard,
                  border: row.highlight
                    ? '1px solid rgba(255,90,31,0.24)'
                    : `1px solid ${th.borderFaint}`,
                }}
              >
                <div>
                  <span className="font-bold text-sm" style={{ color: th.inkFull }}>{row.duration}</span>
                  {row.highlight && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 700,
                      padding: '2px 7px', borderRadius: 999,
                      background: 'var(--accent)', color: '#fff',
                    }}>
                      Populaire
                    </span>
                  )}
                  <div className="text-[11px] mt-0.5" style={{ color: th.inkMuted }}>{row.note}</div>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                  {row.price}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center mt-2.5 px-1" style={{ fontSize: 11, color: th.inkDim }}>
            Tarifs TTC · Sans frais cachés · Attentes incluses
          </p>
        </motion.section>

        {/* ── Pourquoi I&N RUN ── */}
        <motion.section className="px-5 pt-7" {...reveal(0.06)}>
          <SectionLabel>Pourquoi I&amp;N RUN</SectionLabel>
          <div style={CARD}>
            {COMPARE.map((adv, i) => (
              <div
                key={adv}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < COMPARE.length - 1 ? HAIRLINE : 'none' }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(52,211,153,0.14)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <span className="text-sm" style={{ color: th.inkHigh }}>{adv}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Avis clients ── */}
        <motion.section className="pt-7" {...reveal(0.06)}>
          <div className="px-5">
            <SectionLabel>Avis clients</SectionLabel>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-3" style={{ scrollbarWidth: 'none' }}>
            {REVIEWS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.44, ease: EASE, delay: i * 0.08 }}
                style={{
                  flexShrink: 0,
                  width: 248,
                  borderRadius: 18,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  background: th.bgCard,
                  border: `1px solid ${th.borderFaint}`,
                }}
              >
                <StarRow />
                <p style={{ fontSize: 12.5, color: th.inkLow, lineHeight: 1.6, flex: 1 }}>{r.text}</p>
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: th.bgAvatar, flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: th.inkMid }}>{r.init}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: th.inkFull }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: th.inkDim }}>{r.route}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Sticky footer */}
      <div
        className="flex-shrink-0 px-5 pt-3 flex flex-col gap-2 relative z-10"
        style={{
          paddingBottom:  'calc(var(--safe-bot) + 12px)',
          borderTop:      `1px solid ${th.divider}`,
          background:     th.bgGrouped,
        }}
      >
        <button
          onClick={onReserve}
          className="cta-glow w-full py-4 rounded-2xl font-bold text-[15px] tracking-wide text-white cursor-pointer active:scale-[.97] transition-transform duration-150 select-none relative overflow-hidden"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)' }} />
          Réserver ma course
        </button>
        <a
          href={WA_MAD}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer active:scale-[.98] transition-transform select-none"
          style={{
            background:     th.bgCard,
            border:         `1px solid ${th.border}`,
            color:          th.inkHigh,
            textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="#25d366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Demander mon estimation
        </a>
      </div>
    </div>
  )
}
