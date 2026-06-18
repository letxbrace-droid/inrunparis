// navigator.vibrate is Android-only — iOS ignores it silently (no error)
const can = typeof navigator !== 'undefined' && 'vibrate' in navigator

export const haptic = {
  select:  () => can && navigator.vibrate(6),              // address pick, chip tap
  light:   () => can && navigator.vibrate(10),             // step advance, toggle
  medium:  () => can && navigator.vibrate(22),             // confirm, CTA press
  success: () => can && navigator.vibrate([18, 80, 28, 50, 40]), // booking sent ✓
  error:   () => can && navigator.vibrate([40, 30, 40]),   // validation fail
}
