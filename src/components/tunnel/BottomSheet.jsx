import Step1Route   from './Step1_Route'
import Step2Price   from './Step2_Price'
import Step3Options from './Step3_Options'

const STEPS = ['Trajet', 'Tarif', 'Options']

export default function BottomSheet({ open, step, onStepChange, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0 z-[90] bg-black/40
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Réservation"
        className="
          fixed bottom-0 left-0 right-0 z-[95]
          flex justify-center
        "
      >
        <div
          className="
            w-full max-w-[560px]
            flex flex-col
            bg-gradient-to-b from-[#001A28] to-[#001621]
            border border-b-0 rounded-t-[22px] overflow-hidden
            transition-[transform,opacity] will-change-transform
          "
          style={{
            height: '93dvh',
            borderColor: 'rgba(255,65,3,.22)',
            boxShadow: '0 -12px 60px rgba(0,0,0,.7), 0 -1px 0 rgba(255,65,3,.12)',
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            opacity:   open ? 1 : 0,
            transition: 'transform .44s cubic-bezier(.32,1,.55,1), opacity .28s ease',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-9 h-1 bg-[var(--rule-strong)] rounded-full" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 pb-4 flex-shrink-0">
            {STEPS.map((label, i) => (
              <button
                key={label}
                onClick={() => i < step && onStepChange(i + 1)}
                disabled={i + 1 > step}
                aria-label={`Étape ${i + 1} : ${label}`}
                className="flex items-center gap-2 cursor-pointer disabled:cursor-default"
              >
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    transition-colors duration-200
                    ${step === i + 1 ? 'bg-accent text-white' : i + 1 < step ? 'bg-accent/30 text-accent' : 'bg-bg-elevated text-ink-muted'}
                  `}
                >
                  {i + 1}
                </div>
                <span className={`text-xs ${step === i + 1 ? 'text-ink-primary' : 'text-ink-muted'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-px ${i + 1 < step ? 'bg-accent/40' : 'bg-[var(--rule)]'}`} />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            {step === 1 && <Step1Route onNext={() => onStepChange(2)} />}
            {step === 2 && <Step2Price onNext={() => onStepChange(3)} onBack={() => onStepChange(1)} />}
            {step === 3 && <Step3Options onBack={() => onStepChange(2)} />}
          </div>
        </div>
      </div>
    </>
  )
}
