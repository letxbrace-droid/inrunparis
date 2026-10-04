import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { Kicker } from "../Kicker";
import { AppScreen } from "../AppScreen";
import { PhoneFrame } from "../PhoneFrame";
import { ACCENT, BG, handheld, OUT } from "../theme";

/**
 * Scene 3 — the app itself, which is the only scene that has to convince.
 *
 * The phone rises into frame once and then stays put, drifting only with the
 * hand. Everything else that moves is on the screen, where the viewer is
 * already looking — a phone that keeps swooping around steals attention from
 * the product it is supposed to be showing.
 */
export const AppDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Accent bloom behind the device, so it sits in light rather than on black */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 42% at 50% 56%, ${ACCENT}26 0%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: interpolate(frame, [0, 28], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          }),
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneFrame
          style={{
            // 0.72 puts the 648×1371 device at 986px tall inside 1920 — large
            // enough to read the price card, with the top third still free for
            // the chapter label and the caption.
            scale: interpolate(frame, [0, 26], [0.60, 0.72], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
            translate: interpolate(frame, [0, 26], ["0px 340px", "0px 150px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            rotate: handheld(frame, 0.7).rotate,
            opacity: interpolate(frame, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <AppScreen />
        </PhoneFrame>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 72 }}>
        <Kicker index="03" delay={10}>
          La réservation
        </Kicker>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 140 }}>
        <Caption
          name="Tu tapes"
          from={22}
          durationInFrames={70}
          premountFor={fps}
          highlight="adresse."
          accentColor={ACCENT}
          size={78}
        >
          Tu tapes ton adresse.
        </Caption>
        <Caption
          name="Prix affiche"
          from={100}
          durationInFrames={74}
          premountFor={fps}
          highlight="avant"
          accentColor={ACCENT}
          size={78}
        >
          Le prix s'affiche avant de monter.
        </Caption>
        <Caption
          name="Et il bouge pas"
          from={176}
          durationInFrames={40}
          premountFor={fps}
          highlight="bouge plus."
          accentColor={ACCENT}
          size={78}
        >
          Et il bouge plus.
        </Caption>
      </AbsoluteFill>

      <Grade warmth={0.7} />
    </AbsoluteFill>
  );
};
