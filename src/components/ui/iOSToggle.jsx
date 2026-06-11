export default function iOSToggle({ checked, onChange, label, id }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 cursor-pointer select-none py-0.5"
    >
      {label && (
        <span className="text-sm" style={{ color: 'rgba(245,241,232,.7)' }}>{label}</span>
      )}
      <div className="relative flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        {/* Track */}
        <div
          className="w-11 h-6 rounded-full transition-all duration-250"
          style={{
            background: checked
              ? 'linear-gradient(135deg, #ff5a1f, #FF5A1F)'
              : '#1A1A1A',
            boxShadow: 'none',
            border: checked ? 'none' : '1px solid rgba(255,255,255,.08)',
          }}
        />
        {/* Knob */}
        <div
          className="absolute top-[2px] w-5 h-5 rounded-full transition-transform duration-250"
          style={{
            transform: checked ? 'translateX(22px)' : 'translateX(2px)',
            background: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.9)',
          }}
        />
      </div>
    </label>
  )
}
