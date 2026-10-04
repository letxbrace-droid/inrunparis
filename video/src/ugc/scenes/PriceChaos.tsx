import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { Kicker } from "../Kicker";
import { ACCENT, BG, handheld, INK, INK_DIM, OUT, POP } from "../theme";
import { CONDENSED, MONO } from "../fonts";

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
  // The figure it just replaced, kept on screen and struck through. A number
  // that only ever shows its current value states a price; one that shows what
  // it used to be states a betrayal, which is the actual subject here.
  const previous = STEPS[STEPS.indexOf(current) - 1];

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
        {previous ? (
          <div
            style={{
              position: "relative",
              fontFamily: CONDENSED,
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 1,
              color: "rgba(245,241,232,0.3)",
              opacity: interpolate(sinceJump, [0, 10, 26], [0, 1, 0.55], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {previous.value} €
            <span
              style={{
                position: "absolute",
                left: -6,
                right: -6,
                top: "52%",
                height: 4,
                background: ACCENT,
                // The rule strikes through rather than appearing struck —
                // the gesture is the point.
                scale: `${interpolate(sinceJump, [2, 14], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: OUT,
                })} 1`,
                transformOrigin: "left center",
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            fontFamily: CONDENSED,
            fontWeight: 800,
            fontSize: 360,
            lineHeight: 0.82,
            letterSpacing: "-0.03em",
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
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 30,
            color: INK_DIM,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
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

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 230 }}>
        <Kicker index="02" delay={4}>
          Le prix qui monte
        </Kicker>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 230 }}>
        <Caption
          name="Surge"
          from={62}
          durationInFrames={40}
          premountFor={fps}
          highlight="monte"
          accentColor={ACCENT}
          size={88}
        >
          Il monte pendant que t'attends.
        </Caption>
      </AbsoluteFill>

      <Grade warmth={0.4} />
    </AbsoluteFill>
  );
};
