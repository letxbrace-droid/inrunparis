import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CONDENSED } from "./fonts";
import { OUT } from "./theme";
import { Smear } from "./Smear";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * A price that rolls rather than cuts.
 *
 * Swapping 58 for 71 changes a number; rolling each column to its new digit
 * shows a mechanism moving, and a mechanism moving is what a meter does. That
 * is the association the scene wants — this is not a price being quoted, it is
 * a meter running while you wait.
 *
 * Each column rolls at a slightly different rate, because columns that land
 * together read as a single image sliding, not as wheels.
 */
export const Odometer: React.FC<{
  readonly value: number;
  readonly at: number;
  readonly size: number;
}> = ({ value, at, size }) => {
  const frame = useCurrentFrame();
  const digits = String(value).split("").map(Number);
  const h = size * 0.82;

  return (
    <Smear
      y={interpolate(frame, [at, at + 5, at + 20], [26, 16, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })}
      style={{ display: "inline-flex", height: h, alignItems: "flex-start" }}
    >
    <span style={{ display: "inline-flex", height: h, overflow: "hidden", alignItems: "flex-start" }}>
      {digits.map((d, i) => (
        <span
          key={i}
          style={{
            display: "block",
            height: h,
            overflow: "hidden",
            fontFamily: CONDENSED,
            fontWeight: 800,
            fontSize: size,
            lineHeight: `${h}px`,
            letterSpacing: "-0.03em",
          }}
        >
          <span
            style={{
              display: "block",
              translate: `0 ${-d * h + interpolate(
                frame,
                [at, at + 16 + i * 4],
                [h * 2.4, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT },
              )}px`,
            }}
          >
            {DIGITS.map((n) => (
              <span key={n} style={{ display: "block", height: h }}>
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
    </Smear>
  );
};
