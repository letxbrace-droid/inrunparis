import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Kicker } from "../Kicker";
import { Panel, Reflect } from "../Panel";
import { Stage } from "../Stage";
import { Smear } from "../Smear";
import { ACCENT, INK, INK_DIM, OUT, WHATSAPP } from "../theme";
import { UI } from "../fonts";

// The actual exchange, not a dramatised one: this is the message the app sends
// and the answer that comes back.
const THREAD = [
  { at: 4, mine: true, text: "Paris 11e → CDG T2E, demain 5h15. 45 € ?", time: "16:41" },
  { at: 30, mine: false, text: "C'est noté 👍 Je serai en bas à 5h05.", time: "16:42" },
  { at: 54, mine: false, text: "Suzuki Swace brun foncé, je me gare devant le 14.", time: "16:42" },
];

const BUBBLE_W = 830;
const STACK_H = 620;

function Bubble({ m }: { readonly m: (typeof THREAD)[number] }) {
  return (
    <Panel
      width={BUBBLE_W}
      radius={34}
      style={{
        background: m.mine
          ? "linear-gradient(158deg, rgba(23,70,46,.95) 0%, rgba(14,46,30,.96) 100%)"
          : undefined,
        border: m.mine ? "1px solid rgba(37,211,102,.26)" : undefined,
        borderBottomRightRadius: m.mine ? 10 : 34,
        borderBottomLeftRadius: m.mine ? 34 : 10,
      }}
    >
      <div
        style={{
          padding: "28px 34px 20px",
          color: INK,
          fontFamily: UI,
          fontSize: 40,
          fontWeight: 500,
          lineHeight: 1.26,
          letterSpacing: "-0.015em",
        }}
      >
        {m.text}
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            color: INK_DIM,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {m.time}
          {m.mine ? <span style={{ color: WHATSAPP }}>✓✓</span> : null}
        </div>
      </div>
    </Panel>
  );
}

function Thread({ frame }: { readonly frame: number }) {
  return (
    <>
      {THREAD.map((m, i) => (
        <div
          key={m.text}
          style={{
            position: "absolute",
            top: i * 190,
            left: m.mine ? 60 : 0,
            // Each message sits a little closer to camera than the last, so
            // the thread advances towards the viewer as it is answered.
            translate: `${interpolate(frame, [m.at, m.at + 14], [m.mine ? 70 : -70, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            })}px 0 ${i * 50}px`,
            opacity: interpolate(frame, [m.at, m.at + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Smear
            x={interpolate(frame, [m.at, m.at + 4, m.at + 12], [28, 16, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            <Bubble m={m} />
          </Smear>
        </div>
      ))}
    </>
  );
}

/**
 * Scene 4 — the proof, which for this business is a human answering.
 *
 * No invented five-star carousel: a short thread where someone replies in a
 * minute is the whole differentiator against a platform, and it is checkable.
 */
export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage intensity={0.72} shaftX={54} horizon={80}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 168 }}>
        <Kicker index="04" delay={2}>
          La confirmation
        </Kicker>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 150,
          perspective: 1900,
          perspectiveOrigin: "50% 44%",
        }}
      >
        <div style={{ position: "relative", width: BUBBLE_W + 60, height: STACK_H, transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", rotate: "x 13deg" }}>
            <Thread frame={frame} />
          </div>
          <Reflect height={STACK_H} opacity={0.3} blur={10} gap={16} perspective={1900}>
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", rotate: "x 13deg" }}>
              <Thread frame={frame} />
            </div>
          </Reflect>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150 }}>
        <Caption
          name="Deux minutes"
          from={74}
          durationInFrames={40}
          premountFor={fps}
          highlight="deux minutes."
          accentColor={ACCENT}
          size={84}
        >
          Confirmé en deux minutes.
        </Caption>
      </AbsoluteFill>
    </Stage>
  );
};
