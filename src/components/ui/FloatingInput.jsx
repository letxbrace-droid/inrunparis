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
        className="w-full pt-6 pb-2 px-4 rounded-2xl text-base outline-none transition-all duration-200"
        style={{
          background: '#161616',
          boxShadow: 'none',
          border: focused ? '1px solid rgba(255,90,31,.4)' : '1px solid rgba(255,255,255,.08)',
          color: '#F5F1E8',
          transition: 'box-shadow .2s',
        }}
      />
      <label
        className="absolute left-4 pointer-events-none transition-all duration-200"
        style={{
          top:           raised ? '8px' : '50%',
          transform:     raised ? 'none' : 'translateY(-50%)',
          fontSize:      raised ? '11px' : '14px',
          color:         raised ? '#ff4103' : 'rgba(245,241,232,.4)',
          fontWeight:    raised ? 600 : 400,
          letterSpacing: raised ? '.04em' : 'normal',
        }}
      >
        {label}
      </label>
    </div>
  )
}
