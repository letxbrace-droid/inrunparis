// Brand tokens, lifted straight from the PWA's globals.css so the video and the
// app cannot drift apart. Changing a colour here changes it everywhere in the
// UGC cut.
import { Easing } from "remotion";
import { noise2D } from "@remotion/noise";

export const BG = "#050505";
export const INK = "#F5F1E8";
export const INK_DIM = "rgba(245,241,232,0.56)";
export const INK_FAINT = "rgba(245,241,232,0.26)";
export const ACCENT = "#FF5A1F";
export const ACCENT_DEEP = "#E84000";
export const SURFACE = "#0E0F12";
export const HAIRLINE = "rgba(245,241,232,0.10)";
export const WHATSAPP = "#25D366";

// Decelerating ease for anything entering frame.
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
// Overshoots slightly — for stamps, badges, anything that should land hard.
export const POP = Easing.bezier(0.34, 1.56, 0.64, 1);
// Fast out of the gate, long tail — reads as a cut rather than a move.
export const SNAP = Easing.bezier(0.5, 0, 0.1, 1);

/**
 * Handheld camera drift.
 *
 * UGC reads as UGC because nothing is ever perfectly still. Two noise fields at
 * different periods keep the wander from looking like a loop, and the rotation
 * stays under a degree — past that it stops feeling like a hand and starts
 * feeling like an effect.
 */
export function handheld(frame: number, amp = 1, seed = 0) {
  return {
    translate: `${noise2D(`hx${seed}`, frame / 43, 0) * 9 * amp}px ${
      noise2D(`hy${seed}`, frame / 37, 0) * 12 * amp
    }px`,
    rotate: `${noise2D(`hr${seed}`, frame / 56, 0) * 0.45 * amp}deg`,
  };
}
