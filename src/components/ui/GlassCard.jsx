export default function GlassCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        glass rounded-3xl p-5
        ${onClick ? 'cursor-pointer active:scale-[.98] transition-transform duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
