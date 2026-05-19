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
        boxShadow: '0 4px 16px rgba(0,0,0,.6)',
      } : undefined}
    >
      {children}
    </div>
  )
}
