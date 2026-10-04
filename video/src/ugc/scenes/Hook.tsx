import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { ACCENT, BG, handheld, OUT } from "../theme";

/**
 * Scene 1 — the hook. Two and a half seconds to earn the rest.
 *
 * Headlights sweeping past in the dark: the scene says "a street at night"
 * before a single word is read, so the caption lands on a mood that is already
 * set rather than having to establish one.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={handheld(frame, 1.1)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -500,
              top: 240 + i * 330 + noise2D(`lt${i}`, frame / 60, 0) * 40,
              width: 900,
              height: 10 + i * 4,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${
                i % 2 ? "#FFE9D5" : ACCENT
              }, transparent)`,
              filter: `blur(${14 + i * 5}px)`,
              opacity: 0.5,
              // Each streak crosses the frame at its own pace — same direction,
              // different speeds, which is what makes it read as depth.
              translate: interpolate(
                frame,
                [0, 78],
                ["0px 0px", `${1900 + i * 420}px ${-120 - i * 40}px`],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 90px",
          ...handheld(frame, 0.5, 3),
        }}
      >
        <Caption
          name="Hook"
          from={4}
          durationInFrames={74}
          premountFor={fps}
          highlight="applis"
          accentColor={ACCENT}
          size={104}
          style={{
            scale: interpolate(frame, [4, 78], [1, 1.07], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
          }}
        >
          J'ai arrêté de commander mes VTC sur les applis.
        </Caption>
      </AbsoluteFill>

      <Grade />
    </AbsoluteFill>
  );
};
