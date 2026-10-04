import React from "react";

/**
 * A glass UI card, as a physical object.
 *
 * Four things make a rectangle read as a pane of glass lying in a lit room,
 * and leaving any one out breaks it: a translucent dark fill rather than a
 * flat colour, a hairline border that is brighter along the top edge than the
 * bottom, a wide soft shadow underneath, and an inner highlight where the
 * light grazes the surface.
 */
export const Panel: React.FC<{
  readonly children?: React.ReactNode;
  readonly width: number;
  readonly height?: number;
  readonly radius?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, width, height, radius = 20, style }) => (
  <div
    style={{
      position: "relative",
      width,
      height,
      borderRadius: radius,
      background:
        "linear-gradient(158deg, rgba(42,43,48,.92) 0%, rgba(24,25,29,.94) 42%, rgba(14,15,18,.96) 100%)",
      border: "1px solid rgba(255,255,255,.1)",
      // The top edge catches the light, the bottom sits in its own shadow.
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(0,0,0,.5), 0 34px 70px -24px rgba(0,0,0,.9), 0 4px 18px -6px rgba(0,0,0,.7)",
      backdropFilter: "blur(14px)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Anything placed on the floor gets one of these under it.
 *
 * Takes the same children and draws them again, flipped and faded into the
 * floor. The fade lives on this wrapper and never on the flipped element: a
 * mask set on the flipped child flips with it, and the reflection then loses
 * exactly the end that touches the object.
 */
export const Reflect: React.FC<{
  readonly children: React.ReactNode;
  readonly height: number;
  readonly opacity?: number;
  readonly blur?: number;
  readonly gap?: number;
  /** Match the stage's perspective when the children are tilted in 3D. The
   *  mask wrapper flattens the 3D context, so without this the reflection
   *  renders its children flat while the object above them is in perspective,
   *  and the two visibly disagree. */
  readonly perspective?: number;
}> = ({ children, height, opacity = 0.34, blur = 7, gap = 6, perspective }) => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      top: `calc(100% + ${gap}px)`,
      left: 0,
      right: 0,
      height,
      WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.25) 34%, transparent 66%)",
      maskImage: "linear-gradient(180deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.25) 34%, transparent 66%)",
      pointerEvents: "none",
    }}
  >
    {/* The inner box needs an explicit size and a positioning context. Its
        children are absolutely positioned, so without them it collapses to
        zero height and the flip pivots around nothing — the reflection ends up
        outside the mask and never appears. */}
    <div
      style={{
        position: "relative",
        height,
        perspective,
        perspectiveOrigin: "50% 42%",
        scale: "1 -1",
        // Origin "center", not "top". Flipping about the top edge sends the
        // mirrored copy UP and out of this box — it lands on top of the object
        // it is supposed to be reflecting, where it is invisible against it.
        // About the centre, the content inverts in place and the object's
        // bottom edge meets the mirror's top edge, which is what a floor does.
        transformOrigin: "center center",
        opacity,
                // Dark glass at 20% over a near-black floor is arithmetically present
        // and visually nothing. The lift is what makes the mirror exist.
        filter: `blur(${blur}px) brightness(1.9) saturate(1.15)`,
      }}
    >
      {children}
    </div>
  </div>
);
