export default function TopBar({ onBurgerClick, burgerOpen }) {
  return (
    <header
      className="
        absolute top-0 left-0 right-0 z-20
        flex items-center justify-between
        px-5 pt-safe
        pointer-events-none
      "
      style={{ paddingTop: `calc(var(--safe-top) + 12px)` }}
    >
      {/* Burger */}
      <button
        onClick={onBurgerClick}
        aria-label="Menu principal"
        aria-expanded={burgerOpen}
        aria-controls="side-drawer"
        className="
          pointer-events-auto
          w-11 h-11 flex flex-col items-center justify-center gap-[5px]
          glass rounded-2xl cursor-pointer
          active:scale-95 transition-transform duration-150
        "
      >
        <span className={`
          block w-[18px] h-[1.5px] bg-ink-primary rounded-full
          transition-all duration-300 origin-center
          ${burgerOpen ? 'translate-y-[6.5px] rotate-45' : ''}
        `} />
        <span className={`
          block w-[18px] h-[1.5px] bg-ink-primary rounded-full
          transition-all duration-300
          ${burgerOpen ? 'opacity-0 scale-x-0' : ''}
        `} />
        <span className={`
          block w-[18px] h-[1.5px] bg-ink-primary rounded-full
          transition-all duration-300 origin-center
          ${burgerOpen ? '-translate-y-[6.5px] -rotate-45' : ''}
        `} />
      </button>

      {/* Spacer right */}
      <div className="w-11 h-11" aria-hidden="true" />
    </header>
  )
}
