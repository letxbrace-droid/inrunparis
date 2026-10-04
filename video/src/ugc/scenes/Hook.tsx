import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Stage } from "../Stage";
import { ACCENT, handheld, OUT } from "../theme";

/**
 * Scene 1 — the hook. Two and a half seconds to earn the rest.
 *
 * The room is almost dark and the shaft is only an ember; it brightens under
 * the line as it is spoken. Opening on a lit stage would waste the arrival,
 * and the arrival is the only thing this scene has.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage
      intensity={interpolate(frame, [0, 26, 78], [0.18, 0.7, 1.05], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: OUT,
      })}
      horizon={78}
    >
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
          highlight="71"
          accentColor={ACCENT}
          size={108}
          style={{
            scale: interpolate(frame, [4, 78], [1, 1.06], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
          }}
        >
          Tu commandes à 42 €. Tu montes à 71 €.
        </Caption>
      </AbsoluteFill>
    </Stage>
  );
};
