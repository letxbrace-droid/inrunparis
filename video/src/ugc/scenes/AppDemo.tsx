import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Kicker } from "../Kicker";
import { Reflect } from "../Panel";
import { Stage } from "../Stage";
import { AppScreen } from "../AppScreen";
import { PhoneFrame, SCREEN_H } from "../PhoneFrame";
import { ACCENT, OUT } from "../theme";

const PHONE_H = SCREEN_H + 28;

function Device() {
  return (
    <PhoneFrame>
      <AppScreen />
    </PhoneFrame>
  );
}

/**
 * Scene 3 — the app itself, which is the only scene that has to convince.
 *
 * The phone stands on the floor in front of the shaft, reflected in it, and
 * turns a few degrees as the camera settles. It is a product shot, not a
 * screenshot: the reflection and the rim of light down its edge are what stop
 * it reading as a PNG pasted on a gradient.
 */
export const AppDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage
      intensity={interpolate(frame, [0, 30], [0.55, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: OUT,
      })}
      horizon={82}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 150,
          perspective: 2200,
          perspectiveOrigin: "50% 40%",
        }}
      >
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            // Settles out of a slight three-quarter turn rather than arriving
            // square on. The turn is what makes it an object in a room.
            rotate: `y ${interpolate(frame, [0, 54], [-15, -4], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            })}deg`,
            scale: interpolate(frame, [0, 26], [0.58, 0.7], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
            translate: `0 ${interpolate(frame, [0, 26], [300, 96], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            })}px`,
            opacity: interpolate(frame, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Device />
          <Reflect height={PHONE_H} opacity={0.3} blur={11} gap={10} perspective={2200}>
            <Device />
          </Reflect>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 72 }}>
        <Kicker index="03" delay={10}>
          Chez nous
        </Kicker>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 140 }}>
        <Caption name="Tu tapes" from={22} durationInFrames={70} premountFor={fps}
          highlight="adresse." accentColor={ACCENT} size={88}>
          Une adresse.
        </Caption>
        <Caption name="Prix affiche" from={100} durationInFrames={74} premountFor={fps}
          highlight="Avant" accentColor={ACCENT} size={88}>
          Un prix. Avant de monter.
        </Caption>
        <Caption name="Et il bouge pas" from={176} durationInFrames={40} premountFor={fps}
          highlight="bougera plus." accentColor={ACCENT} size={88}>
          Il ne bougera plus.
        </Caption>
      </AbsoluteFill>
    </Stage>
  );
};
