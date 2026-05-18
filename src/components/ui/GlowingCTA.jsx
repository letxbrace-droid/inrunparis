export default function GlowingCTA({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2
        w-full py-4 px-6 rounded-2xl
        bg-accent text-white font-bold text-base tracking-wide
        transition-all duration-200 cursor-pointer
        hover:bg-accent-2 active:scale-[.97]
        disabled:opacity-40 disabled:pointer-events-none
        select-none
        ${className}
      `}
      style={{ boxShadow: '0 0 28px rgba(255,65,3,0.40), 0 4px 20px rgba(0,0,0,0.5)' }}
    >
      {children}
    </button>
  )
}
