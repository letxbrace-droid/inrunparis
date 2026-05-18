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
        boxShadow: '5px 5px 20px rgba(0,0,0,.6), -2px -2px 8px rgba(255,255,255,.025), 0 0 40px rgba(255,65,3,.08)',
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
