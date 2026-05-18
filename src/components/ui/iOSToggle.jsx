export default function iOSToggle({ checked, onChange, label, id }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 cursor-pointer select-none"
    >
      {label && (
        <span className="text-sm text-ink-secondary">{label}</span>
      )}
      <div className="relative flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${checked ? 'bg-accent' : 'bg-bg-elevated border border-[var(--rule-strong)]'}
          `}
        />
        <div
          className={`
            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
            transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </div>
    </label>
  )
}
