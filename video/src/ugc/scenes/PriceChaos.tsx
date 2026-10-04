import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { ACCENT, BG, handheld, INK, INK_DIM, OUT, POP } from "../theme";
import { DISPLAY } from "../fonts";

// The surge, as it actually happens: a price that was true when you opened the
// app and is not true when you get in.
const STEPS = [
  { at: 6,  value: 42, label: "à l'ouverture" },
  { at: 26, value: 58, label: "après 3 min d'attente" },
  { at: 46, value: 71, label: "au moment de monter" },
];

/**
 * Scene 2 — the problem, stated as a number rather than a complaint.
 *
 * The figure is what does the arguing. Each jump is a hard cut with a shake,
 * because the feeling being reproduced is not "the price rose" but "the price
 * rose again".
 */
export const PriceChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const current = STEPS.filter((s) => frame >= s.at).pop() ?? STEPS[0];
  const sinceJump = frame - current.at;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 10,
          ...handheld(frame, 0.9, 1),
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 300,
            lineHeight: 0.86,
            letterSpacing: "-0.06em",
            color: INK,
            textShadow: "0 20px 80px rgba(0,0,0,.9)",
            // Every jump punches the number up and lets it settle.
            scale: interpolate(sinceJump, [0, 3, 14], [1.16, 1.02, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: POP,
              output: "perceptual-scale",
            }),
          }}
        >
          {current.value}
          <span style={{ color: ACCENT }}> €</span>
        </div>

        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 42,
            color: INK_DIM,
            letterSpacing: "-0.01em",
            opacity: interpolate(sinceJump, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          {current.label}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 230 }}>
        <Caption
          name="Surge"
          from={62}
          durationInFrames={40}
          premountFor={fps}
          highlight="monte"
          accentColor={ACCENT}
          size={86}
        >
          Le même trajet. Le prix qui monte pendant que t'attends.
        </Caption>
      </AbsoluteFill>

      <Grade warmth={0.4} />
    </AbsoluteFill>
  );
};
