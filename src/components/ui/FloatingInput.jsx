import { useId, useState } from 'react'
import useAppTheme from '../../hooks/useAppTheme'

export default function FloatingInput({
  label, value, onChange, type = 'text',
  placeholder = ' ', autoComplete, inputMode, required,
  className = '',
}) {
  const th = useAppTheme()
  // Le libellé flottant n'était relié à rien : un <label> posé à côté d'un
  // <input>, sans htmlFor ni id. À l'écran on lit « Prénom » ; au lecteur
  // d'écran, un champ de saisie sans nom — dans le formulaire qui collecte
  // justement le nom et l'email du client. Toucher le libellé ne donnait pas
  // le focus non plus.
  const id = useId()
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0
  const raised   = focused || hasValue

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        className="w-full pt-6 pb-2 px-4 rounded-2xl text-base outline-none"
        style={{
          background: th.bgInput,
          border: focused ? '1px solid color-mix(in srgb, var(--accent) 40%, transparent)' : `1px solid ${th.border}`,
          boxShadow: focused
            ? '0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)'
            : 'none',
          color: th.inkFull,
          transition: 'border-color .2s, box-shadow .2s',
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none transition-all duration-200"
        style={{
          top:           raised ? '8px' : '50%',
          transform:     raised ? 'none' : 'translateY(-50%)',
          fontSize:      raised ? '11px' : '14px',
          color:         raised ? 'var(--accent)' : th.inkMuted,
          fontWeight:    raised ? 600 : 400,
          letterSpacing: raised ? '.04em' : 'normal',
        }}
      >
        {label}
      </label>
    </div>
  )
}
