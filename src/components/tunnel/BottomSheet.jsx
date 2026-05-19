import { motion, AnimatePresence } from 'framer-motion'
import Step1Route   from './Step1_Route'
import Step2Price   from './Step2_Price'
import Step3Options from './Step3_Options'

const STEPS = ['Trajet', 'Tarif', 'Options']

const SPRING = { type: 'spring', stiffness: 380, damping: 32 }

function StepDot({ index, current }) {
  const state = index + 1 < current ? 'done' : index + 1 === current ? 'active' : 'future'

  return (
    <motion.div
      className="flex items-center justify-center w-7 h-7 rounded-full select-none"
      animate={{
        background:
          state === 'active' ? '#ff4103'
          : state === 'done'  ? 'rgba(255,65,3,.22)'
          : 'rgba(0,10,18,.6)',
        scale:     state === 'active' ? 1.12 : 1,
        boxShadow:
          state === 'active'
            ? '0 0 22px rgba(255,65,3,.7), 0 0 8px rgba(255,65,3,.45), inset 0 1px 0 rgba(255,255,255,.22)'
            : state === 'done'
            ? '0 0 10px rgba(255,65,3,.22)'
            : 'inset 2px 2px 5px rgba(0,0,0,.5)',
      }}
      transition={SPRING}
      style={{
        border: state === 'future' ? '1px solid rgba(255,255,255,.12)' : 'none',
        fontSize: 12,
        fontWeight: 700,
        color: state === 'future' ? 'rgba(245,241,232,.55)' : '#F5F1E8',
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

function StepConnector({ index, current }) {
  const filled = index + 1 < current
  return (
    <div className="relative mx-3 h-px overflow-hidden" style={{ width: 28, background: 'rgba(255,255,255,.07)' }}>
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
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[90] transition-opacity duration-300"
        style={{
          background: 'rgba(0,8,14,.65)',
          backdropFilter: open ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: open ? 'blur(4px)' : 'none',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

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
            height:       '93dvh',
            borderRadius: '22px 22px 0 0',
            overflow:     'hidden',
            background:   '#0B0B0B',
            borderTop:    '1px solid rgba(255,255,255,.08)',
            borderLeft:   '1px solid rgba(255,255,255,.06)',
            borderRight:  '1px solid rgba(255,255,255,.06)',
            boxShadow:    '0 -16px 48px rgba(0,0,0,.9)',
            transform:    open ? 'translateY(0)' : 'translateY(100%)',
            opacity:      open ? 1 : 0,
            transition:   'transform .44s cubic-bezier(.32,1,.55,1), opacity .28s ease',
          }}
        >
          {/* Header strip */}
          <div
            className="flex-shrink-0"
            style={{
              background:   '#0D0D0D',
              borderBottom: '1px solid rgba(255,255,255,.07)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,.18)' }} />
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center py-3 px-6">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center">
                  <button
                    onClick={() => i + 1 < step && onStepChange(i + 1)}
                    disabled={i + 1 > step}
                    aria-label={`Étape ${i + 1} : ${label}`}
                    className="flex items-center gap-2 cursor-pointer disabled:cursor-default"
                  >
                    <StepDot index={i} current={step} />
                    <motion.span
                      className="text-[12px] font-semibold"
                      animate={{
                        color: i + 1 === step ? '#F5F1E8'
                          : i + 1 < step ? 'rgba(255,65,3,.75)'
                          : 'rgba(245,241,232,.52)',
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      {label}
                    </motion.span>
                  </button>
                  {i < STEPS.length - 1 && <StepConnector index={i} current={step} />}
                </div>
              ))}
            </div>
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
                {step === 3 && <Step3Options onBack={() => onStepChange(2)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
