import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Grade } from "../Grade";
import { ACCENT, BG, HAIRLINE, INK, INK_DIM, OUT, POP } from "../theme";
import { DISPLAY, UI } from "../fonts";

/**
 * Scene 6 — the card.
 *
 * One name, one instruction. A UGC end card that lists four things gets none of
 * them remembered; this one asks for a single action and names the place to do
 * it, because the app is a PWA and "add to home screen" is the conversion.
 */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(52% 32% at 50% 44%, ${ACCENT}2E 0%, transparent 70%)`,
          filter: "blur(36px)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 34 }}>
        <CanvasImage
          src={staticFile("ugc/icon-512.png")}
          style={{
            width: 260,
            height: 260,
            borderRadius: 60,
            scale: interpolate(frame, [0, 18], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: POP,
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 128,
            letterSpacing: "-0.055em",
            color: INK,
            lineHeight: 1,
            opacity: interpolate(frame, [8, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            translate: interpolate(frame, [8, 24], ["0px 26px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          I&amp;N RUN
        </div>

        <div
          style={{
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 42,
            color: INK_DIM,
            letterSpacing: "-0.01em",
            opacity: interpolate(frame, [16, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          Chauffeur privé · Paris &amp; Île-de-France
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: UI,
            fontWeight: 700,
            fontSize: 40,
            color: INK,
            padding: "26px 52px",
            borderRadius: 999,
            background: "rgba(255,90,31,.12)",
            border: `1px solid ${HAIRLINE}`,
            opacity: interpolate(frame, [26, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            scale: interpolate(frame, [26, 42], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: POP,
              output: "perceptual-scale",
            }),
          }}
        >
          <span style={{ color: ACCENT }}>↓</span> Ajoute-la à ton écran d'accueil
        </div>
      </AbsoluteFill>

      <Grade warmth={1.1} />
    </AbsoluteFill>
  );
};
