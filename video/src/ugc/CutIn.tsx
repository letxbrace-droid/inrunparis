import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { OUT } from "./theme";
import { Smear } from "./Smear";

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
  const blur = interpolate(frame, [0, 6], [16 * strength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, 9], [from, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
          output: "perceptual-scale",
        }),
      }}
    >
      {/* The incoming frame is smeared along both axes for a sixth of a
          second. A cut between two sharp images is a change of picture; a cut
          where the new image is still resolving is a camera arriving. */}
      <Smear x={blur} y={blur} style={{ width: "100%", height: "100%" }}>
        {children}
      </Smear>
    </AbsoluteFill>
  );
};
