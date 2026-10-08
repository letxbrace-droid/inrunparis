import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform, useDragControls, animate } from 'framer-motion'
import Step1Route   from './Step1_Route'
import Step2Price   from './Step2_Price'
import Step3Options from './Step3_Options'
import Step4Recap   from './Step4_Recap'
import useAppTheme  from '../../hooks/useAppTheme'
import { haptic }   from '../../utils/haptics'

const STEPS = ['Trajet', 'Tarif', 'Options']

const SPRING = { type: 'spring', stiffness: 380, damping: 32 }

/**
 * Les crans de la feuille, en fraction de hauteur d'écran.
 *
 * La feuille était fixe — 93 % tout le temps, carte invisible, et une poignée
 * qui annonçait qu'on pouvait la tirer sans que rien ne se passe. Une
 * affordance qui ment coûte plus cher que pas d'affordance du tout.
 *
 * Le cran de repos vient de l'ÉTAPE, pas d'un pourcentage choisi d'avance :
 * saisir deux adresses demande toute la hauteur et le clavier ; lire un tarif
 * demande de voir la route sur la carte derrière. Deux crans atteignables à la
 * fois — celui de l'étape et le coup d'œil — parce qu'au-delà de trois, plus
 * personne ne sait où la feuille va atterrir.
 */
const DETENTS = { peek: 0.30, mid: 0.60, full: 0.93 }

/** Le cran naturel de chaque étape. */
const stepDetent = (step) => (step === 2 || step === 4 ? 'mid' : 'full')

/**
 * Où un geste se termine, et non où le doigt s'est levé.
 *
 * Un lancer doit atterrir là où il a été lancé : c'est la projection
 * qu'utilise UIScrollView, avec un taux de décélération de 0,998 par
 * milliseconde — soit 0,998 / (1 − 0,998) ≈ 499 ms de course restante.
 * Framer donne la vélocité en px/s, d'où la division par 1000.
 *
 * Sans ça, on s'accroche au cran le plus proche du point de relâchement, et
 * une chiquenaude vive vers le bas remonte la feuille : le geste exact que
 * tout le monde fait pour la fermer.
 */
const project = (position, velocity) => position + (velocity / 1000) * 499

/** Au-delà, un geste est une chiquenaude même s'il a parcouru peu de chemin. */
const FLICK = 500

function StepDot({ index, current, th }) {
  const state = index + 1 < current ? 'done' : index + 1 === current ? 'active' : 'future'

  return (
    <motion.div
      className="flex items-center justify-center w-7 h-7 rounded-full select-none"
      animate={{
        background:
          state === 'active' ? 'var(--accent)'
          : state === 'done'  ? 'color-mix(in srgb, var(--accent) 22%, transparent)'
          : th.isDark ? 'rgba(0,10,18,.6)' : 'rgba(0,0,0,.08)',
        scale:     state === 'active' ? 1.12 : 1,
        boxShadow:
          state === 'active'
            ? 'inset 0 1px 0 rgba(255,255,255,.15)'
            : 'none',
      }}
      transition={SPRING}
      style={{
        border: state === 'future' ? `1px solid ${th.borderStrong}` : 'none',
        fontSize: 12,
        fontWeight: 700,
        color: state === 'future' ? th.inkLow : '#F5F1E8',
      }}
    >
      {state === 'done' ? (
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING, delay: 0.05 }}
          width="11" height="11" viewBox="0 0 14 14"
          fill="none" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M2 7l4 4 6-6"/>
        </motion.svg>
      ) : (
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {index + 1}
        </motion.span>
      )}
    </motion.div>
  )
}

function StepConnector({ index, current, th }) {
  const filled = index + 1 < current
  return (
    <div className="relative mx-3 h-px overflow-hidden" style={{ width: 28, background: th.border }}>
      <motion.div
        className="absolute inset-y-0 left-0 h-full"
        animate={{ scaleX: filled ? 1 : 0 }}
        style={{ originX: 0, background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 80%, transparent), color-mix(in srgb, var(--accent) 30%, transparent))' }}
        transition={{ duration: 0.38, ease: [0.32, 1, 0.55, 1] }}
      />
    </div>
  )
}

