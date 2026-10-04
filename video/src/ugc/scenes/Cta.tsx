import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Stage } from "../Stage";
import { Reflect } from "../Panel";
import { Smear } from "../Smear";
import { ACCENT, HAIRLINE, INK, INK_DIM, OUT, POP } from "../theme";
import { CONDENSED, DISPLAY, MONO, UI } from "../fonts";

function Mark() {
  return (
    <CanvasImage
      src={staticFile("ugc/icon-512.png")}
      style={{ width: 230, height: 230, borderRadius: 54, display: "block" }}
    />
  );
}

/**
 * Scene 6 — the card.
 *
 * One name, one instruction. An end card that lists four things gets none of
 * them remembered; this one asks for a single action and names the place to
 * do it, because the app is a PWA and "add to home screen" is the conversion.
 */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Stage
      intensity={interpolate(frame, [0, 20], [0.8, 1.4], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: OUT,
      })}
      horizon={70}
    >
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26, paddingBottom: 70 }}>
        <div
          style={{
            position: "relative",
            scale: interpolate(frame, [0, 18], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: POP,
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Mark />
          <Reflect height={230} opacity={0.3} blur={8} gap={12}>
            <Mark />
          </Reflect>
        </div>

        {/* The wordmark, set letter by letter. Bricolage is variable, so each
            letter gains weight as it arrives instead of appearing at its final
            mass — the name assembles rather than switching on, and the
            tracking opening wide then closing is the gesture that makes a
            logotype feel set rather than typed. */}
        <div style={{ display: "flex", fontFamily: DISPLAY, fontSize: 126, lineHeight: 1, marginTop: 10 }}>
          {"I&N RUN".split("").map((ch, i) => (
            <Smear
              key={i}
              y={interpolate(frame, [8 + i * 2, 12 + i * 2, 20 + i * 2], [22, 12, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}
              style={{ display: "inline-block" }}
            >
            <span
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                color: INK,
                fontVariationSettings: `'wght' ${interpolate(frame, [8 + i * 2, 26 + i * 2], [300, 800], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: OUT,
                })}`,
                letterSpacing: `${interpolate(frame, [8 + i * 2, 30 + i * 2], [0.3, -0.055], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: OUT,
                })}em`,
                opacity: interpolate(frame, [8 + i * 2, 15 + i * 2], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: `0 ${interpolate(frame, [8 + i * 2, 24 + i * 2], [34, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: POP,
                })}px`,
                textShadow: "0 6px 40px rgba(0,0,0,.8)",
              }}
            >
              {ch}
            </span>
            </Smear>
          ))}
        </div>

        <div
          style={{
            fontFamily: CONDENSED,
            fontWeight: 700,
            fontSize: 48,
            color: INK_DIM,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: interpolate(frame, [18, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          Chauffeur privé · Paris &amp; Île-de-France
        </div>

        {/* One action, and a destination for it.
            "Ajoute-la à ton écran d'accueil" was an instruction with nowhere
            to go — the viewer is on a phone, not on the site. The whole film
            has just shown a booking happening on WhatsApp, so ending anywhere
            else would also be a change of subject. */}
        <div
          style={{
            marginTop: 14,
            fontFamily: UI,
            fontWeight: 700,
            fontSize: 42,
            color: INK,
            padding: "26px 54px",
            borderRadius: 999,
            background: "rgba(255,90,31,.15)",
            border: `1px solid ${HAIRLINE}`,
            boxShadow: "0 18px 50px -14px rgba(255,90,31,.5), inset 0 1px 0 rgba(255,200,170,.3)",
            opacity: interpolate(frame, [24, 38], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            scale: interpolate(frame, [24, 40], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: POP,
              output: "perceptual-scale",
            }),
          }}
        >
          Réserve sur <span style={{ color: ACCENT }}>WhatsApp</span>
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 40,
            letterSpacing: "0.12em",
            color: INK,
            opacity: interpolate(frame, [32, 44], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          07 67 74 22 20
        </div>

        <div
          style={{
            fontFamily: UI,
            fontWeight: 500,
            fontSize: 26,
            color: INK_DIM,
            opacity: interpolate(frame, [40, 52], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
          }}
        >
          ou ajoute l'app à ton écran d'accueil
        </div>

      </AbsoluteFill>
    </Stage>
  );
};
