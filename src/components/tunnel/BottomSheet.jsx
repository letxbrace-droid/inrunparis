import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Step1Route   from './Step1_Route'
import Step2Price   from './Step2_Price'
import Step3Options from './Step3_Options'
import Step4Recap   from './Step4_Recap'
import useAppTheme  from '../../hooks/useAppTheme'

const STEPS = ['Trajet', 'Tarif', 'Options']

const SPRING = { type: 'spring', stiffness: 380, damping: 32 }

function StepDot({ index, current, th }) {
  const state = index + 1 < current ? 'done' : index + 1 === current ? 'active' : 'future'

  return (
    <motion.div
      className="flex items-center justify-center w-7 h-7 rounded-full select-none"
      animate={{
        background:
          state === 'active' ? '#ff4103'
          : state === 'done'  ? 'rgba(255,65,3,.22)'
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
          fill="none" stroke="#ff4103" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
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
        style={{ originX: 0, background: 'linear-gradient(90deg, rgba(255,65,3,.8), rgba(255,65,3,.3))' }}
        transition={{ duration: 0.38, ease: [0.32, 1, 0.55, 1] }}
      />
    </div>
  )
}

export default function BottomSheet({ open, step, onStepChange, onClose }) {
  const th = useAppTheme()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { setCollapsed(false) }, [step])

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
          background: isRecap ? 'rgba(0,0,0,.22)' : th.overlay,
          opacity: open && !collapsed ? 1 : 0,
          pointerEvents: open && !collapsed && !isRecap ? 'auto' : 'none',
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
            className="fixed bottom-7 left-0 right-0 z-[96] flex justify-center pointer-events-none"
          >
            <button
              onClick={() => setCollapsed(false)}
              className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full select-none cursor-pointer"
              style={{
                background: '#ff4103',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.01em',
                boxShadow: '0 4px 20px rgba(255,65,3,.50), 0 2px 8px rgba(0,0,0,.30)',
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
        <div
          className="w-full max-w-[560px] flex flex-col"
          style={{
            willChange:   'transform, opacity',
            height:       step === 4 ? 'auto' : '93dvh',
            maxHeight:    step === 4 ? '72dvh' : '93dvh',
            borderRadius: '22px 22px 0 0',
            overflow:     'hidden',
            background:   th.bgPanel,
            borderTop:    `1px solid ${th.borderStrong}`,
            borderLeft:   `1px solid ${th.border}`,
            borderRight:  `1px solid ${th.border}`,
            boxShadow:    `0 -16px 48px ${th.scrim}`,
            transform:    sheetOut ? 'translateY(100%)' : 'translateY(0)',
            opacity:      open ? 1 : 0,
            transition:   'transform .44s cubic-bezier(.32,1,.55,1), opacity .28s ease, height .4s cubic-bezier(.32,1,.55,1), max-height .4s cubic-bezier(.32,1,.55,1)',
          }}
        >
          {/* Header strip */}
          <div
            className="flex-shrink-0"
            style={{
              background:   th.bgHeader,
              borderBottom: `1px solid ${th.border}`,
            }}
          >
            {/* Handle — tappable on step 4 to collapse */}
            <div
              onClick={isRecap ? () => setCollapsed(true) : undefined}
              className={`flex flex-col items-center pt-3 pb-1 ${isRecap ? 'cursor-pointer active:opacity-60 transition-opacity' : ''}`}
              aria-label={isRecap ? 'Réduire pour voir la carte' : undefined}
              role={isRecap ? 'button' : undefined}
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
                <span className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ color: '#ff4103' }}>
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
                      className="flex items-center gap-2 cursor-pointer disabled:cursor-default"
                    >
                      <StepDot index={i} current={step} th={th} />
                      <motion.span
                        className="text-[12px] font-semibold"
                        animate={{
                          color: i + 1 === step ? th.inkFull
                            : i + 1 < step ? 'rgba(255,65,3,.75)'
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

          {/* Content — slides between steps */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.26, ease: [0.32, 1, 0.55, 1] }}
                className="pt-4"
              >
                {step === 1 && <Step1Route   onNext={() => onStepChange(2)} />}
                {step === 2 && <Step2Price   onNext={() => onStepChange(3)} onBack={() => onStepChange(1)} />}
                {step === 3 && <Step3Options onNext={() => onStepChange(4)} onBack={() => onStepChange(2)} />}
                {step === 4 && <Step4Recap   onBack={() => onStepChange(3)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