export default function BottomSheet({ open, step, onStepChange, onClose }) {
  const th = useAppTheme()
  const [collapsed, setCollapsed] = useState(false)

  // Direction tracking for spatial step transition
  const prevStepRef = useRef(step)
  const dirRef = useRef(1)
  if (step !== prevStepRef.current) {
    dirRef.current = step > prevStepRef.current ? 1 : -1
    prevStepRef.current = step
  }

  useEffect(() => { setCollapsed(false) }, [step])

  // ── Crans ───────────────────────────────────────────────────────────────
  const natural = stepDetent(step)
  const [detent, setDetent] = useState('natural')
  const y = useMotionValue(0)
  const dragControls = useDragControls()
  const headerRef = useRef(null)
  const scrollRef = useRef(null)
  const [fit, setFit] = useState(null)

  const vh = () => (typeof window === 'undefined' ? 800 : window.innerHeight)
  // La feuille est dimensionnée au plus grand cran et translatée vers le bas
  // pour en montrer moins : la hauteur ne change jamais, donc le contenu ne
  // se remet pas en page à chaque cran et le bouton d'action ne saute pas.
  // La hauteur réellement visible de la feuille, suivie image par image.
  //
  // Le panneau garde une hauteur fixe et descend pour en montrer moins — c'est
  // ce qui évite que le contenu se remette en page à chaque cran. Mais son
  // contenu, lui, se dispose depuis le HAUT du panneau : au cran bas, le
  // panneau dépassait de 333 px sous l'écran et le bouton d'action tombait
  // avec. La feuille tenait son contenu et coupait la seule chose sur
  // laquelle il faut appuyer.
  // La colonne intérieure est donc bornée à la zone visible, pas au panneau.
  const visibleH = useTransform(y, (v) => `${Math.max(120, DETENTS.full * vh() - v)}px`)

  const fracOf = (d) => (d === 'natural' ? (step === 1 ? DETENTS.full : fit ?? DETENTS[natural]) : DETENTS[d])
  const offsetOf = (d) => (DETENTS.full - fracOf(d)) * vh()

  // Le cran dérivé du CONTENU, pas du numéro d'étape.
  //
  // L'étape « Options » tient dans la moitié d'un écran, et la feuille lui
  // donnait 93 % : une grande zone vide sous le dernier champ. La recherche
  // est explicite là-dessus — dériver les crans du contenu, pas de
  // pourcentages fixes. On mesure donc ce que l'étape occupe réellement et on
  // s'arrête là.
  //
  // L'étape 1 fait exception et garde toute la hauteur : sa liste de
  // suggestions n'existe pas encore au moment de la mesure, et le clavier
  // mangera la moitié de ce qui reste.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // On mesure l'ENFANT, pas le conteneur. Le conteneur porte `flex-1` : son
    // scrollHeight vaut au minimum sa hauteur étirée, donc il rapportait
    // toujours la hauteur de la feuille — et le cran « mesuré » retombait
    // systématiquement sur 93 %, c'est-à-dire sur ce qu'il devait corriger.
    const measure = () => {
      const content = el.firstElementChild
      if (!content) return
      // getBoundingClientRect() de l'enfant ignore le rembourrage du parent et
      // la zone sûre du bas. Les oublier rognait le bouton d'action de
      // quelques dizaines de pixels : la feuille tenait son contenu et coupait
      // la seule chose sur laquelle il faut appuyer.
      const cs = getComputedStyle(el)
      const pad = parseFloat(cs.paddingTop || 0) + parseFloat(cs.paddingBottom || 0)
      const safe = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--safe-bot') || 0,
      ) || 0
      const h = (headerRef.current?.offsetHeight ?? 0)
        + content.getBoundingClientRect().height + pad + safe + 24
      setFit(Math.min(DETENTS.full, Math.max(DETENTS.peek, h / vh())))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [step])

  // Le cran ne revient à sa position de repos qu'au CHANGEMENT D'ÉTAPE.
  // Avec `fit` dans les dépendances, chaque nouvelle mesure du contenu
  // réinitialisait le cran — donc un glissement vers le coup d'œil était
  // annulé par la mesure qui suivait, et la feuille remontait toute seule
  // sous le doigt qui venait de la baisser.
  useEffect(() => { setDetent('natural') }, [step])
  useEffect(() => {
    if (!open) return
    animate(y, offsetOf(detent), { type: 'spring', stiffness: 320, damping: 34 })
    // `fit` fait partie des dépendances : sans lui, la feuille se plaçait une
    // fois puis ignorait la mesure du contenu qui arrivait juste après — elle
    // restait au cran d'avant pendant que la colonne, elle, se redimensionnait.
  }, [detent, open, fit]) // eslint-disable-line

  const settle = (_e, info) => {
    const landing = project(y.get(), info.velocity.y)
    const reach = ['natural', 'peek']
    // Lancée franchement vers le bas au-delà du coup d'œil : on ferme.
    if (info.velocity.y > FLICK && landing > offsetOf('peek') + vh() * 0.08) {
      onClose?.()
      return
    }
    const target = reach.reduce((best, d) =>
      Math.abs(offsetOf(d) - landing) < Math.abs(offsetOf(best) - landing) ? d : best, reach[0])
    if (target !== detent) haptic.light()
    setDetent(target)
    animate(y, offsetOf(target), { type: 'spring', stiffness: 320, damping: 34 })
  }

  // Haptic tap on every step advance/retreat (skip initial mount)
  const isFirstStepRef = useRef(true)
  useEffect(() => {
    if (isFirstStepRef.current) { isFirstStepRef.current = false; return }
    haptic.light()
  }, [step])

  const isRecap  = step === 4
  const sheetOut = !open || (isRecap && collapsed)

  return (
    <>
      {/* Overlay — none when recap collapsed, lighter when recap open */}
      <div
        onClick={!isRecap ? onClose : undefined}
        aria-hidden="true"
        className="fixed inset-0 z-[90] transition-all duration-500"
        style={{
          // La modalité suit le cran, pas l'ouverture.
          // Au cran de coup d'œil, la carte DERRIÈRE est tout l'intérêt : la
          // voiler et lui couper les événements revient à annuler la raison
          // pour laquelle on vient de réduire la feuille.
          background: isRecap ? 'rgba(0,0,0,.22)' : th.overlay,
          opacity: open && !collapsed && detent === 'natural' && fracOf('natural') > 0.8 ? 1 : 0,
          pointerEvents: open && !collapsed && !isRecap && detent === 'natural' && fracOf('natural') > 0.8 ? 'auto' : 'none',
        }}
      />

      {/* Floating restore chip — step 4 collapsed */}
      <AnimatePresence>
        {open && isRecap && collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[96] flex justify-center pointer-events-none"
            style={{ bottom: 'calc(var(--safe-bot, 0px) + 108px)', left: 0, right: 0 }}
          >
            <button
              onClick={() => setCollapsed(false)}
              className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full select-none cursor-pointer"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.01em',
                boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 50%, transparent), 0 2px 8px rgba(0,0,0,.30)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              Récapitulatif
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Réservation"
        className="fixed bottom-0 left-0 right-0 z-[95] flex justify-center"
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        <motion.div
          className="w-full max-w-[560px] flex flex-col"
          drag="y"
          // Le glissement ne part que de l'en-tête : à l'intérieur, le doigt
          // appartient au contenu qui défile. C'est la seule façon d'avoir une
          // feuille tirable ET un contenu scrollable sans qu'ils se disputent.
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: offsetOf('peek') }}
          dragElastic={{ top: 0.04, bottom: 0.18 }}
          dragMomentum={false}
          onDragEnd={settle}
          style={{
            y,
            willChange:   'transform, opacity',
            height:       '93dvh',
            borderRadius: '24px 24px 0 0',
            overflow:     'hidden',
            background:   th.bgPanel,
            borderTop:    th.isDark ? '1px solid rgba(255,255,255,0.10)' : `1px solid ${th.borderStrong}`,
            borderLeft:   th.isDark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${th.border}`,
            borderRight:  th.isDark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${th.border}`,
            boxShadow: th.isDark
              ? '0 -24px 56px rgba(0,0,0,0.90), 0 -6px 40px -8px rgba(255,90,31,0.18), 0 -2px 12px -2px rgba(255,90,31,0.10)'
              : `0 -8px 32px ${th.scrim}`,
            opacity:      open ? 1 : 0,
            transition:   'opacity .28s ease',
          }}
          animate={sheetOut ? { y: vh() } : {}}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          <motion.div className="flex flex-col w-full min-h-0" style={{ height: visibleH }}>
          {/* Specular top edge — accent halo on dark, white on light */}
          {th.isDark && (
            <span aria-hidden="true" style={{
              display: 'block', height: 1, flexShrink: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,90,31,0.55) 35%, rgba(255,140,60,0.70) 50%, rgba(255,90,31,0.55) 65%, transparent 100%)',
            }} />
          )}
          {/* Header strip */}
          <div
            ref={headerRef}
            className="flex-shrink-0"
            style={{
              background:   th.bgHeader,
              borderBottom: `1px solid ${th.border}`,
            }}
          >
            {/* Handle — tappable on step 4 to collapse */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              onClick={() => setDetent((d) => (d === 'peek' ? 'natural' : 'peek'))}
              className="flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              aria-label={detent === 'peek' ? 'Déplier la réservation' : 'Réduire pour voir la carte'}
              role="button"
            >
              <div className="w-10 h-[3px] rounded-full" style={{ background: th.handle }} />
              {isRecap && (
                <div className="flex items-center gap-1 mt-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: th.inkDim }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  <span className="text-[9px] font-semibold uppercase tracking-[.10em]" style={{ color: th.inkDim }}>
                    Voir la carte
                  </span>
                </div>
              )}
            </div>

            {/* Step indicator (hidden on recap step) */}
            {step === 4 ? (
              <div className="flex items-center justify-center py-3 px-6">
                <span className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ color: 'var(--accent)' }}>
                  Récapitulatif
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center py-3 px-6">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center">
                    <button
                      onClick={() => i + 1 < step && onStepChange(i + 1)}
                      disabled={i + 1 > step}
                      aria-label={`Étape ${i + 1} : ${label}`}
                      className="flex items-center gap-2 cursor-pointer disabled:cursor-default min-h-[44px] px-1"
                    >
                      <StepDot index={i} current={step} th={th} />
                      <motion.span
                        className="text-[12px] font-semibold"
                        animate={{
                          color: i + 1 === step ? th.inkFull
                            : i + 1 < step ? 'color-mix(in srgb, var(--accent) 75%, transparent)'
                            : th.inkMuted,
                        }}
                        transition={{ duration: 0.25 }}
                      >
                        {label}
                      </motion.span>
                    </button>
                    {i < STEPS.length - 1 && <StepConnector index={i} current={step} th={th} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content — slides between steps. Soft fade at the scroll edges so
              sections melt into the header/footer instead of clipping hard. */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scroll-fade scroll-area"
            style={{ overscrollBehavior: 'contain' }}
          >
            <LayoutGroup>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: dirRef.current * 58, scale: 0.97, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: dirRef.current * -42, scale: 0.97, filter: 'blur(2px)' }}
                  transition={{ duration: 0.36, ease: [0.32, 1, 0.55, 1] }}
                  className="pt-4"
                >
                  {step === 1 && <Step1Route   onNext={() => onStepChange(2)} />}
                  {step === 2 && <Step2Price   onNext={() => onStepChange(3)} onBack={() => onStepChange(1)} />}
                  {step === 3 && <Step3Options onNext={() => onStepChange(4)} onBack={() => onStepChange(2)} />}
                  {step === 4 && <Step4Recap   onBack={() => onStepChange(3)} />}
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>
          </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
