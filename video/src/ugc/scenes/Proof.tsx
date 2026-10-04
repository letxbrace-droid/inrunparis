import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { Kicker } from "../Kicker";
import { ACCENT, BG, handheld, HAIRLINE, INK, INK_DIM, OUT, WHATSAPP } from "../theme";
import { UI } from "../fonts";

// The actual exchange, not a dramatised one: this is the message the app sends
// and the answer that comes back.
const THREAD = [
  { at: 4,  mine: true,  text: "Paris 11e → CDG T2E, demain 5h15. 45 € ?", time: "16:41" },
  { at: 30, mine: false, text: "C'est noté 👍 Je serai en bas à 5h05.", time: "16:42" },
  { at: 54, mine: false, text: "Suzuki Swace brun foncé, je me gare devant le 14.", time: "16:42" },
];

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
    <AbsoluteFill style={{ background: BG, fontFamily: UI }}>
      <AbsoluteFill
        style={{
          padding: "0 86px",
          justifyContent: "center",
          gap: 24,
          ...handheld(frame, 0.7, 5),
        }}
      >
        {THREAD.map((m) => (
          <div
            key={m.text}
            style={{
              alignSelf: m.mine ? "flex-end" : "flex-start",
              maxWidth: 760,
              borderRadius: 34,
              borderBottomRightRadius: m.mine ? 10 : 34,
              borderBottomLeftRadius: m.mine ? 34 : 10,
              padding: "26px 32px 20px",
              background: m.mine ? "#103C26" : "#16181C",
              border: `1px solid ${m.mine ? "rgba(37,211,102,.26)" : HAIRLINE}`,
              color: INK,
              fontSize: 44,
              fontWeight: 500,
              lineHeight: 1.26,
              letterSpacing: "-0.015em",
              boxShadow: "0 24px 60px -18px rgba(0,0,0,.9)",
              opacity: interpolate(frame, [m.at, m.at + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: OUT,
              }),
              // Bubbles arrive from the side they belong to, the way they do
              // in the app itself.
              translate: interpolate(
                frame,
                [m.at, m.at + 14],
                [`${m.mine ? 70 : -70}px 30px`, "0px 0px"],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT },
              ),
            }}
          >
            {m.text}
            <div
              style={{
                marginTop: 10,
                fontSize: 22,
                color: INK_DIM,
                textAlign: "right",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {m.time}
              {m.mine ? <span style={{ color: WHATSAPP }}>✓✓</span> : null}
            </div>
          </div>
        ))}
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 196 }}>
        <Kicker index="04" delay={2}>
          La confirmation
        </Kicker>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 190 }}>
        <Caption
          name="Deux minutes"
          from={74}
          durationInFrames={40}
          premountFor={fps}
          highlight="deux minutes."
          accentColor={ACCENT}
          size={88}
        >
          Confirmé en deux minutes.
        </Caption>
      </AbsoluteFill>

      <Grade warmth={0.5} />
    </AbsoluteFill>
  );
};
