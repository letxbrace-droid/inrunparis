import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { OUT } from "./theme";

/**
 * The first eight frames of every scene.
 *
 * A hard cut between two static frames is just a change of picture. The same
 * cut where the incoming scene is still settling — a hair over-scaled, a hair
 * soft, for a quarter of a second — reads as a camera arriving. Land a whoosh
 * and an impact on the same frame and it stops being an edit and becomes a
 * beat.
 */
export const CutIn: React.FC<{
  readonly children: React.ReactNode;
  readonly from?: number;
  readonly strength?: number;
}> = ({ children, from = 1.055, strength = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, 9], [from, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
          output: "perceptual-scale",
        }),
        filter: `blur(${interpolate(frame, [0, 7], [5 * strength, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        })}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
