import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { ACCENT } from "./theme";

/**
 * The room everything is shot in.
 *
 * A dark studio with one practical light: a vertical orange shaft standing
 * behind whatever is on stage, a glossy floor that catches it, and warm haze
 * in the air. Nothing here is decoration — it is the lighting rig, and it is
 * the reason glass panels floating in space read as objects rather than as
 * rectangles with borders. Panels need something to reflect and something to
 * stand in front of.
 */
export const Stage: React.FC<{
  /** 0 → the shaft is a dim ember, 1 → it is the brightest thing on screen. */
  readonly intensity?: number;
  /** Horizontal position of the shaft, in percent of frame width. */
  readonly shaftX?: number;
  /** Where the floor starts, in percent of frame height. */
  readonly horizon?: number;
  readonly children?: React.ReactNode;
}> = ({ intensity = 1, shaftX = 50, horizon = 72, children }) => {
  const frame = useCurrentFrame();
  // The shaft breathes. A light source that holds perfectly still reads as a
  // gradient; one that flickers a few percent reads as a lamp.
  const flicker = 1 + noise2D("shaft", frame / 11, 0) * 0.07;
  const I = intensity * flicker;

  return (
    <AbsoluteFill style={{ background: "#030304", overflow: "hidden" }}>
      {/* Warm haze — the air in the room */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 42% at ${shaftX}% 46%, rgba(255,110,46,${0.17 * I}) 0%, rgba(120,45,16,${0.08 * I}) 34%, transparent 68%)`,
          filter: "blur(30px)",
        }}
      />

      {/* The shaft itself: a wide bleed, then a narrow core. Two layers,
          because a single blurred bar has no hot centre and reads as fog. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, transparent ${shaftX - 9}%, rgba(255,120,50,${0.3 * I}) ${shaftX}%, transparent ${shaftX + 9}%)`,
          filter: "blur(44px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${shaftX}%`,
          top: "-6%",
          width: 10,
          height: `${horizon + 6}%`,
          translate: "-50% 0",
          background: `linear-gradient(180deg, transparent 0%, ${ACCENT} 26%, #FFD9B8 54%, ${ACCENT} 76%, transparent 100%)`,
          filter: "blur(5px)",
          opacity: 0.85 * I,
        }}
      />

      {/* Floor. The horizon line is what turns a gradient into a room. */}
      <div
        style={{
          position: "absolute",
          inset: `${horizon}% 0 0 0`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.055) 0%, rgba(10,10,12,.5) 7%, #060607 38%, #030304 100%)",
        }}
      />
      {/* The shaft's own pool of light on the floor, stretched by the angle */}
      <div
        style={{
          position: "absolute",
          left: `${shaftX}%`,
          top: `${horizon - 2}%`,
          width: "58%",
          height: "34%",
          translate: "-50% 0",
          background: `radial-gradient(50% 50% at 50% 0%, rgba(255,120,50,${0.34 * I}) 0%, rgba(255,110,46,${0.1 * I}) 36%, transparent 72%)`,
          filter: "blur(26px)",
        }}
      />

      {children}

      {/* Bokeh. Six orbs, drifting — depth cues that cost nothing and are the
          difference between "in a room" and "on a background". */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: `${12 + i * 15 + noise2D(`bx${i}`, frame / 90, 0) * 6}%`,
            top: `${26 + (i % 3) * 18 + noise2D(`by${i}`, frame / 80, 0) * 7}%`,
            width: 26 + (i % 3) * 30,
            height: 26 + (i % 3) * 30,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,150,90,${0.2 * I}) 0%, transparent 70%)`,
            filter: `blur(${8 + i * 3}px)`,
          }}
        />
      ))}

      {/* Grain + vignette, last, over everything */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")",
          backgroundPosition: `${noise2D("gx", frame / 2, 0) * 180}px ${noise2D("gy", frame / 2, 0) * 180}px`,
          opacity: 0.05,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 100% at 50% 46%, transparent 52%, rgba(0,0,0,.5) 84%, rgba(0,0,0,.88) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity: interpolate(frame, [0, 3], [0.09, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
