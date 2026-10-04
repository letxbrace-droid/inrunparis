import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { ACCENT } from "./theme";

/**
 * The grade that sits over every scene: vignette, a warm lift from below, and
 * a flicker of grain.
 *
 * It is what stops six separately-built scenes from looking like six separate
 * videos. The grain in particular is doing quiet work — a perfectly clean
 * gradient reads as a render, and UGC must never read as a render.
 */
export const Grade: React.FC<{ readonly warmth?: number }> = ({ warmth = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% 108%, ${ACCENT}22 0%, ${ACCENT}0A 30%, transparent 56%)`,
          mixBlendMode: "soft-light",
          opacity: warmth,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(135% 105% at 50% 44%, transparent 56%, rgba(0,0,0,.42) 86%, rgba(0,0,0,.78) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          // Grain is cheap as a repeating SVG noise texture, and jittering its
          // offset per frame keeps it alive instead of frozen on top.
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
          backgroundPosition: `${noise2D("gx", frame / 2, 0) * 180}px ${
            noise2D("gy", frame / 2, 0) * 180
          }px`,
          opacity: 0.055,
          mixBlendMode: "overlay",
        }}
      />
      {/* Opening flash — one frame of light on every cut, like a camera settling */}
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity: interpolate(frame, [0, 3], [0.1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
