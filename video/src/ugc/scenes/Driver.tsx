import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption } from "../Caption";
import { Grade } from "../Grade";
import { Kicker } from "../Kicker";
import { ACCENT, BG, handheld, OUT } from "../theme";

const CAR = "ugc/swace-3d.png";
const CAR_W = 1010;
const CAR_H = Math.round((CAR_W * 355) / 720); // keep the source's exact ratio

/**
 * Scene 5 — the car, shot like a car.
 *
 * A platform cannot show you this frame: it does not know which vehicle is
 * coming. That is the whole argument of the business, so the car gets the
 * screen to itself and gets lit properly rather than pasted on black.
 *
 * Three things do the lighting, and none of them is a filter on the photo:
 * a floor the car can stand on, its own reflection in that floor, and a
 * specular sweep clipped to the bodywork by using the PNG as its own mask.
 */
export const Driver: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Floor: a horizon, not a gradient wash. The car needs a plane. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #050505 0%, #0A0B0E 42%, #16181D 50%, #121419 58%, #09090B 78%, #050505 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(42% 10% at 50% 55%, ${ACCENT}44 0%, ${ACCENT}14 40%, transparent 76%)`,
          filter: "blur(46px)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...handheld(frame, 0.55, 7) }}>
        <div
          style={{
            position: "relative",
            width: CAR_W,
            height: CAR_H,
            translate: interpolate(frame, [0, 90], ["0px -56px", "0px -72px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            // A slow push in. Cars are sold on a dolly move, never on a cut.
            scale: interpolate(frame, [0, 90], [0.9, 1.02], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Img src={staticFile(CAR)} style={{ width: CAR_W, height: CAR_H, display: "block" }} />

          {/* Specular sweep. The PNG masks itself, so the light can only ever
              fall on the bodywork — a highlight that strays onto the
              background is the single thing that gives away a composite.
              The bar is a child that translates, not an animated
              background-position: percentage positions resolve against
              (container − image), which for an oversized background runs
              backwards and the light never crosses. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              WebkitMaskImage: `url(${staticFile(CAR)})`,
              maskImage: `url(${staticFile(CAR)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              mixBlendMode: "screen",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-32%",
                left: 0,
                width: "34%",
                height: "164%",
                rotate: "14deg",
                filter: "blur(11px)",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,226,196,.7) 34%, rgba(255,255,255,1) 50%, rgba(255,205,155,.62) 66%, transparent 100%)",
                translate: interpolate(frame, [10, 64], ["-80%", "340%"], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          </div>

          {/* Warm rim grade, also masked — ties the car to the brand colour
              without tinting the whole frame orange. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: `url(${staticFile(CAR)})`,
              maskImage: `url(${staticFile(CAR)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              background: `radial-gradient(70% 120% at 86% 30%, ${ACCENT}3D 0%, transparent 58%)`,
              mixBlendMode: "soft-light",
            }}
          />

          {/* Reflection. Flipped, faded into the floor, blurred — a mirror
              image at full sharpness reads as a second car.

              The fade lives on an unflipped wrapper, not on the image. A mask
              set on the flipped element is flipped with it, so the opaque end
              of the gradient lands at the bottom: the reflection loses exactly
              the part that touches the wheels and gains a detached smudge
              further down. */}
          <div
            style={{
              position: "absolute",
              // Tuck it under the wheels. The source PNG carries 9%
              // transparent padding top and bottom (content rows 32..322 of
              // 355), so both the car's base and the flipped copy's head hold
              // ~0.09·CAR_H of air; closing both is what makes the car stand
              // on the floor instead of hovering over its own double.
              top: CAR_H - Math.round(CAR_H * 0.19),
              left: 0,
              width: CAR_W,
              height: CAR_H,
              WebkitMaskImage:
                "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.34) 28%, transparent 58%)",
              maskImage:
                "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.34) 28%, transparent 58%)",
            }}
          >
            <Img
              src={staticFile(CAR)}
              style={{
                width: CAR_W,
                height: CAR_H,
                display: "block",
                scale: "1 -1",
                opacity: 0.4,
                filter: "blur(4px) saturate(.5) brightness(1.45)",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 316 }}>
        <Kicker index="05" delay={6}>
          Suzuki Swace hybride
        </Kicker>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 268 }}>
        <Caption
          name="Meme chauffeur"
          from={18}
          durationInFrames={72}
          premountFor={fps}
          highlight="même."
          accentColor={ACCENT}
          size={90}
        >
          Un seul chauffeur. Toujours le même.
        </Caption>
      </AbsoluteFill>

      <Grade warmth={0.85} />
    </AbsoluteFill>
  );
};
