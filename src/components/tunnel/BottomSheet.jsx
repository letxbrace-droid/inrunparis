import Step1Route   from './Step1_Route'
import Step2Price   from './Step2_Price'
import Step3Options from './Step3_Options'

const STEPS = ['Trajet', 'Tarif', 'Options']

function StepDot({ index, current }) {
  const state = index + 1 < current ? 'done' : index + 1 === current ? 'active' : 'future'
  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 select-none"
      style={{
        background: state === 'done'
          ? 'rgba(255,65,3,.25)'
          : state === 'active'
          ? '#ff4103'
          : 'rgba(0,10,18,.6)',
        boxShadow: state === 'active'
          ? '0 0 18px rgba(255,65,3,.65), 0 0 6px rgba(255,65,3,.4), inset 0 1px 0 rgba(255,255,255,.2)'
          : state === 'done'
          ? '0 0 8px rgba(255,65,3,.2)'
          : 'inset 2px 2px 5px rgba(0,0,0,.5)',
        border: state === 'future' ? '1px solid rgba(255,255,255,.06)' : 'none',
        fontSize: 12,
        fontWeight: 700,
        color: state === 'future' ? 'rgba(245,241,232,.3)' : '#F5F1E8',
      }}
    >
      {state === 'done' ? (
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#ff4103" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7l4 4 6-6"/>
        </svg>
      ) : (
        index + 1
      )}
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
          className="w-full max-w-[560px] flex flex-col will-change-transform"
          style={{
            height:         '93dvh',
            borderRadius:   '22px 22px 0 0',
            overflow:       'hidden',
            background:     'linear-gradient(180deg, #001f30 0%, #001621 60%)',
            borderTop:      '1px solid rgba(255,255,255,.08)',
            borderLeft:     '1px solid rgba(255,255,255,.05)',
            borderRight:    '1px solid rgba(255,255,255,.05)',
            boxShadow:      '0 -24px 80px rgba(0,0,0,.8), 0 -1px 0 rgba(255,65,3,.15)',
            transform:      open ? 'translateY(0)' : 'translateY(100%)',
            opacity:        open ? 1 : 0,
            transition:     'transform .44s cubic-bezier(.32,1,.55,1), opacity .28s ease',
          }}
        >
          {/* Glass top strip */}
          <div
            className="flex-shrink-0"
            style={{
              background: 'rgba(0,26,40,.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,.06)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-[3px] rounded-full"
                style={{ background: 'rgba(255,255,255,.18)' }}
              />
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-0 py-3 px-6">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center">
                  <button
                    onClick={() => i + 1 < step && onStepChange(i + 1)}
                    disabled={i + 1 > step}
                    aria-label={`Étape ${i + 1} : ${label}`}
                    className="flex items-center gap-2 cursor-pointer disabled:cursor-default"
                  >
                    <StepDot index={i} current={step} />
                    <span
                      className="text-[12px] font-semibold"
                      style={{
                        color: i + 1 === step
                          ? '#F5F1E8'
                          : i + 1 < step
                          ? 'rgba(255,65,3,.7)'
                          : 'rgba(245,241,232,.28)',
                      }}
                    >
                      {label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className="mx-3 h-px"
                      style={{
                        width: 28,
                        background: i + 1 < step
                          ? 'linear-gradient(90deg, rgba(255,65,3,.6), rgba(255,65,3,.2))'
                          : 'rgba(255,255,255,.08)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pt-4">
            {step === 1 && <Step1Route onNext={() => onStepChange(2)} />}
            {step === 2 && <Step2Price onNext={() => onStepChange(3)} onBack={() => onStepChange(1)} />}
            {step === 3 && <Step3Options onBack={() => onStepChange(2)} />}
          </div>
        </div>
      </div>
    </>
  )
}
