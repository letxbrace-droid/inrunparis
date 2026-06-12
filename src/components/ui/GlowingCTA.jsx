export default function GlowingCTA({ children, onClick, disabled, type = 'button', className = '', variant = 'accent' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variant === 'wa' ? 'cta-wa' : 'cta-glow'}
        relative flex items-center justify-center gap-2.5
        w-full py-4 px-6 rounded-2xl
        text-white font-bold text-[15px] tracking-wide
        transition-transform duration-150 cursor-pointer
        active:scale-[.97]
        disabled:opacity-55 disabled:pointer-events-none
        select-none overflow-hidden
        ${className}
      `}
    >
      {/* Top luminous edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent)', zIndex: 1 }}
      />
      {/* Content sits above ::before sweep */}
      <span className="relative flex items-center gap-2.5" style={{ zIndex: 1 }}>
        {children}
      </span>
    </button>
  )
}
