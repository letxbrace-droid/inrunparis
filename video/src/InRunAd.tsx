// InRun PWA Ad — 14.5s · 435fr · 30fps · 1080×1920
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Img,
  staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { noise2D } from "@remotion/noise";
import { loadFont as loadDisplay } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadBody } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily: DISPLAY } = loadDisplay("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});
const { fontFamily: BODY } = loadBody("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// ── Tokens ────────────────────────────────────────────────────────────────
const BG     = "#04080F";
const ORANGE = "#FF5A1F";
const WHITE  = "#FFFFFF";

// ── Easing ────────────────────────────────────────────────────────────────
const SLOW = Easing.bezier(0.45, 0, 0.55, 1);
const OUT  = Easing.bezier(0.16, 1, 0.3, 1);   // snappy deceleration
const POP  = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot

function lerp(f: number, i0: number, i1: number, o0: number, o1: number, ease = OUT) {
  return interpolate(f, [i0, i1], [o0, o1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease,
  });
}

function typed(f: number, start: number, end: number, text: string) {
  const n = Math.round(lerp(f, start, end, 0, text.length, SLOW));
  return text.slice(0, n);
}

// ── CSS light-flash overlay (no WebGL) ───────────────────────────────────
function LightFlash({ seed = 0 }: { seed?: number }) {
  const f = useCurrentFrame();
  const op = lerp(f, 0, 11, 0, 1, SLOW) - lerp(f, 11, 22, 0, 1, SLOW);
  const angle = 30 + seed * 40;
  const cx    = 42 + seed * 18;
  return (
    <AbsoluteFill style={{ opacity: op * 0.75, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 80% 55% at ${cx}% 50%, ${ORANGE}CC 0%, ${ORANGE}33 50%, transparent 72%)`,
        filter: "blur(28px)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(${angle}deg, transparent 15%, ${ORANGE}55 50%, transparent 85%)`,
        filter: "blur(45px)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 30% 90% at ${cx + 10}% 48%, rgba(255,255,220,0.35) 0%, transparent 60%)`,
        filter: "blur(10px)",
      }} />
    </AbsoluteFill>
  );
}

// ── Barrier reveal: text rises from below overflow boundary ───────────────
function Barrier({ children, f, start, end, fromY = 56 }: {
  children: React.ReactNode;
  f: number; start: number; end: number; fromY?: number;
}) {
  const p = lerp(f, start, end, 0, 1, OUT);
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ transform: `translateY(${(1 - p) * fromY}px)` }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — NOIR · PARIS  (0-75fr / 2.5s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneNoir() {
  const f = useCurrentFrame();

  const driftX = noise2D("s1-x", 0, f / 90) * 5;
  const driftY = noise2D("s1-y", 1, f / 90) * 4;

  // "PARIS." — slams up from below + scale snap
  const wordOp  = lerp(f, 6, 20, 0, 1);
  const wordY   = lerp(f, 6, 30, 110, 0, OUT);
  const wordScl = lerp(f, 6, 30, 0.84, 1, POP);

  // Orange line draws from center outward
  const lineW  = lerp(f, 34, 54, 0, 280, OUT);
  const lineOp = lerp(f, 34, 50, 0, 1);

  // Tagline — barrier reveal
  const tagOp = lerp(f, 46, 60, 0, 1, SLOW);

  // Slow zoom
  const scl = lerp(f, 0, 75, 0.97, 1.04, SLOW);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 65% 45% at 50% 50%, ${ORANGE}16 0%, transparent 68%)`,
      }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center",
          transform: `translate(${driftX}px, ${driftY}px) scale(${scl})`,
        }}>

          {/* Hero word — MASSIVE slam-in */}
          <div style={{ overflow: "hidden", lineHeight: 0.88 }}>
            <div style={{
              fontFamily: DISPLAY,
              fontSize: 214,
              fontWeight: 900,
              color: WHITE,
              letterSpacing: "-10px",
              lineHeight: 0.88,
              opacity: wordOp,
              transform: `translateY(${wordY}px) scale(${wordScl})`,
              transformOrigin: "center bottom",
            }}>
              PARIS.
            </div>
          </div>

          {/* Orange line */}
          <div style={{
            width: lineW,
            height: 2,
            margin: "24px auto 0",
            background: `linear-gradient(90deg, transparent, ${ORANGE} 20%, ${ORANGE} 80%, transparent)`,
            opacity: lineOp,
          }} />

          {/* Tagline */}
          <div style={{ marginTop: 20, opacity: tagOp }}>
            <Barrier f={f} start={46} end={62} fromY={44}>
              <div style={{
                fontFamily: BODY,
                fontSize: 20,
                fontWeight: 500,
                color: "rgba(255,255,255,0.52)",
                letterSpacing: "0.34em",
                textTransform: "uppercase",
              }}>
                Votre chauffeur vous attend.
              </div>
            </Barrier>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — L'APP  (75-230fr / 5.2s)
// ═══════════════════════════════════════════════════════════════════════════
function AppScreen({ localFrame }: { localFrame: number }) {
  const f = localFrame;

  const dep = typed(f, 10, 55, "Gare de Lyon, Paris 12e");
  const arr = typed(f, 58, 105, "Aéroport CDG · T2E");
  const prixOp = lerp(f, 108, 124, 0, 1);
  const prixS  = lerp(f, 108, 124, 0.7, 1, POP);
  const waOp = lerp(f, 128, 142, 0, 1);
  const waX  = lerp(f, 128, 142, 60, 0);

  const LIGHT_BG = "#F7F5F2";
  const INK      = "#1C1917";

  return (
    <div style={{
      width: "100%", height: "100%",
      background: LIGHT_BG, borderRadius: "inherit",
      display: "flex", flexDirection: "column",
      fontFamily: BODY, overflow: "hidden",
    }}>
      {/* Status bar */}
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
          {[10, 14, 18, 22].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: "rgba(0,0,0,0.3)", borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ padding: "8px 18px 6px", display: "flex", alignItems: "center", gap: 4 }}>
        {(["Trajet", "Tarif", "Options"] as const).map((label, i) => {
          const done = i < 2;
          return (
            <React.Fragment key={label}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: done ? ORANGE : "transparent",
                  border: done ? "none" : `2px solid ${ORANGE}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: done ? WHITE : ORANGE }}>
                    {done ? "✓" : "3"}
                  </span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: done ? ORANGE : "rgba(0,0,0,0.35)" }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1.5, background: ORANGE, opacity: 0.25, margin: "0 2px" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#DDE8EF" }}>
        <svg viewBox="0 0 310 240" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <line x1="90" y1="0" x2="90" y2="240" stroke="white" strokeWidth="5" />
          <line x1="200" y1="0" x2="200" y2="240" stroke="white" strokeWidth="3" />
          <line x1="0" y1="80" x2="310" y2="80" stroke="white" strokeWidth="5" />
          <line x1="0" y1="165" x2="310" y2="165" stroke="white" strokeWidth="3" />
          <line x1="40" y1="0" x2="40" y2="240" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
          <line x1="255" y1="0" x2="255" y2="240" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
          <line x1="0" y1="130" x2="310" y2="130" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
          <line x1="148" y1="205" x2="158" y2="38" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" strokeDasharray="12,8" />
          <circle cx="148" cy="205" r="9" fill="#16a34a" />
          <circle cx="148" cy="205" r="16" fill="#16a34a" fillOpacity="0.18" />
          <circle cx="158" cy="38" r="9" fill={ORANGE} />
          <circle cx="158" cy="38" r="16" fill={ORANGE} fillOpacity="0.18" />
        </svg>
        <div style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "white", borderRadius: 8, padding: "4px 10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>~32 km</span>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        padding: "14px 18px 18px", background: "#FFFFFF",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 -6px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Départ</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, minHeight: 18 }}>
              {dep}
              {dep.length < "Gare de Lyon, Paris 12e".length && (
                <span style={{ borderRight: `2px solid ${ORANGE}`, marginLeft: 1 }}>&nbsp;</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "0 0 8px 22px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2.5px solid ${ORANGE}`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 1 }}>Arrivée</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, minHeight: 18 }}>
              {arr}
              {arr.length > 0 && arr.length < "Aéroport CDG · T2E".length && (
                <span style={{ borderRight: `2px solid ${ORANGE}`, marginLeft: 1 }}>&nbsp;</span>
              )}
            </div>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          opacity: prixOp, transform: `scale(${prixS})`, transformOrigin: "left center",
        }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.38)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Tarif fixe</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: INK, letterSpacing: "-2px" }}>49 €</div>
          </div>
          <div style={{
            background: ORANGE, borderRadius: 14, padding: "12px 22px",
            boxShadow: `0 6px 20px ${ORANGE}55`,
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>Réserver →</span>
          </div>
        </div>
        <div style={{
          marginTop: 10,
          opacity: waOp, transform: `translateX(${waX}px)`,
          background: "rgba(22,163,74,0.07)",
          border: "1px solid rgba(22,163,74,0.2)",
          borderRadius: 10, padding: "9px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>Chauffeur confirmé ✓</span>
        </div>
      </div>
    </div>
  );
}

function SceneApp() {
  const f = useCurrentFrame();

  // Label glides down
  const labelOp = lerp(f, 0, 18, 0, 1);
  const labelY  = lerp(f, 0, 18, -20, 0, OUT);

  // Headline ping-pong: line 1 from LEFT, line 2 from RIGHT
  const l1X  = lerp(f, 4, 30, -380, 0, OUT);
  const l1Op = lerp(f, 4, 20, 0, 1);
  const l2X  = lerp(f, 12, 38, 380, 0, OUT);
  const l2Op = lerp(f, 12, 26, 0, 1);

  // Phone rises from below
  const phoneY  = lerp(f, 18, 56, 260, 0, OUT);
  const phoneOp = lerp(f, 18, 42, 0, 1);

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 50% at 70% 20%, ${ORANGE}10 0%, transparent 65%)`,
      }} />

      <AbsoluteFill style={{ flexDirection: "column", padding: "80px 52px 0" }}>

        {/* Overline label */}
        <div style={{
          fontFamily: BODY, fontSize: 15, fontWeight: 700,
          color: ORANGE, letterSpacing: "0.22em", textTransform: "uppercase",
          marginBottom: 16,
          opacity: labelOp, transform: `translateY(${labelY}px)`,
        }}>
          Réservez maintenant
        </div>

        {/* Ping-pong headline */}
        <div style={{
          fontFamily: DISPLAY, fontSize: 104, fontWeight: 900,
          color: WHITE, letterSpacing: "-3px", lineHeight: 0.9,
          opacity: l1Op, transform: `translateX(${l1X}px)`,
          marginBottom: 2,
        }}>
          VOTRE TRAJET,
        </div>
        <div style={{
          fontFamily: DISPLAY, fontSize: 104, fontWeight: 900,
          color: ORANGE, letterSpacing: "-3px", lineHeight: 0.9,
          opacity: l2Op, transform: `translateX(${l2X}px)`,
          marginBottom: 36,
        }}>
          EN 2 MINUTES.
        </div>

        {/* Phone mockup */}
        <div style={{
          opacity: phoneOp, transform: `translateY(${phoneY}px)`,
          flex: 1, display: "flex", justifyContent: "center",
        }}>
          <div style={{
            width: 310, height: 540, borderRadius: 44,
            background: "#F7F5F2",
            border: "2px solid rgba(0,0,0,0.08)",
            boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.04), 0 0 60px ${ORANGE}20`,
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 100, height: 28, background: "#F7F5F2",
              borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 10,
            }} />
            <AppScreen localFrame={f} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — LA VOITURE  (160fr / 5.3s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneCar() {
  const f = useCurrentFrame();

  const camX = noise2D("car-x", 0, f / 100) * 6;
  const camY = noise2D("car-y", 1, f / 100) * 4;

  const carX   = lerp(f, 0, 55, 280, 0, OUT);
  const carOp  = lerp(f, 0, 40, 0, 1);
  const carScl = lerp(f, 0, 160, 1.0, 1.07, SLOW);

  // "VOTRE" slams from RIGHT
  const t1X  = lerp(f, 50, 74, 360, 0, OUT);
  const t1Op = lerp(f, 50, 66, 0, 1);

  // "CHAUFFEUR." slams from LEFT (6fr stagger)
  const t2X  = lerp(f, 58, 82, -360, 0, OUT);
  const t2Op = lerp(f, 58, 72, 0, 1);

  // Orange accent line
  const lineW = lerp(f, 90, 110, 0, 200, OUT);
  const lineOp = lerp(f, 88, 106, 0, 1);

  // Attribute words — staggered barrier reveals
  const attrs = [
    { text: "Ponctuel.", start: 102 },
    { text: "Discret.", start: 116 },
    { text: "Premium.", start: 130 },
  ];

  // Badge
  const badgeOp = lerp(f, 108, 126, 0, 1);
  const badgeS  = lerp(f, 108, 126, 0.72, 1, POP);

  return (
    <AbsoluteFill style={{ background: BG, transform: `translate(${camX}px, ${camY}px)` }}>

      {/* Sol lumineux */}
      <div style={{
        position: "absolute", bottom: 260, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${ORANGE}30 30%, ${ORANGE}50 50%, ${ORANGE}30 70%, transparent)`,
      }} />
      <div style={{
        position: "absolute", bottom: 258, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${ORANGE}10 40%, ${ORANGE}20 50%, ${ORANGE}10 60%, transparent)`,
        filter: "blur(4px)",
      }} />

      {/* Voiture */}
      <div style={{
        position: "absolute", bottom: 220, left: -20, right: -20,
        opacity: carOp, transform: `translateX(${carX}px) scale(${carScl})`,
        transformOrigin: "center bottom",
      }}>
        <div style={{ position: "relative" }}>
          <Img src={staticFile("voiture.webp")} style={{ width: "100%", objectFit: "contain", display: "block" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 80% 75% at 50% 55%, transparent 45%, ${BG} 82%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
            background: `linear-gradient(to bottom, transparent, ${BG})`,
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* Halo */}
      <div style={{
        position: "absolute", bottom: 200, left: "50%", transform: "translateX(-50%)",
        width: 600, height: 200, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${ORANGE}15 0%, transparent 70%)`,
        filter: "blur(30px)", opacity: carOp, pointerEvents: "none",
      }} />

      {/* Mega type block */}
      <div style={{ position: "absolute", top: 96, left: 52, right: 52 }}>

        {/* VOTRE — slams from right */}
        <div style={{
          fontFamily: DISPLAY, fontSize: 124, fontWeight: 900,
          color: WHITE, letterSpacing: "-5px", lineHeight: 0.86,
          opacity: t1Op, transform: `translateX(${t1X}px)`,
        }}>
          VOTRE
        </div>

        {/* CHAUFFEUR. — slams from left */}
        <div style={{
          fontFamily: DISPLAY, fontSize: 124, fontWeight: 900,
          color: WHITE, letterSpacing: "-5px", lineHeight: 0.86,
          opacity: t2Op, transform: `translateX(${t2X}px)`,
          marginBottom: 28,
        }}>
          CHAUFFEUR.
        </div>

        {/* Orange accent line */}
        <div style={{
          width: lineW, height: 2.5, borderRadius: 999,
          background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE}44)`,
          opacity: lineOp, marginBottom: 24,
        }} />

        {/* Attribute words — staggered */}
        {attrs.map(({ text, start }) => {
          const op = lerp(f, start, start + 14, 0, 1);
          const y  = lerp(f, start, start + 14, 36, 0, OUT);
          return (
            <div key={text} style={{ overflow: "hidden", marginBottom: 2 }}>
              <div style={{
                fontFamily: BODY, fontSize: 34, fontWeight: 600,
                color: "rgba(255,255,255,0.60)",
                opacity: op, transform: `translateY(${y}px)`,
              }}>
                {text}
              </div>
            </div>
          );
        })}

        {/* Disponibilité badge */}
        <div style={{
          marginTop: 24,
          opacity: badgeOp, transform: `scale(${badgeS})`, transformOrigin: "left center",
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999, padding: "10px 22px",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#22c55e", boxShadow: "0 0 10px #22c55e",
          }} />
          <span style={{ fontFamily: BODY, fontSize: 17, fontWeight: 700, color: WHITE }}>
            Disponible · 24h/7j
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — BRAND REVEAL  (60fr / 2s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneBrand() {
  const f = useCurrentFrame();

  const flashOp = lerp(f, 0, 12, 0.6, 0);

  // Logo drops from above
  const logoOp = lerp(f, 6, 24, 0, 1);
  const logoY  = lerp(f, 6, 28, -130, 0, POP);

  // Brand scales in from nothing
  const brandOp  = lerp(f, 18, 36, 0, 1);
  const brandScl = lerp(f, 18, 36, 0.28, 1, POP);

  // Tagline
  const tagOp = lerp(f, 30, 48, 0, 1, SLOW);
  const lineW = lerp(f, 28, 50, 0, 220);

  // CTA rises from below
  const ctaOp = lerp(f, 38, 54, 0, 1);
  const ctaY  = lerp(f, 38, 54, 90, 0, POP);

  // Pulse
  const pulse = interpolate(f % 28, [0, 14, 28], [1, 1.04, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${ORANGE}18 0%, transparent 68%)`,
      }} />
      <AbsoluteFill style={{ background: WHITE, opacity: flashOp, zIndex: 50 }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>

        {/* Logo — drops in */}
        <div style={{ opacity: logoOp, transform: `translateY(${logoY}px)`, marginBottom: 22 }}>
          <Img src={staticFile("inrun-icon.png")} style={{ width: 96, height: 96, borderRadius: 22 }} />
        </div>

        {/* I&N RUN — explodes in */}
        <div style={{ opacity: brandOp, transform: `scale(${brandScl})`, transformOrigin: "center" }}>
          <span style={{
            fontFamily: DISPLAY,
            fontSize: 112,
            fontWeight: 900,
            color: WHITE,
            letterSpacing: "-6px",
            lineHeight: 1,
          }}>
            I<em style={{ fontStyle: "italic", fontWeight: 300, color: ORANGE }}>&amp;</em>N RUN
          </span>
        </div>

        {/* Line */}
        <div style={{
          width: lineW, height: 2, borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)`,
          margin: "18px 0", opacity: tagOp,
        }} />

        {/* Tagline */}
        <div style={{ opacity: tagOp }}>
          <span style={{
            fontFamily: BODY, fontSize: 16, fontWeight: 500,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.28em", textTransform: "uppercase",
          }}>
            Chauffeur Privé · Paris
          </span>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 44,
          opacity: ctaOp,
          transform: `translateY(${ctaY}px) scale(${pulse})`,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${ORANGE}, #d63500)`,
            borderRadius: 999, padding: "20px 54px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: `0 0 60px ${ORANGE}50, 0 0 120px ${ORANGE}20`,
          }}>
            <span style={{ fontSize: 26 }}>📲</span>
            <span style={{ fontFamily: BODY, fontSize: 26, fontWeight: 800, color: WHITE, letterSpacing: "-0.5px" }}>
              Réserver maintenant
            </span>
          </div>
        </div>

        {/* URL */}
        <div style={{ marginTop: 22, opacity: lerp(f, 50, 64, 0, 1) }}>
          <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>
            letxbrace-droid.github.io/inrunparis
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT  — 14.5s · 435fr · 30fps · 1080×1920
// Scene durations: 75 + 155 + 160 + 60 − 15 (fade) = 435
// ═══════════════════════════════════════════════════════════════════════════
export const InRunAd: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <TransitionSeries>

      <TransitionSeries.Sequence durationInFrames={75}>
        <SceneNoir />
      </TransitionSeries.Sequence>

      <TransitionSeries.Overlay durationInFrames={22}>
        <LightFlash seed={2} />
      </TransitionSeries.Overlay>

      <TransitionSeries.Sequence durationInFrames={155}>
        <SceneApp />
      </TransitionSeries.Sequence>

      <TransitionSeries.Overlay durationInFrames={22}>
        <LightFlash seed={5} />
      </TransitionSeries.Overlay>

      <TransitionSeries.Sequence durationInFrames={160}>
        <SceneCar />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      <TransitionSeries.Sequence durationInFrames={60}>
        <SceneBrand />
      </TransitionSeries.Sequence>

    </TransitionSeries>
  </AbsoluteFill>
);
