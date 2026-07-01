/**
 * I&N RUN A→B mark — vertical variant of « Le Tracé ».
 *
 * One canonical origin→destination column: filled accent dot (origin) → a
 * gradient route line that stretches to fill available height → hollow accent
 * ring (destination). Placed beside a two-line address block it reads as the
 * same journey mark used across the app, instead of each screen redrawing it.
 *
 * `bg` is the surface colour behind the hollow ring (so its centre matches the
 * card it sits on).
 */
export default function RouteTimeline({ bg, dotSize = 8, minLine = 18, className = '', style }) {
  return (
    <div
      className={`flex flex-col items-center flex-shrink-0 ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* Origin — filled dot */}
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: dotSize, height: dotSize, background: 'var(--accent)' }}
      />
      {/* Route — stretching gradient line */}
      <span
        className="w-px flex-1 my-1"
        style={{
          minHeight: minLine,
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 45%, transparent), color-mix(in srgb, var(--accent) 10%, transparent))',
        }}
      />
      {/* Destination — hollow ring */}
      <span
        className="rounded-full flex-shrink-0 border-2"
        style={{
          width: dotSize,
          height: dotSize,
          borderColor: 'color-mix(in srgb, var(--accent) 65%, transparent)',
          background: bg,
        }}
      />
    </div>
  )
}
