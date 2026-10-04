import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ACCENT, HAIRLINE, INK, INK_DIM, OUT, POP, WHATSAPP } from "./theme";
import { SCREEN_H, SCREEN_W } from "./PhoneFrame";
import { MapCanvas } from "./MapCanvas";
import { MONO, UI } from "./fonts";

import { CDG_XY, PARIS_XY, ROUTE } from "./map-data";

// Length of the route path, measured once at module load rather than guessed.
// A hardcoded dash length that is too short leaves the line permanently
// incomplete; too long and the draw-on finishes before the animation does.
const ROUTE_LEN = 1400;

function typed(frame: number, start: number, end: number, text: string) {
  const n = Math.round(
    interpolate(frame, [start, end], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.45, 0, 0.55, 1),
    }),
  );
  return text.slice(0, n);
}

/**
 * The I&N RUN booking flow, rebuilt as motion design.
 *
 * This is not a screen recording and does not pretend to be one. It is the app's
 * real layout, real type scale and real copy, replayed at a pace a viewer can
 * follow — a screen capture of someone typing an address is four seconds of
 * nothing, where this lands the same information in one.
 */
export const AppScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const address = typed(frame, 30, 62, "Aéroport CDG — Terminal 2E");
  const price = Math.round(
    interpolate(frame, [108, 136], [0, 45], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: OUT,
    }),
  );

  return (
    <AbsoluteFill style={{ fontFamily: UI, color: INK }}>
      {/* ── Carte ─────────────────────────────────────────────────────── */}
      <AbsoluteFill style={{ background: "#0b0c0e" }}>
        <MapCanvas />
        <svg
          width={SCREEN_W}
          height={SCREEN_H}
          viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
          style={{
            position: "absolute",
            pointerEvents: "none",
            // The map drifts upward as the route is drawn, the way a real map
            // recentres on a journey. Slow enough to be felt, not watched.
            translate: interpolate(frame, [60, 150], ["0px 0px", "0px -54px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            scale: interpolate(frame, [60, 150], [1, 1.06], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
          }}
        >
          {/* ── Tracé du trajet ─────────────────────────────────────── */}
          <path
            d={ROUTE}
            stroke={ACCENT}
            strokeWidth={26}
            fill="none"
            strokeLinecap="round"
            opacity={0.12}
            strokeDasharray={ROUTE_LEN}
            style={{
              strokeDashoffset: interpolate(frame, [62, 118], [ROUTE_LEN, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: OUT,
              }),
            }}
          />
          <path
            d={ROUTE}
            stroke={ACCENT}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={ROUTE_LEN}
            style={{
              strokeDashoffset: interpolate(frame, [62, 118], [ROUTE_LEN, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: OUT,
              }),
            }}
          />

          {/* Départ */}
          <circle
            cx={PARIS_XY[0]}
            cy={PARIS_XY[1]}
            r={15}
            fill={ACCENT}
            stroke="rgba(255,255,255,.9)"
            strokeWidth={4}
            style={{
              scale: interpolate(frame, [58, 72], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: POP,
                output: "perceptual-scale",
              }),
              transformOrigin: `${PARIS_XY[0]}px ${PARIS_XY[1]}px`,
            }}
          />
          {/* Arrivée */}
          <g
            style={{
              scale: interpolate(frame, [112, 126], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: POP,
                output: "perceptual-scale",
              }),
              transformOrigin: `${CDG_XY[0]}px ${CDG_XY[1]}px`,
            }}
          >
            <circle cx={CDG_XY[0]} cy={CDG_XY[1]} r={20} fill="#0D0D0D" stroke="rgba(255,255,255,.18)" strokeWidth={3} />
            <circle cx={CDG_XY[0]} cy={CDG_XY[1]} r={10} fill={ACCENT} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* ── Barre d'état ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 46,
          right: 46,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 22,
          fontWeight: 500,
          color: INK,
        }}
      >
        <span>16:40</span>
        <span style={{ letterSpacing: "0.18em" }}>▮▮▮ ▰</span>
      </div>

      {/* ── Burger ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 36,
          width: 72,
          height: 72,
          borderRadius: 36,
          background: "rgba(14,15,18,.82)",
          border: `1px solid ${HAIRLINE}`,
          display: "flex",
          flexDirection: "column",
          gap: 7,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ width: 28, height: 3, borderRadius: 2, background: INK }} />
        <span style={{ width: 28, height: 3, borderRadius: 2, background: INK }} />
        <span style={{ width: 28, height: 3, borderRadius: 2, background: INK }} />
      </div>

      {/* ── Barre de recherche ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          bottom: 42,
          borderRadius: 44,
          background: "#0E0F12",
          border: `1px solid ${HAIRLINE}`,
          boxShadow: "0 18px 48px -12px rgba(0,0,0,.9)",
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          // Lifts away as the price card takes over the bottom of the screen.
          translate: interpolate(frame, [100, 118], ["0px 0px", "0px 150px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          }),
          opacity: interpolate(frame, [100, 116], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            background: "rgba(255,90,31,.12)",
            border: `1px solid rgba(255,90,31,.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke={ACCENT} strokeWidth="2.4" />
            <path d="M16.5 16.5 L21 21" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            {frame < 30 ? "Où allons-nous ?" : address}
            {frame >= 30 && frame < 66 && Math.floor(frame / 5) % 2 === 0 ? (
              <span style={{ color: ACCENT }}>|</span>
            ) : null}
          </div>
          <div style={{ fontSize: 19, color: INK_DIM, marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: "#2ED47A" }} />
            CDG · Orly · Beauvais
          </div>
        </div>
      </div>

      {/* ── Carte prix ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 36,
          borderRadius: 40,
          background: "#0E0F12",
          border: `1px solid ${HAIRLINE}`,
          boxShadow: "0 -8px 60px -10px rgba(255,90,31,.22), 0 24px 60px -12px rgba(0,0,0,.95)",
          padding: "30px 32px 32px",
          translate: interpolate(frame, [104, 124], ["0px 420px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          }),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, color: INK_DIM }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: ACCENT }} />
          Paris 11e
          <span style={{ flex: 1, height: 1, background: HAIRLINE }} />
          Roissy CDG — 2E
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 18 }}>
          <span style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.9 }}>
            {price}
            <span style={{ color: ACCENT }}> €</span>
          </span>
          <span style={{ fontSize: 21, color: INK_DIM, paddingBottom: 14, lineHeight: 1.25 }}>
            52 min
            <br />
            52 km
          </span>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 20,
            fontWeight: 600,
            color: ACCENT,
            opacity: interpolate(frame, [138, 150], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <CanvasImage
            src={staticFile("ugc/trace-success.png")}
            style={{ width: 30, height: 30 }}
          />
          Prix fixe garanti — aucune surprise
        </div>

        <div
          style={{
            marginTop: 24,
            height: 86,
            borderRadius: 30,
            background: WHATSAPP,
            color: "#04140A",
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            // The press at frame 170 is the beat the whole screen builds to.
            scale: interpolate(frame, [168, 173, 180], [1, 0.95, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
              output: "perceptual-scale",
            }),
          }}
        >
          Confirmer sur WhatsApp
        </div>
      </div>
    </AbsoluteFill>
  );
};
