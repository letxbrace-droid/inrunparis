import { useState } from 'react'

export default function FloatingInput({
  label, value, onChange, type = 'text',
  placeholder = ' ', autoComplete, inputMode, required,
  className = '',
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0
  const raised   = focused || hasValue

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        className="
          w-full pt-6 pb-2 px-4 rounded-2xl
          bg-bg-elevated border border-[var(--rule-strong)]
          text-ink-primary text-base placeholder-transparent
          focus:outline-none focus:border-accent
          transition-colors duration-200
        "
      />
      <label
        className={`
          absolute left-4 pointer-events-none
          text-ink-muted transition-all duration-200
          ${raised ? 'top-2 text-xs text-accent' : 'top-1/2 -translate-y-1/2 text-sm'}
        `}
      >
        {label}
      </label>
    </div>
  )
}
