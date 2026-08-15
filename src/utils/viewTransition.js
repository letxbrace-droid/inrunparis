import { flushSync } from 'react-dom'

/**
 * Run a state update inside a browser View Transition.
 *
 * The browser snapshots the page, runs the callback, then cross-fades between
 * the old and new snapshots. React batches updates asynchronously, so the
 * callback is wrapped in flushSync — otherwise React would re-render *after*
 * the snapshot and the transition would capture the wrong frame.
 *
 * Progressive enhancement: where the API is missing (or the user asked for
 * reduced motion) the update simply runs as before, with no animation.
 */
export function withViewTransition(update) {
  const supported = typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
  const reduced   = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!supported || reduced) { update(); return }

  document.startViewTransition(() => flushSync(update))
}
