import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

// ── Tokens ────────────────────────────────────────────────────────────────
const BG     = "#04080F";
const ORANGE = "#FF5A1F";
const WHITE  = "#FFFFFF";

// ── Easing ────────────────────────────────────────────────────────────────
const SLOW   = Easing.bezier(0.45, 0, 0.55, 1);   // editorial ease-in-out
const OUT    = Easing.bezier(0.16, 1, 0.3, 1);     // snappy deceleration
const POP    = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot

function lerp(f: number, i0: number, i1: number, o0: number, o1: number, ease = OUT) {
  return interpolate(f, [i0, i1], [o0, o1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease,
  });
}

// ── Typer helper — simule la frappe ──────────────────────────────────────
function typed(f: number, start: number, end: number, text: string) {
  const n = Math.round(lerp(f, start, end, 0, text.length, SLOW));
  return text.slice(0, n);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — NOIR · PARIS  (0-75fr / 2.5s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneNoir() {
  const f = useCurrentFrame();

  // "Paris." apparaît lentement
  const op  = lerp(f, 18, 48, 0, 1, SLOW);
  // Léger zoom-in du texte
  const scl = lerp(f, 18, 75, 0.92, 1.0, SLOW);
  // Exit
  const exitOp = lerp(f, 58, 75, 1, 0, SLOW);

  return (
    <AbsoluteFill style={{ background: BG, opacity: exitOp }}>
      {/* Halo orange subtil */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${ORANGE}12 0%, transparent 70%)`,
      }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{
          opacity: op, transform: `scale(${scl})`,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily, fontSize: 110, fontWeight: 900,
            color: WHITE, letterSpacing: "-6px", lineHeight: 1,
          }}>
            Paris.
          </div>
          <div style={{
            fontFamily, fontSize: 20, fontWeight: 300,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.4em", textTransform: "uppercase",
            marginTop: 18,
          }}>
            Île-de-France
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

  // Adresse départ se tape
  const dep = typed(f, 10, 55, "Tour Eiffel, Paris 7e");
  // Adresse destination se tape
  const arr = typed(f, 58, 105, "Aéroport CDG · T2E");
  // Prix apparaît
  const prixOp = lerp(f, 108, 124, 0, 1);
  const prixS  = lerp(f, 108, 124, 0.7, 1, POP);
  // WA confirm
  const waOp = lerp(f, 128, 142, 0, 1);
  const waX  = lerp(f, 128, 142, 60, 0);

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#0C1220",
      borderRadius: "inherit",
      display: "flex", flexDirection: "column",
      fontFamily, overflow: "hidden",
    }}>
      {/* Status bar */}
      <div style={{
        padding: "14px 20px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>9:41</span>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[12, 16, 20, 24].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* App header */}
      <div style={{
        padding: "10px 20px 12px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Img src={staticFile("inrun-icon.png")}
          style={{ width: 32, height: 32, borderRadius: 8 }} />
        <span style={{ fontSize: 17, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px" }}>
          I<em style={{ fontStyle: "italic", fontWeight: 400 }}>&amp;</em>N RUN
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600,
          color: ORANGE, letterSpacing: "0.06em" }}>
          RÉSERVER
        </span>
      </div>

      {/* Map area */}
      <div style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: "linear-gradient(180deg, #0A1628 0%, #060E1C 100%)",
      }}>
        {/* Route line */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor={ORANGE} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Dashed route */}
          <line x1="50%" y1="30%" x2="50%" y2="70%"
            stroke="url(#routeGrad)" strokeWidth="2.5"
            strokeDasharray="8,6" />
          {/* Start dot */}
          <circle cx="50%" cy="30%" r="7" fill="#22c55e" />
          <circle cx="50%" cy="30%" r="12" fill="#22c55e" fillOpacity="0.25" />
          {/* End dot */}
          <circle cx="50%" cy="70%" r="7" fill={ORANGE} />
          <circle cx="50%" cy="70%" r="12" fill={ORANGE} fillOpacity="0.25" />
        </svg>
        {/* Grid lines (map feel) */}
        {[20, 40, 60, 80].map((x) => (
          <div key={x} style={{
            position: "absolute", top: 0, bottom: 0, left: `${x}%`, width: 1,
            background: "rgba(255,255,255,0.03)",
          }} />
        ))}
        {[25, 50, 75].map((y) => (
          <div key={y} style={{
            position: "absolute", left: 0, right: 0, top: `${y}%`, height: 1,
            background: "rgba(255,255,255,0.03)",
          }} />
        ))}
      </div>

      {/* Bottom booking panel */}
      <div style={{
        padding: "16px 20px 20px",
        background: "#0C1220",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Champ départ */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#22c55e", boxShadow: "0 0 8px #22c55e80", flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              Départ
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, minHeight: 20 }}>
              {dep}
              {dep.length < "Tour Eiffel, Paris 7e".length && (
                <span style={{ borderRight: `2px solid ${ORANGE}`, marginLeft: 1, animation: "none" }}>
                  &nbsp;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 10px 20px" }} />

        {/* Champ arrivée */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: ORANGE, boxShadow: `0 0 8px ${ORANGE}80`, flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              Destination
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, minHeight: 20 }}>
              {arr}
              {arr.length > 0 && arr.length < "Aéroport CDG · T2E".length && (
                <span style={{ borderRight: `2px solid ${ORANGE}`, marginLeft: 1 }}>&nbsp;</span>
              )}
            </div>
          </div>
        </div>

        {/* Prix + bouton */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          opacity: prixOp, transform: `scale(${prixS})`, transformOrigin: "left center",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.38)",
              textTransform: "uppercase", letterSpacing: "0.1em" }}>Tarif fixe</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: WHITE, letterSpacing: "-2px" }}>65 €</div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${ORANGE}, #d63500)`,
            borderRadius: 14, padding: "12px 22px",
            boxShadow: `0 0 24px ${ORANGE}55`,
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: WHITE }}>Réserver →</span>
          </div>
        </div>

        {/* WhatsApp confirm */}
        <div style={{
          marginTop: 12,
          opacity: waOp, transform: `translateX(${waX}px)`,
          background: "rgba(37,211,102,0.1)",
          border: "1px solid rgba(37,211,102,0.25)",
          borderRadius: 12, padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#25D366" }}>
            Chauffeur confirmé ✓
          </span>
        </div>
      </div>
    </div>
  );
}

function SceneApp() {
  const f = useCurrentFrame();

  // Headline glisse
  const headY  = lerp(f, 0, 30, 40, 0);
  const headOp = lerp(f, 0, 24, 0, 1);

  // Phone monte depuis le bas
  const phoneY  = lerp(f, 14, 50, 180, 0);
  const phoneOp = lerp(f, 14, 42, 0, 1);

  // Exit
  const exitOp = lerp(f, 136, 155, 1, 0, SLOW);

  return (
    <AbsoluteFill style={{ background: BG, opacity: exitOp }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 50% at 70% 20%, ${ORANGE}10 0%, transparent 65%)`,
      }} />

      <AbsoluteFill style={{ flexDirection: "column", padding: "90px 52px 0" }}>

        {/* Headline */}
        <div style={{ opacity: headOp, transform: `translateY(${headY}px)`, marginBottom: 36 }}>
          <div style={{
            fontFamily, fontSize: 18, fontWeight: 700, color: ORANGE,
            letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10,
          }}>
            Réservez maintenant
          </div>
          <div style={{
            fontFamily, fontSize: 50, fontWeight: 900, color: WHITE,
            letterSpacing: "-2px", lineHeight: 1.1,
          }}>
            Votre trajet,{"\n"}
            <span style={{ color: ORANGE }}>en 2 minutes.</span>
          </div>
        </div>

        {/* Phone mockup */}
        <div style={{
          opacity: phoneOp, transform: `translateY(${phoneY}px)`,
          flex: 1, display: "flex", justifyContent: "center",
        }}>
          <div style={{
            width: 310,
            height: 540,
            borderRadius: 44,
            background: "#0C1220",
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: `0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${ORANGE}15`,
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Notch */}
            <div style={{
              position: "absolute", top: 0, left: "50%",
              transform: "translateX(-50%)",
              width: 100, height: 28,
              background: "#0C1220",
              borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
              zIndex: 10,
            }} />
            <AppScreen localFrame={f} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — LA VOITURE  (230-390fr / 5.3s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneCar() {
  const f = useCurrentFrame();

  // Car glisse depuis la droite
  const carX  = lerp(f, 0, 55, 280, 0, OUT);
  const carOp = lerp(f, 0, 40, 0, 1);
  // Ken Burns — subtil zoom
  const carScl = lerp(f, 0, 160, 1.0, 1.07, SLOW);

  // Texte "Votre chauffeur."
  const t1Op = lerp(f, 55, 80, 0, 1, SLOW);
  const t1Y  = lerp(f, 55, 80, 20, 0, SLOW);

  // Sous-texte
  const t2Op = lerp(f, 75, 100, 0, 1, SLOW);
  const t2Y  = lerp(f, 75, 100, 16, 0, SLOW);

  // Badge "Dispo maintenant"
  const badgeOp = lerp(f, 100, 120, 0, 1);
  const badgeS  = lerp(f, 100, 120, 0.7, 1, POP);

  // Exit
  const exitOp = lerp(f, 144, 160, 1, 0, SLOW);

  return (
    <AbsoluteFill style={{ background: BG, opacity: exitOp }}>

      {/* Sol / ligne lumineuse sous la voiture */}
      <div style={{
        position: "absolute", bottom: 260, left: 0, right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${ORANGE}30 30%, ${ORANGE}50 50%, ${ORANGE}30 70%, transparent)`,
      }} />
      <div style={{
        position: "absolute", bottom: 258, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${ORANGE}10 40%, ${ORANGE}20 50%, ${ORANGE}10 60%, transparent)`,
        filter: "blur(4px)",
      }} />

      {/* Voiture */}
      <div style={{
        position: "absolute",
        bottom: 220,
        left: -20, right: -20,
        opacity: carOp,
        transform: `translateX(${carX}px) scale(${carScl})`,
        transformOrigin: "center bottom",
      }}>
        {/* Vignette pour fondre le fond blanc */}
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile("voiture.webp")}
            style={{ width: "100%", objectFit: "contain", display: "block" }}
          />
          {/* Masque radial — fond la zone blanche dans le noir */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 80% 75% at 50% 55%, transparent 45%, ${BG} 82%)`,
            pointerEvents: "none",
          }} />
          {/* Reflet sol */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
            background: `linear-gradient(to bottom, transparent, ${BG})`,
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* Halo orange derrière la voiture */}
      <div style={{
        position: "absolute",
        bottom: 200, left: "50%", transform: "translateX(-50%)",
        width: 600, height: 200,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${ORANGE}15 0%, transparent 70%)`,
        filter: "blur(30px)",
        opacity: carOp,
        pointerEvents: "none",
      }} />

      {/* Texte en haut */}
      <div style={{
        position: "absolute", top: 110, left: 52, right: 52,
      }}>
        <div style={{
          opacity: t1Op, transform: `translateY(${t1Y}px)`,
          fontFamily, fontSize: 68, fontWeight: 900,
          color: WHITE, letterSpacing: "-3px", lineHeight: 1,
        }}>
          Votre<br />chauffeur.
        </div>

        <div style={{
          opacity: t2Op, transform: `translateY(${t2Y}px)`,
          marginTop: 18,
          fontFamily, fontSize: 22, fontWeight: 300,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.02em",
        }}>
          Ponctuel. Discret. Premium.
        </div>

        {/* Badge disponibilité */}
        <div style={{
          marginTop: 28,
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
          <span style={{ fontFamily, fontSize: 16, fontWeight: 700, color: WHITE }}>
            Disponible · 24h/7j
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — BRAND REVEAL  (390-450fr / 2s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneBrand() {
  const f = useCurrentFrame();

  // Flash entrée
  const flashOp = lerp(f, 0, 12, 0.6, 0);

  // Logo
  const logoOp  = lerp(f, 10, 28, 0, 1, SLOW);
  const logoScl = lerp(f, 10, 28, 0.8, 1, POP);

  // Brand name
  const brandOp = lerp(f, 20, 40, 0, 1, SLOW);
  const brandY  = lerp(f, 20, 40, 16, 0, SLOW);

  // Tagline
  const tagOp = lerp(f, 34, 52, 0, 1, SLOW);

  // CTA
  const ctaOp  = lerp(f, 44, 60, 0, 1);
  const ctaScl = lerp(f, 44, 60, 0.85, 1, POP);

  // Pulse bouton
  const pulse = interpolate(f % 28, [0, 14, 28], [1, 1.04, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Halo central */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${ORANGE}18 0%, transparent 68%)`,
      }} />

      {/* Flash */}
      <AbsoluteFill style={{ background: WHITE, opacity: flashOp, zIndex: 50 }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>

        {/* Logo */}
        <div style={{ opacity: logoOp, transform: `scale(${logoScl})`, marginBottom: 28 }}>
          <Img
            src={staticFile("inrun-icon.png")}
            style={{ width: 96, height: 96, borderRadius: 22 }}
          />
        </div>

        {/* I&N RUN */}
        <div style={{ opacity: brandOp, transform: `translateY(${brandY}px)` }}>
          <span style={{
            fontFamily, fontSize: 82, fontWeight: 900,
            color: WHITE, letterSpacing: "-5px", lineHeight: 1,
          }}>
            I<em style={{ fontStyle: "italic", fontWeight: 300, color: ORANGE }}>&amp;</em>N RUN
          </span>
        </div>

        {/* Ligne */}
        <div style={{
          width: lerp(f, 28, 50, 0, 220),
          height: 1.5, borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)`,
          margin: "14px 0",
          opacity: tagOp,
        }} />

        {/* Tagline */}
        <div style={{ opacity: tagOp }}>
          <span style={{
            fontFamily, fontSize: 17, fontWeight: 400,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.24em", textTransform: "uppercase",
          }}>
            Chauffeur Privé · Paris
          </span>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 48,
          opacity: ctaOp,
          transform: `scale(${ctaScl * pulse})`,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${ORANGE}, #d63500)`,
            borderRadius: 999, padding: "20px 54px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: `0 0 60px ${ORANGE}50, 0 0 120px ${ORANGE}20`,
          }}>
            <span style={{ fontSize: 26 }}>📲</span>
            <span style={{
              fontFamily, fontSize: 26, fontWeight: 800,
              color: WHITE, letterSpacing: "-0.5px",
            }}>
              Réserver maintenant
            </span>
          </div>
        </div>

        {/* URL */}
        <div style={{ marginTop: 22, opacity: lerp(f, 56, 72, 0, 1) }}>
          <span style={{
            fontFamily, fontSize: 15, fontWeight: 400,
            color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em",
          }}>
            letxbrace-droid.github.io/inrunparis
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT  — 15s · 450fr · 30fps · 1080×1920
// ═══════════════════════════════════════════════════════════════════════════
export const InRunAd: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>

    {/* Scène 1 — Noir · Paris  (0-75fr) */}
    <Sequence from={0} durationInFrames={75}>
      <SceneNoir />
    </Sequence>

    {/* Scène 2 — L'App  (75-230fr) */}
    <Sequence from={75} durationInFrames={155}>
      <SceneApp />
    </Sequence>

    {/* Flash cut 2→3 */}
    <Sequence from={226} durationInFrames={10}>
      <AbsoluteFill style={{ background: "#000", zIndex: 99 }} />
    </Sequence>

    {/* Scène 3 — La Voiture  (230-390fr) */}
    <Sequence from={230} durationInFrames={160}>
      <SceneCar />
    </Sequence>

    {/* Flash cut 3→4 */}
    <Sequence from={386} durationInFrames={10}>
      <AbsoluteFill style={{ background: WHITE, opacity: 0.5, zIndex: 99 }} />
    </Sequence>

    {/* Scène 4 — Brand reveal  (390-450fr) */}
    <Sequence from={390} durationInFrames={60}>
      <SceneBrand />
    </Sequence>

  </AbsoluteFill>
);
