export default function GlassCard({ children, className = '', onClick, accent = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        card-neu rounded-3xl p-5 relative overflow-hidden
        ${onClick ? 'cursor-pointer active:scale-[.98] transition-transform duration-150' : ''}
        ${className}
      `}
      style={accent ? {
        borderTop: '2px solid #ff4103',
        boxShadow: '0 8px 24px rgba(0,0,0,.45), 0 0 32px rgba(255,65,3,.07)',
      } : undefined}
    >
      {accent && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-16 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,65,3,.07), transparent)' }}
        />
      )}
      {children}
    </div>
  )
}
