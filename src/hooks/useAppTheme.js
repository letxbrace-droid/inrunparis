import useBookingStore from '../store/useBookingStore'

// Thin JS view over the CSS design tokens (src/styles/globals.css).
// Every color is a var() reference so dark/light values live in ONE place;
// only color-scheme keywords still depend on isDark.
export default function useAppTheme() {
  const isDark = useBookingStore((s) => s.isDark)
  const scheme = isDark ? 'dark' : 'light'

  return {
    isDark,
    bgBase:      'var(--bg-base)',
    bgGrouped:   'var(--bg-grouped)',
    bgHeader:    'var(--bg-header)',
    bgPanel:     'var(--bg-panel)',
    bgCard:      'var(--bg-card)',
    bgInput:     'var(--bg-input)',
    bgInset:     'var(--bg-inset)',
    bgHover:     'var(--bg-hover)',
    bgAvatar:    'var(--bg-avatar)',

    inkFull:     'var(--label)',
    inkHigh:     'var(--label)',
    inkMid:      'var(--label-secondary)',
    inkLow:      'var(--label-tertiary)',
    inkMuted:    'var(--label-tertiary)',
    inkDim:      'var(--label-quaternary)',

    border:      'var(--separator)',
    borderStrong:'var(--separator-strong)',
    borderFaint: 'var(--separator-faint)',
    borderXFaint:'var(--separator-faint)',
    divider:     'var(--separator)',

    handle:      'var(--handle)',
    overlay:     'var(--overlay)',
    scrim:       'var(--scrim)',

    backBtn:     { background: 'var(--fill)', border: '1px solid var(--separator-strong)', color: 'var(--label-secondary)' },
    backLink:    'var(--label-secondary)',
    colorScheme: scheme,
    inputScheme: scheme,
  }
}
