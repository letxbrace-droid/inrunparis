import React from "react";
import { HAIRLINE } from "./theme";

export const SCREEN_W = 620;
export const SCREEN_H = 1343;
const BEZEL = 14;
const RADIUS = 72;

/**
 * The phone the app is shown inside.
 *
 * Deliberately restrained: a bezel, a radius and an island. UGC footage is a
 * hand holding a phone, so the device should read as "a phone" in peripheral
 * vision and then get out of the way — anything more detailed starts competing
 * with the screen it exists to frame.
 */
export const PhoneFrame: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{
        position: "relative",
        width: SCREEN_W + BEZEL * 2,
        height: SCREEN_H + BEZEL * 2,
        borderRadius: RADIUS,
        padding: BEZEL,
        background: "linear-gradient(145deg, #2b2d33 0%, #0c0d10 42%, #232529 100%)",
        boxShadow:
          "0 60px 120px -30px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.07), inset 0 0 0 1px rgba(0,0,0,.6)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: RADIUS - BEZEL,
          overflow: "hidden",
          background: "#0b0c0e",
          // Clipping on a rounded parent leaks a hairline on some GPUs; an
          // inset ring covers the seam without changing the geometry.
          boxShadow: `inset 0 0 0 1px ${HAIRLINE}`,
        }}
      >
        {children}
        {/* Dynamic island — drawn above the screen content, as on the device */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            translate: "-50% 0",
            width: 148,
            height: 36,
            borderRadius: 18,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
};
