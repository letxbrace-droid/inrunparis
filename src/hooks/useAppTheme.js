import useBookingStore from '../store/useBookingStore'

export default function useAppTheme() {
  const isDark = useBookingStore((s) => s.isDark)

  return isDark ? {
    isDark,
    bgBase:      '#050505',
    bgGrouped:   '#030303',
    bgHeader:    '#0D0D0D',
    bgPanel:     '#0B0B0B',
    bgCard:      '#111111',
    bgInput:     '#161616',
    bgInset:     '#141414',
    bgHover:     '#1A1A1A',
    bgAvatar:    '#0a1828',

    inkFull:     '#F5F1E8',
    inkHigh:     'rgba(245,241,232,.88)',
    inkMid:      'rgba(245,241,232,.72)',
    inkLow:      'rgba(245,241,232,.55)',
    inkMuted:    'rgba(245,241,232,.40)',
    inkDim:      'rgba(245,241,232,.28)',

    border:      'rgba(255,255,255,.07)',
    borderStrong:'rgba(255,255,255,.12)',
    borderFaint: 'rgba(255,255,255,.05)',
    borderXFaint:'rgba(255,255,255,.04)',
    divider:     'rgba(255,255,255,.06)',

    handle:      'rgba(255,255,255,.18)',
    overlay:     'rgba(0,0,0,.72)',
    scrim:       'rgba(0,0,0,.9)',

    backBtn:     { background: 'rgba(245,241,232,.06)', border: '1px solid rgba(245,241,232,.12)', color: 'rgba(245,241,232,.75)' },
    backLink:    'rgba(245,241,232,.55)',
    colorScheme: 'dark',
    inputScheme: 'dark',
  } : {
    isDark,
    bgBase:      '#F7F5F0',
    bgGrouped:   '#F2F0EC',
    bgHeader:    '#EFEDE8',
    bgPanel:     '#F0EDE8',
    bgCard:      '#FFFFFF',
    bgInput:     '#E8E5E0',
    bgInset:     '#EDEBE6',
    bgHover:     '#E5E3DE',
    bgAvatar:    '#E0DDD6',

    inkFull:     '#111111',
    inkHigh:     'rgba(17,17,17,.88)',
    inkMid:      'rgba(17,17,17,.72)',
    inkLow:      'rgba(17,17,17,.58)',
    inkMuted:    'rgba(17,17,17,.45)',
    inkDim:      'rgba(17,17,17,.30)',

    border:      'rgba(0,0,0,.09)',
    borderStrong:'rgba(0,0,0,.14)',
    borderFaint: 'rgba(0,0,0,.07)',
    borderXFaint:'rgba(0,0,0,.05)',
    divider:     'rgba(0,0,0,.08)',

    handle:      'rgba(0,0,0,.15)',
    overlay:     'rgba(0,0,0,.35)',
    scrim:       'rgba(0,0,0,.5)',

    backBtn:     { background: 'rgba(17,17,17,.06)', border: '1px solid rgba(17,17,17,.14)', color: 'rgba(17,17,17,.65)' },
    backLink:    'rgba(17,17,17,.50)',
    colorScheme: 'light',
    inputScheme: 'light',
  }
}
