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
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

// ── Brand tokens ──────────────────────────────────────────────────────────
const BG     = "#060C1A";
const ORANGE = "#FF5A1F";
const WHITE  = "#FFFFFF";

// ── Easing presets ────────────────────────────────────────────────────────
const OUT = Easing.bezier(0.16, 1, 0.3, 1);   // snappy deceleration
const POP = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot

function o(
  frame: number,
  i0: number, i1: number,
  o0: number, o1: number,
  ease = OUT,
) {
  return interpolate(frame, [i0, i1], [o0, o1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
}

// ── Shared dark background with orange glow ───────────────────────────────
function Bg({ x = 80, y = -10 }: { x?: number; y?: number }) {
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        width: 800, height: 800,
        borderRadius: "50%",
        top: `${y}%`, left: `${x}%`,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${ORANGE}28 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — Hook cinétique  (0-90fr / 3s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneHook() {
  const f = useCurrentFrame();

  // Flash d'entrée
  const flashIn = o(f, 0, 10, 1, 0);

  // Logo pop
  const logoS  = o(f, 8, 24, 0, 1, POP);
  const logoOp = o(f, 8, 20, 0, 1);

  // "I&N" glisse depuis la gauche
  const inX  = o(f, 14, 30, -220, 0);
  const inOp = o(f, 14, 26, 0, 1);

  // "RUN" glisse depuis la droite
  const runX  = o(f, 20, 36, 220, 0);
  const runOp = o(f, 20, 32, 0, 1);

  // Ligne orange se dessine
  const lineW = o(f, 30, 50, 0, 240);

  // Sous-titre monte
  const subY  = o(f, 36, 52, 28, 0);
  const subOp = o(f, 36, 50, 0, 1);

  // Badge Paris claque
  const badgeS  = o(f, 48, 62, 0.5, 1, POP);
  const badgeOp = o(f, 48, 60, 0, 1);

  // Exit fade
  const exitOp = o(f, 76, 90, 1, 0);

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <Bg x={80} y={5} />

      {/* Flash d'entrée */}
      <AbsoluteFill style={{ background: "#000", opacity: flashIn, zIndex: 50 }} />

      <AbsoluteFill style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{
          opacity: logoOp,
          transform: `scale(${logoS})`,
          marginBottom: 32,
        }}>
          <Img
            src={staticFile("inrun-icon.png")}
            style={{ width: 110, height: 110, borderRadius: 26 }}
          />
        </div>

        {/* I&N | RUN côte à côte */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{
            fontFamily, fontSize: 96, fontWeight: 900,
            color: WHITE, letterSpacing: "-5px", lineHeight: 1,
            opacity: inOp,
            transform: `translateX(${inX}px)`,
            display: "block",
          }}>I<em style={{ fontStyle: "italic", fontWeight: 400, color: ORANGE }}>&amp;</em>N</span>

          <span style={{ display: "block", width: 16 }} />

          <span style={{
            fontFamily, fontSize: 96, fontWeight: 900,
            color: WHITE, letterSpacing: "-5px", lineHeight: 1,
            opacity: runOp,
            transform: `translateX(${runX}px)`,
            display: "block",
          }}>RUN</span>
        </div>

        {/* Ligne orange */}
        <div style={{
          width: lineW, height: 3, borderRadius: 999,
          background: `linear-gradient(90deg, ${ORANGE}, #FF8C5A)`,
          marginTop: 14,
          boxShadow: `0 0 16px ${ORANGE}80`,
        }} />

        {/* Sous-titre */}
        <div style={{
          opacity: subOp,
          transform: `translateY(${subY}px)`,
          marginTop: 16,
        }}>
          <span style={{
            fontFamily, fontSize: 22, fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            Chauffeur Privé · VTC
          </span>
        </div>

        {/* Badge Paris */}
        <div style={{
          opacity: badgeOp,
          transform: `scale(${badgeS})`,
          marginTop: 36,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${ORANGE}22, ${ORANGE}0A)`,
            border: `1.5px solid ${ORANGE}80`,
            borderRadius: 999,
            padding: "12px 32px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>📍</span>
            <span style={{
              fontFamily, fontSize: 24, fontWeight: 800,
              color: ORANGE, letterSpacing: "-0.5px",
            }}>Paris · CDG · Orly</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — Action / réservation  (90-240fr / 5s)
// ═══════════════════════════════════════════════════════════════════════════
function KineticWord({
  text, delay, fromDir = "bottom", size = 60, weight = 900, color = WHITE,
}: {
  text: string; delay: number; fromDir?: "bottom" | "left" | "right" | "top";
  size?: number; weight?: number; color?: string;
}) {
  const f = useCurrentFrame();
  const dx = fromDir === "left" ? -80 : fromDir === "right" ? 80 : 0;
  const dy = fromDir === "bottom" ? 50 : fromDir === "top" ? -50 : 0;
  const x  = o(f, delay, delay + 18, dx, 0);
  const y  = o(f, delay, delay + 18, dy, 0);
  const op = o(f, delay, delay + 14, 0, 1);

  return (
    <span style={{
      display: "inline-block",
      opacity: op,
      transform: `translate(${x}px, ${y}px)`,
      fontFamily, fontSize: size, fontWeight: weight, color,
      letterSpacing: "-1.5px", lineHeight: 1.15,
    }}>
      {text}
    </span>
  );
}

function SceneAction() {
  const f = useCurrentFrame();

  // Headline
  const headOp = o(f, 0, 18, 0, 1);

  // Booking steps
  const step1Y  = o(f, 20, 36, 50, 0);
  const step1Op = o(f, 20, 34, 0, 1);

  const arrowS  = o(f, 36, 50, 0, 1, POP);
  const arrowOp = o(f, 36, 48, 0, 1);

  const step2Y  = o(f, 48, 64, 50, 0);
  const step2Op = o(f, 48, 62, 0, 1);

  // Prix claque
  const prixS  = o(f, 72, 88, 0.4, 1, POP);
  const prixOp = o(f, 72, 84, 0, 1);

  // WA confirm glisse
  const waX  = o(f, 95, 112, 120, 0);
  const waOp = o(f, 95, 110, 0, 1);

  // Exit
  const exitOp = o(f, 132, 150, 1, 0);

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <Bg x={20} y={85} />

      <AbsoluteFill style={{ padding: "100px 52px 60px", flexDirection: "column" }}>

        {/* Headline kinétique */}
        <div style={{ opacity: headOp, marginBottom: 52 }}>
          <div style={{ overflow: "hidden" }}>
            <KineticWord text="Votre trajet," delay={2} size={58} fromDir="left" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <KineticWord text="sur-mesure." delay={10} size={58} fromDir="left" color={ORANGE} />
          </div>
          <div style={{ marginTop: 12 }}>
            <KineticWord text="En 2 minutes via WhatsApp." delay={20} size={22}
              weight={600} color="rgba(255,255,255,0.5)" fromDir="bottom" />
          </div>
        </div>

        {/* Step 1 */}
        <div style={{
          opacity: step1Op, transform: `translateY(${step1Y}px)`,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: "22px 28px",
          display: "flex", alignItems: "center", gap: 18,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>🟢</div>
          <div>
            <div style={{ fontFamily, fontSize: 13, fontWeight: 600,
              color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Prise en charge
            </div>
            <div style={{ fontFamily, fontSize: 24, fontWeight: 800, color: WHITE, marginTop: 2 }}>
              Tour Eiffel, Paris 7e
            </div>
          </div>
        </div>

        {/* Flèche */}
        <div style={{
          marginLeft: 24, marginTop: 6, marginBottom: 6,
          opacity: arrowOp, transform: `scaleY(${arrowS})`, transformOrigin: "top",
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 2, height: 12, borderRadius: 1,
              background: `rgba(${i === 2 ? "255,90,31" : "255,255,255"},${i === 2 ? 0.8 : 0.2})`,
            }} />
          ))}
          <span style={{ fontSize: 20 }}>🔴</span>
        </div>

        {/* Step 2 */}
        <div style={{
          opacity: step2Op, transform: `translateY(${step2Y}px)`,
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${ORANGE}44`,
          borderRadius: 20, padding: "22px 28px",
          display: "flex", alignItems: "center", gap: 18,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `${ORANGE}20`, border: `1.5px solid ${ORANGE}55`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>✈️</div>
          <div>
            <div style={{ fontFamily, fontSize: 13, fontWeight: 600,
              color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Destination
            </div>
            <div style={{ fontFamily, fontSize: 24, fontWeight: 800, color: WHITE, marginTop: 2 }}>
              Aéroport CDG T2E
            </div>
          </div>
        </div>

        {/* Prix */}
        <div style={{
          marginTop: 28,
          opacity: prixOp, transform: `scale(${prixS})`, transformOrigin: "left center",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily, fontSize: 13, fontWeight: 600,
              color: ORANGE, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Tarif fixe garanti
            </div>
            <div style={{ fontFamily, fontSize: 56, fontWeight: 900,
              color: WHITE, letterSpacing: "-3px", lineHeight: 1 }}>
              65 €
            </div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${ORANGE}, #e84000)`,
            borderRadius: 18, padding: "18px 30px",
            boxShadow: `0 0 40px ${ORANGE}55`,
          }}>
            <span style={{ fontFamily, fontSize: 22, fontWeight: 800, color: WHITE }}>
              Réserver →
            </span>
          </div>
        </div>

        {/* WhatsApp */}
        <div style={{
          marginTop: 20,
          opacity: waOp, transform: `translateX(${waX}px)`,
          background: "rgba(37,211,102,0.1)",
          border: "1px solid rgba(37,211,102,0.28)",
          borderRadius: 18, padding: "16px 24px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ fontSize: 30 }}>💬</span>
          <div>
            <div style={{ fontFamily, fontSize: 16, fontWeight: 800, color: "#25D366" }}>
              Confirmation WhatsApp
            </div>
            <div style={{ fontFamily, fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Chauffeur confirmé en moins de 2 min
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — Features en stickers  (240-360fr / 4s)
// ═══════════════════════════════════════════════════════════════════════════
function Sticker({
  icon, line1, line2, delay, fromDir = "bottom",
}: {
  icon: string; line1: string; line2: string;
  delay: number; fromDir?: "left" | "right" | "bottom";
}) {
  const f = useCurrentFrame();
  const dx = fromDir === "left" ? -120 : fromDir === "right" ? 120 : 0;
  const dy = fromDir === "bottom" ? 80 : 0;
  const s  = o(f, delay, delay + 22, 0.7, 1, POP);
  const op = o(f, delay, delay + 16, 0, 1);
  const x  = o(f, delay, delay + 22, dx, 0);
  const y  = o(f, delay, delay + 22, dy, 0);

  return (
    <div style={{
      opacity: op,
      transform: `translate(${x}px, ${y}px) scale(${s})`,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 24, padding: "28px 30px",
      display: "flex", alignItems: "center", gap: 20,
    }}>
      <span style={{ fontSize: 42, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontFamily, fontSize: 24, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px" }}>
          {line1}
        </div>
        <div style={{ fontFamily, fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
          {line2}
        </div>
      </div>
    </div>
  );
}

function SceneFeatures() {
  const f = useCurrentFrame();
  const titleOp = o(f, 0, 18, 0, 1);
  const titleY  = o(f, 0, 18, -20, 0);
  const exitOp  = o(f, 100, 118, 1, 0);

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <Bg x={50} y={50} />
      <AbsoluteFill style={{ padding: "110px 48px 80px", flexDirection: "column", gap: 24 }}>

        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 8 }}>
          <span style={{
            fontFamily, fontSize: 16, fontWeight: 700,
            color: ORANGE, letterSpacing: "0.18em", textTransform: "uppercase",
          }}>Pourquoi I&amp;N RUN ?</span>
        </div>

        <Sticker icon="🔒" line1="Tarif fixe garanti" line2="Aucune surprise, devis immédiat" delay={10} fromDir="left" />
        <Sticker icon="⏰" line1="Dispo 24h · 7j/7" line2="Paris · CDG · Orly · Disneyland" delay={28} fromDir="right" />
        <Sticker icon="💬" line1="WhatsApp · 2 min" line2="Confirmation directe par message" delay={46} fromDir="left" />
        <Sticker icon="🚘" line1="Véhicules premium" line2="Mercedes · Viano · Classe E" delay={64} fromDir="right" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — CTA  (360-450fr / 3s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneCTA() {
  const f = useCurrentFrame();

  // Flash d'entrée scène 4
  const flashIn = o(f, 0, 10, 1, 0);

  const logoOp = o(f, 8, 24, 0, 1);
  const logoS  = o(f, 8, 24, 0.5, 1, POP);

  const line1X  = o(f, 16, 34, -100, 0);
  const line1Op = o(f, 16, 30, 0, 1);

  const line2X  = o(f, 24, 42, 100, 0);
  const line2Op = o(f, 24, 38, 0, 1);

  // Bouton pulse
  const btnS  = o(f, 38, 56, 0.6, 1, POP);
  const btnOp = o(f, 38, 52, 0, 1);

  const pulse = interpolate(
    f % 30,
    [0, 15, 30],
    [1, 1.04, 1],
    { extrapolateRight: "clamp" },
  );

  const urlOp = o(f, 56, 72, 0, 1);

  return (
    <AbsoluteFill>
      <Bg x={50} y={45} />

      {/* Flash d'entrée */}
      <AbsoluteFill style={{ background: "#000", opacity: flashIn, zIndex: 50 }} />

      <AbsoluteFill style={{
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 0,
      }}>
        {/* Logo */}
        <div style={{ opacity: logoOp, transform: `scale(${logoS})`, marginBottom: 36 }}>
          <Img
            src={staticFile("inrun-icon.png")}
            style={{ width: 100, height: 100, borderRadius: 24 }}
          />
        </div>

        {/* Copy 2 lignes en kinetic */}
        <div style={{ textAlign: "center", padding: "0 48px" }}>
          <div style={{
            opacity: line1Op, transform: `translateX(${line1X}px)`,
            fontFamily, fontSize: 58, fontWeight: 900,
            color: WHITE, letterSpacing: "-2.5px", lineHeight: 1.1,
          }}>
            Prenez la route.
          </div>
          <div style={{
            opacity: line2Op, transform: `translateX(${line2X}px)`,
            fontFamily, fontSize: 58, fontWeight: 900,
            color: ORANGE, letterSpacing: "-2.5px", lineHeight: 1.1,
          }}>
            Maintenant.
          </div>
        </div>

        {/* Bouton install */}
        <div style={{
          marginTop: 52,
          opacity: btnOp,
          transform: `scale(${btnS * pulse})`,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${ORANGE}, #d63500)`,
            borderRadius: 999, padding: "22px 56px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: `0 0 60px ${ORANGE}55, 0 0 120px ${ORANGE}22`,
          }}>
            <span style={{ fontSize: 28 }}>📲</span>
            <span style={{ fontFamily, fontSize: 28, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px" }}>
              Installer l&apos;app
            </span>
          </div>
        </div>

        {/* URL */}
        <div style={{ marginTop: 24, opacity: urlOp }}>
          <span style={{ fontFamily, fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
            letxbrace-droid.github.io/inrunparis
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
export const InRunAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>

      {/* Musique lounge/jazz — place un fichier music.mp3 dans video/public/ */}
      {/* <Audio src={staticFile("music.mp3")} volume={0.35} /> */}

      {/* Scène 1 — Hook  0-90fr */}
      <Sequence from={0} durationInFrames={90}>
        <SceneHook />
      </Sequence>

      {/* Scène 2 — Action  90-240fr */}
      <Sequence from={90} durationInFrames={150}>
        <SceneAction />
      </Sequence>

      {/* Flash cut entre scène 2 et 3 */}
      <Sequence from={236} durationInFrames={12}>
        <AbsoluteFill style={{ background: "#000", zIndex: 99 }} />
      </Sequence>

      {/* Scène 3 — Features  240-360fr */}
      <Sequence from={240} durationInFrames={120}>
        <SceneFeatures />
      </Sequence>

      {/* Flash cut entre scène 3 et 4 */}
      <Sequence from={356} durationInFrames={12}>
        <AbsoluteFill style={{ background: "#000", zIndex: 99 }} />
      </Sequence>

      {/* Scène 4 — CTA  360-450fr */}
      <Sequence from={360} durationInFrames={90}>
        <SceneCTA />
      </Sequence>

    </AbsoluteFill>
  );
};
