import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { ACCENT, BG, handheld, OUT } from "../theme";

/**
 * Scene 5 — the car and the person driving it.
 *
 * A platform cannot show you this frame: it does not know which car is coming.
 * That is the entire argument, so the car gets the screen to itself.
 */
export const Driver: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Ground light — the car needs something to sit on or it floats */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(38% 9% at 50% 58%, ${ACCENT}3A 0%, ${ACCENT}12 42%, transparent 74%)`,
          filter: "blur(44px)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...handheld(frame, 0.6, 7) }}>
        <CanvasImage
          src={staticFile("ugc/swace-side.png")}
          style={{
            width: 920,
            // A slow push in, from slightly off-centre: a held shot, not a pan.
            scale: interpolate(frame, [0, 90], [0.92, 1.05], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
            translate: interpolate(frame, [0, 90], ["-26px 0px", "16px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            opacity: interpolate(frame, [0, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 }}>
        <Caption
          name="Meme chauffeur"
          from={16}
          durationInFrames={74}
          premountFor={fps}
          highlight="même."
          accentColor={ACCENT}
          size={90}
        >
          Un seul chauffeur. Toujours le même.
        </Caption>
      </AbsoluteFill>

      <Grade warmth={0.9} />
    </AbsoluteFill>
  );
};
