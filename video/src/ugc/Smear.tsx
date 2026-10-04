import React, { useId } from "react";

/**
 * Directional motion blur.
 *
 * This is the thing that separates motion design from CSS animation. A word
 * that travels 180px in four frames and stays perfectly sharp the whole way
 * does not look fast, it looks like a browser repainting; the same move with
 * the pixels smeared along its path looks like it was rendered. Every
 * reference in this project has it on every fast move.
 *
 * `filter: blur()` cannot do it — CSS blur is isotropic, and a word moving
 * straight up that is also blurred sideways reads as out of focus rather than
 * as travelling. feGaussianBlur takes two standard deviations, so the smear
 * can run along the axis of travel and nowhere else.
 *
 * Remotion's own <HtmlInCanvasMotionBlur> is better — it averages real
 * sub-frame samples — but it needs Chrome 149 and this project renders on
 * whatever Chrome is to hand. This works everywhere.
 */
export const Smear: React.FC<{
  readonly children: React.ReactNode;
  /** Standard deviation along x, in px. */
  readonly x?: number;
  /** Standard deviation along y, in px. */
  readonly y?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, x = 0, y = 0, style }) => {
  const id = `smear-${useId().replace(/[:]/g, "")}`;
  const off = x < 0.05 && y < 0.05;

  return (
    <div style={{ position: "relative", ...style }}>
      {off ? null : (
        <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
          <defs>
            {/* The filter region has to be generous or the smear is clipped
                at the element's own bounds and ends in a hard edge. */}
            <filter id={id} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`${x} ${y}`} />
            </filter>
          </defs>
        </svg>
      )}
      <div style={off ? undefined : { filter: `url(#${id})` }}>{children}</div>
    </div>
  );
};
