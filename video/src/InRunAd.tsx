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
  weights: ["400", "600", "700", "900"],
  subsets: ["latin"],
});

// ── Brand tokens ──────────────────────────────────────────────────────────
const BG     = "#060C1A";
const ORANGE = "#FF5A1F";
const WHITE  = "#FFFFFF";

// ── Easing helpers ────────────────────────────────────────────────────────
const OUT  = Easing.bezier(0.16, 1, 0.3, 1);
const POP  = Easing.bezier(0.34, 1.56, 0.64, 1);

function lerp(
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
  easing = OUT,
) {
  return interpolate(frame, [inStart, inEnd], [outStart, outEnd], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

// ── Shared background ─────────────────────────────────────────────────────
function Background({ glow = "right" }: { glow?: "right" | "left" | "center" }) {
  const glowPos =
    glow === "right"
      ? { top: -250, right: -250 }
      : glow === "left"
        ? { bottom: 50, left: -150 }
        : { top: "30%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Grid lines */}
      {[180, 360, 540, 720, 900, 1080, 1260, 1440, 1620, 1800].map((y) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: y,
            height: 1,
            background: "rgba(255,255,255,0.025)",
          }}
        />
      ))}
      {[270, 540, 810].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: x,
            width: 1,
            background: "rgba(255,255,255,0.025)",
          }}
        />
      ))}
      {/* Orange glow orb */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ORANGE}30 0%, transparent 70%)`,
          ...glowPos,
        }}
      />
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — Hook (0-90 frames / 3s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneHook() {
  const f = useCurrentFrame();

  const logoScale   = lerp(f, 0, 28, 0.25, 1, POP);
  const logoOpacity = lerp(f, 0, 18, 0, 1);

  const titleY       = lerp(f, 18, 48, 60, 0);
  const titleOpacity = lerp(f, 18, 42, 0, 1);

  const subY       = lerp(f, 30, 58, 40, 0);
  const subOpacity = lerp(f, 30, 52, 0, 1);

  const badgeY       = lerp(f, 44, 70, 30, 0);
  const badgeOpacity = lerp(f, 44, 64, 0, 1);

  // Exit fade for next scene
  const exitOpacity = lerp(f, 72, 90, 1, 0);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background glow="right" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 36,
          }}
        >
          <Img
            src={staticFile("inrun-icon.png")}
            style={{ width: 130, height: 130, borderRadius: 30 }}
          />
        </div>

        {/* I&N RUN */}
        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
          <span
            style={{
              fontFamily,
              fontSize: 80,
              fontWeight: 900,
              color: WHITE,
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            I
            <em style={{ fontStyle: "italic", fontWeight: 400, color: ORANGE }}>
              &amp;
            </em>
            N RUN
          </span>
        </div>

        {/* Chauffeur Privé */}
        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 12,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 26,
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Chauffeur Privé VTC
          </span>
        </div>

        {/* Paris badge */}
        <div
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            marginTop: 36,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${ORANGE}, #e84000)`,
              borderRadius: 999,
              padding: "14px 36px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: `0 0 40px ${ORANGE}55`,
            }}
          >
            <span style={{ fontSize: 24 }}>📍</span>
            <span
              style={{
                fontFamily,
                fontSize: 26,
                fontWeight: 700,
                color: WHITE,
                letterSpacing: "-0.02em",
              }}
            >
              Paris &amp; Île-de-France
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — App booking demo (90-270 frames / 6s)
// ═══════════════════════════════════════════════════════════════════════════
function BookingRow({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  const f = useCurrentFrame();
  const x       = lerp(f, delay, delay + 30, 60, 0);
  const opacity = lerp(f, delay, delay + 24, 0, 1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${color}22`,
          border: `1.5px solid ${color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily,
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 700,
            color: WHITE,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SceneApp() {
  const f = useCurrentFrame();

  // Phone slides up
  const phoneY       = lerp(f, 0, 35, 140, 0);
  const phoneOpacity = lerp(f, 0, 28, 0, 1);

  // Headline slides in from left
  const headlineX       = lerp(f, 8, 40, -80, 0);
  const headlineOpacity = lerp(f, 8, 36, 0, 1);

  // Connector line draws
  const lineHeight = lerp(f, 45, 80, 0, 64);

  // Estimated price pops in
  const priceScale   = lerp(f, 95, 118, 0.6, 1, POP);
  const priceOpacity = lerp(f, 95, 110, 0, 1);

  // WhatsApp confirm
  const waX       = lerp(f, 120, 148, 80, 0);
  const waOpacity = lerp(f, 120, 144, 0, 1);

  // Exit
  const exitOpacity = lerp(f, 162, 180, 1, 0);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background glow="left" />

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          paddingLeft: 60,
          opacity: headlineOpacity,
          transform: `translateX(${headlineX}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 18,
            fontWeight: 600,
            color: ORANGE,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Réservez en 2 min
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 900,
            color: WHITE,
            letterSpacing: "-2px",
            lineHeight: 1.1,
          }}
        >
          Votre trajet,{"\n"}
          <span style={{ color: ORANGE }}>sur mesure.</span>
        </div>
      </div>

      {/* Phone card */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 48,
          right: 48,
          opacity: phoneOpacity,
          transform: `translateY(${phoneY}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 28,
            padding: "36px 36px 32px",
          }}
        >
          {/* Booking rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <BookingRow
              icon="🟢"
              label="Prise en charge"
              value="Tour Eiffel, Paris"
              color="#22c55e"
              delay={18}
            />

            {/* Connector */}
            <div
              style={{
                marginLeft: 21,
                width: 2,
                height: lineHeight,
                background: `linear-gradient(to bottom, rgba(255,255,255,0.15), ${ORANGE}80)`,
                borderRadius: 1,
                margin: "8px 0 8px 21px",
              }}
            />

            <BookingRow
              icon="🔴"
              label="Destination"
              value="Aéroport CDG T2"
              color={ORANGE}
              delay={55}
            />
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.08)",
              margin: "28px 0",
            }}
          />

          {/* Price */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: priceOpacity,
              transform: `scale(${priceScale})`,
              transformOrigin: "left center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Tarif fixe garanti
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: 42,
                  fontWeight: 900,
                  color: WHITE,
                  letterSpacing: "-1.5px",
                  marginTop: 2,
                }}
              >
                65 €
              </div>
            </div>
            <div
              style={{
                background: `linear-gradient(135deg, ${ORANGE}, #e84000)`,
                borderRadius: 16,
                padding: "16px 28px",
                boxShadow: `0 0 32px ${ORANGE}55`,
              }}
            >
              <span
                style={{
                  fontFamily,
                  fontSize: 20,
                  fontWeight: 700,
                  color: WHITE,
                }}
              >
                Réserver →
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp confirmation */}
        <div
          style={{
            marginTop: 20,
            opacity: waOpacity,
            transform: `translateX(${waX}px)`,
            background: "rgba(37,211,102,0.12)",
            border: "1px solid rgba(37,211,102,0.3)",
            borderRadius: 20,
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 32 }}>💬</span>
          <div>
            <div
              style={{
                fontFamily,
                fontSize: 15,
                fontWeight: 700,
                color: "#25D366",
              }}
            >
              Confirmation WhatsApp
            </div>
            <div
              style={{
                fontFamily,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginTop: 2,
              }}
            >
              Votre chauffeur confirmé en 2 minutes
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — Benefits (270-390 frames / 4s)
// ═══════════════════════════════════════════════════════════════════════════
function BenefitCard({
  icon,
  title,
  sub,
  delay,
}: {
  icon: string;
  title: string;
  sub: string;
  delay: number;
}) {
  const f = useCurrentFrame();
  const y       = lerp(f, delay, delay + 32, 50, 0);
  const opacity = lerp(f, delay, delay + 28, 0, 1);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div style={{ fontSize: 44 }}>{icon}</div>
      <div>
        <div
          style={{
            fontFamily,
            fontSize: 26,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 17,
            fontWeight: 500,
            color: "rgba(255,255,255,0.5)",
            marginTop: 6,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

function SceneBenefits() {
  const f = useCurrentFrame();

  const tagOpacity = lerp(f, 0, 22, 0, 1);
  const tagY       = lerp(f, 0, 22, -20, 0);
  const exitOpacity = lerp(f, 102, 120, 1, 0);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background glow="center" />
      <AbsoluteFill style={{ padding: "120px 48px 80px", flexDirection: "column", gap: 0 }}>
        {/* Tag */}
        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 18,
              fontWeight: 700,
              color: ORANGE,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Pourquoi I&amp;N RUN ?
          </span>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <BenefitCard
            icon="🔒"
            title="Tarif fixe garanti"
            sub="Aucune surprise · Devis immédiat"
            delay={12}
          />
          <BenefitCard
            icon="⏰"
            title="Disponible 24h/7j"
            sub="Paris · CDG · Orly · Disneyland"
            delay={34}
          />
          <BenefitCard
            icon="💬"
            title="Confirmé via WhatsApp"
            sub="Réponse en moins de 2 minutes"
            delay={56}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — CTA / Install (390-450 frames / 2s)
// ═══════════════════════════════════════════════════════════════════════════
function SceneCTA() {
  const f = useCurrentFrame();

  const opacity  = lerp(f, 0, 20, 0, 1);
  const logoY    = lerp(f, 0, 25, 30, 0, POP);
  const titleY   = lerp(f, 8, 32, 30, 0);
  const btnScale = lerp(f, 18, 42, 0.7, 1, POP);
  const btnOp    = lerp(f, 18, 36, 0, 1);
  const urlOp    = lerp(f, 32, 50, 0, 1);

  // Pulsing glow on button
  const pulse = interpolate(
    f,
    [0, 30, 60],
    [1, 1.06, 1],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background glow="center" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Logo small */}
        <div style={{ opacity: 1, transform: `translateY(${logoY}px)`, marginBottom: 28 }}>
          <Img
            src={staticFile("inrun-icon.png")}
            style={{ width: 90, height: 90, borderRadius: 22 }}
          />
        </div>

        {/* Headline */}
        <div
          style={{
            opacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
            padding: "0 48px",
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 52,
              fontWeight: 900,
              color: WHITE,
              letterSpacing: "-2.5px",
              lineHeight: 1.1,
            }}
          >
            Votre chauffeur
            <br />
            <span style={{ color: ORANGE }}>en 2 minutes.</span>
          </div>
        </div>

        {/* Install button */}
        <div
          style={{
            marginTop: 52,
            opacity: btnOp,
            transform: `scale(${btnScale * pulse})`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${ORANGE}, #e84000)`,
              borderRadius: 999,
              padding: "22px 60px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: `0 0 60px ${ORANGE}60, 0 0 120px ${ORANGE}25`,
            }}
          >
            <span style={{ fontSize: 28 }}>📲</span>
            <span
              style={{
                fontFamily,
                fontSize: 28,
                fontWeight: 800,
                color: WHITE,
                letterSpacing: "-0.5px",
              }}
            >
              Installer l&apos;app
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 28,
            opacity: urlOp,
            fontFamily,
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.04em",
          }}
        >
          inrunparis.github.io/inrunparis
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════
export const InRunAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Scene 1 — Hook */}
      <Sequence from={0} durationInFrames={90}>
        <SceneHook />
      </Sequence>

      {/* Scene 2 — App booking */}
      <Sequence from={90} durationInFrames={180}>
        <SceneApp />
      </Sequence>

      {/* Scene 3 — Benefits */}
      <Sequence from={270} durationInFrames={120}>
        <SceneBenefits />
      </Sequence>

      {/* Scene 4 — CTA */}
      <Sequence from={390} durationInFrames={60}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
