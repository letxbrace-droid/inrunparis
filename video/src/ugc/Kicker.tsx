import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ACCENT, INK_DIM, OUT } from "./theme";
import { MONO } from "./fonts";

/**
 * The small monospaced label above a caption.
 *
 * It costs four lines and does more for the premium read than any effect in
 * this project: it imposes a structure the viewer can feel — this is chapter
 * two of something deliberate, not a clip. The rule that draws itself out from
 * under it is what ties the label to the headline below.
 */
export const Kicker: React.FC<{
  readonly index: string;
  readonly children: string;
  readonly delay?: number;
  readonly style?: React.CSSProperties;
}> = ({ index, children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: MONO,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: "0.26em",
        textTransform: "uppercase",
        color: INK_DIM,
        opacity: interpolate(frame, [delay, delay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        }),
        ...style,
      }}
    >
      <span style={{ color: ACCENT, order: -1 }}>{index}</span>
      {children}
      {/* A rule on one side only pulls the whole block off centre. Two keeps
          the label optically centred while still drawing itself out — and a
          line that grows reads as something being written. */}
      <span
        style={{
          height: 1,
          background: "currentColor",
          opacity: 0.35,
          order: -1,
          width: interpolate(frame, [delay + 6, delay + 26], [0, 96], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          }),
        }}
      />
      <span
        style={{
          height: 1,
          background: "currentColor",
          opacity: 0.35,
          width: interpolate(frame, [delay + 6, delay + 26], [0, 96], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          }),
        }}
      />
    </div>
  );
};
