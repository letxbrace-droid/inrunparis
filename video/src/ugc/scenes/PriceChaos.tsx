import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Kicker } from "../Kicker";
import { Odometer } from "../Odometer";
import { Panel, Reflect } from "../Panel";
import { Stage } from "../Stage";
import { ACCENT, handheld, INK, INK_DIM, POP } from "../theme";
import { CONDENSED, MONO } from "../fonts";

// The surge, as it actually happens: a price that was true when you opened the
// app and is not true when you get in.
const STEPS = [
  { at: 4, value: 42, label: "à l'ouverture", time: "16:38" },
  { at: 26, value: 58, label: "après 3 min d'attente", time: "16:41" },
  { at: 48, value: 71, label: "au moment de monter", time: "16:43" },
];

const PANEL_W = 760;
const PANEL_H = 158;
const PITCH = 150;

function Row({ step, active }: { step: (typeof STEPS)[number]; active: boolean }) {
  return (
    <Panel width={PANEL_W} height={PANEL_H} radius={22}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 44px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 23,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: active ? ACCENT : INK_DIM,
            }}
          >
            {step.time}
          </div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 44, color: INK, marginTop: 6 }}>
            {step.label}
          </div>
        </div>
        <div
          style={{
            fontFamily: CONDENSED,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: active ? ACCENT : "rgba(245,241,232,0.4)",
          }}
        >
          {step.value} €
        </div>
      </div>
      {/* The live row is lit along its leading edge by the shaft behind it. */}
      {active ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 22,
            boxShadow: "inset 0 0 0 1px rgba(255,90,31,.5), inset 0 1px 0 rgba(255,190,150,.55)",
            background: "linear-gradient(180deg, rgba(255,90,31,.11) 0%, transparent 62%)",
          }}
        />
      ) : null}
    </Panel>
  );
}

/** The shared tilt. Both the stack and its reflection must use exactly this
 *  one, or the mirror disagrees with the object about where the floor is. */
function Tilted({ children }: { readonly children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        // A real tilt, not a hint of one. At 10° the cards read as flat
        // rectangles that happen to overlap; at 24° they read as objects
        // lying one behind another on a surface.
        rotate: "x 24deg",
      }}
    >
      {children}
    </div>
  );
}

function Stack({
  shown,
  current,
  frame,
}: {
  readonly shown: typeof STEPS;
  readonly current: (typeof STEPS)[number];
  readonly frame: number;
}) {
  return (
    <>
      {shown.map((step, i) => {
        const t = frame - step.at;
        return (
          <div
            key={step.value}
            style={{
              position: "absolute",
              top: i * PITCH,
              left: 0,
              // Each card lands closer to camera than the one it replaced, so
              // the pile grows towards the viewer rather than away from them.
              translate: `0 ${interpolate(t, [0, 16], [-80, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: POP,
              })}px ${i * 70}px`,
              opacity: interpolate(t, [0, 9], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <Row step={step} active={step === current} />
          </div>
        );
      })}
    </>
  );
}

/**
 * Scene 2 — the problem, stated as a number rather than a complaint.
 *
 * The quotes stack up as physical cards on a lit stage: each new price lands
 * in front of the one it replaced, and the ones it replaced stay visible
 * behind it. A single figure that changes states a price; a pile that grows
 * states a pattern, which is the actual subject.
 */
export const PriceChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const current = STEPS.filter((s) => frame >= s.at).pop() ?? STEPS[0];
  const shown = STEPS.filter((s) => frame >= s.at);

  return (
    <Stage
      intensity={interpolate(frame, [0, 48, 80], [0.5, 1, 1.3], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })}
      horizon={74}
    >
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 160 }}>
        <Kicker index="02" delay={4}>
          Le prix qui monte
        </Kicker>
      </AbsoluteFill>

      {/* The running total — the status readout, not the headline. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 258 }}>
        <Panel
          width={330}
          height={120}
          radius={26}
          style={{
            opacity: interpolate(frame, [8, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                fontFamily: CONDENSED,
                fontWeight: 800,
                fontSize: 88,
                lineHeight: 0.84,
                letterSpacing: "-0.03em",
                color: INK,
              }}
            >
              <Odometer value={current.value} at={current.at} size={88} />
              <span style={{ color: ACCENT, marginLeft: 10 }}>€</span>
            </div>
          </div>
        </Panel>
      </AbsoluteFill>

      {/* The stack, in perspective, standing on the floor and reflected in it.
          A giant figure above it as well would be two headlines competing —
          the top card already is the figure. */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          perspective: 1500,
          perspectiveOrigin: "50% 42%",
          paddingTop: 170,
          ...handheld(frame, 0.45, 1),
        }}
      >
        <div style={{ position: "relative", width: PANEL_W, height: PANEL_H + PITCH * 2, transformStyle: "preserve-3d" }}>
          <Tilted>
            <Stack shown={shown} current={current} frame={frame} />
          </Tilted>
          {/* The mirror wraps the tilted stack rather than living inside it.
              Put inside, the reflection is part of the same 3D space: the
              rotation pushes it away from camera and down past the floor, and
              it is never seen. Outside, it mirrors what the camera actually
              sees — which is what a floor does. */}
          <Reflect height={PANEL_H + PITCH * 2} opacity={0.4} blur={8} gap={16} perspective={1500}>
            <Tilted>
              <Stack shown={shown} current={current} frame={frame} />
            </Tilted>
          </Reflect>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 132 }}>
        <Caption
          name="Surge"
          from={68}
          durationInFrames={34}
          premountFor={fps}
          highlight="monte"
          accentColor={ACCENT}
          size={78}
        >
          Il monte pendant que t'attends.
        </Caption>
      </AbsoluteFill>
    </Stage>
  );
};
