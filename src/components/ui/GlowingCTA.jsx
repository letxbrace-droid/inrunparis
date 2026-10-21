const vibe = () => navigator.vibrate?.(10)

export default function GlowingCTA({ children, onClick, disabled, type = 'button', className = '', variant = 'accent' }) {
  const handleClick = () => { vibe(); onClick?.() }
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${variant === 'wa' ? 'cta-wa' : 'cta-glow'}
        relative flex items-center justify-center gap-2.5
        w-full py-4 px-6 rounded-2xl
        font-bold text-[14px] tracking-wide
        transition-transform duration-150 cursor-pointer
        active:scale-[.97]
        disabled:opacity-55 disabled:pointer-events-none
        select-none overflow-hidden
        ${className}
      `}
    >
      {/* Le contenu passe au-dessus du balayage ::before */}
      <span className="relative flex items-center gap-2.5" style={{ zIndex: 1 }}>
        {children}
      </span>
    </button>
  )
}
