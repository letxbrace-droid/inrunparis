import React from "react";
import { AbsoluteFill, Sequence, Series, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { BG } from "./theme";
import { CutIn } from "./CutIn";
import { Hook } from "./scenes/Hook";
import { PriceChaos } from "./scenes/PriceChaos";
import { AppDemo } from "./scenes/AppDemo";
import { Proof } from "./scenes/Proof";
import { Driver } from "./scenes/Driver";
import { Cta } from "./scenes/Cta";

// The cuts, in absolute frames. Every sound in the film is placed against this
// list, so retiming a scene means changing one number here and the audio
// follows instead of drifting out of sync.
const CUT_PRICE = 78;
const CUT_APP = 180;
const CUT_PROOF = 396;
const CUT_DRIVER = 510;
const CUT_CTA = 600;

/**
 * I&N RUN — UGC cut · 22s · 9:16
 *
 * Hard cuts between scenes, on purpose. A crossfade is the grammar of a brand
 * film; a jump cut is the grammar of someone talking to a camera, and that is
 * the register this is written in. The arithmetic stays exact as a result:
 * 78 + 102 + 216 + 114 + 90 + 60 = 660 frames.
 *
 * What turns those cuts from edits into beats is that three things land on the
 * same frame: the picture changes, the incoming scene is still settling
 * (<CutIn>), and an impact hits. Any one alone is a transition; all three is a
 * cut you feel.
 */
export const InRunUGC: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Series>
        <Series.Sequence name="Hook" durationInFrames={78} premountFor={fps}>
          <CutIn from={1.08}>
            <Hook />
          </CutIn>
        </Series.Sequence>
        <Series.Sequence name="Le prix qui monte" durationInFrames={102} premountFor={fps}>
          <CutIn from={1.07}>
            <PriceChaos />
          </CutIn>
        </Series.Sequence>
        <Series.Sequence name="L'app" durationInFrames={216} premountFor={fps}>
          <CutIn from={1.05} strength={0.7}>
            <AppDemo />
          </CutIn>
        </Series.Sequence>
        <Series.Sequence name="WhatsApp" durationInFrames={114} premountFor={fps}>
          <CutIn from={1.05} strength={0.7}>
            <Proof />
          </CutIn>
        </Series.Sequence>
        <Series.Sequence name="Le chauffeur" durationInFrames={90} premountFor={fps}>
          <CutIn from={1.09}>
            <Driver />
          </CutIn>
        </Series.Sequence>
        <Series.Sequence name="Carte de fin" durationInFrames={60} premountFor={fps}>
          <CutIn from={1.06}>
            <Cta />
          </CutIn>
        </Series.Sequence>
      </Series>

      {/* ── Lit musical ────────────────────────────────────────────────────
          One continuous bed under the whole film. Its intensity automation is
          baked into the file rather than keyframed here, so the mix cannot
          drift out of step with the edit when a scene is retimed. */}
      <Audio name="Lit musical" src={staticFile("sfx/bed.mp3")} volume={0.6} premountFor={fps} />

      {/* ── Transitions ────────────────────────────────────────────────────
          The whoosh starts four frames BEFORE the cut and the impact lands on
          it. A whoosh that begins on the cut arrives late: the ear needs the
          approach to read the arrival. */}
      <Audio name="Riser d'ouverture" src={staticFile("sfx/riser.wav")} from={CUT_PRICE - 40} volume={0.38} premountFor={fps} />
      <Audio name="Whoosh → prix" src={staticFile("sfx/whoosh.wav")} from={CUT_PRICE - 11} volume={0.5} premountFor={fps} />
      <Audio name="Impact → prix" src={staticFile("sfx/impact.wav")} from={CUT_PRICE} volume={0.72} premountFor={fps} />

      <Audio name="Whoosh → app" src={staticFile("sfx/whoosh-rev.wav")} from={CUT_APP - 14} volume={0.46} premountFor={fps} />
      <Audio name="Impact → app" src={staticFile("sfx/impact.wav")} from={CUT_APP} volume={0.6} premountFor={fps} />

      <Audio name="Whoosh → WhatsApp" src={staticFile("sfx/whoosh.wav")} from={CUT_PROOF - 11} volume={0.42} premountFor={fps} />
      <Audio name="Impact → WhatsApp" src={staticFile("sfx/impact.wav")} from={CUT_PROOF} volume={0.5} premountFor={fps} />

      {/* The car is the one arrival that earns a riser in front of it. */}
      <Audio name="Riser → voiture" src={staticFile("sfx/riser.wav")} from={CUT_DRIVER - 34} volume={0.46} premountFor={fps} />
      <Audio name="Impact → voiture" src={staticFile("sfx/impact.wav")} from={CUT_DRIVER} volume={0.85} premountFor={fps} />

      <Audio name="Whoosh → fin" src={staticFile("sfx/whoosh.wav")} from={CUT_CTA - 11} volume={0.5} premountFor={fps} />
      <Audio name="Impact → fin" src={staticFile("sfx/impact.wav")} from={CUT_CTA} volume={0.78} premountFor={fps} />

      {/* ── Accents ────────────────────────────────────────────────────────
          Each surge in the price scene gets its own hit, on the frame the
          figure changes. */}
      <Audio name="Surge 42 €" src={staticFile("sfx/stamp.wav")} from={CUT_PRICE + 6} volume={0.4} premountFor={fps} />
      <Audio name="Surge 58 €" src={staticFile("sfx/stamp.wav")} from={CUT_PRICE + 26} volume={0.52} premountFor={fps} />
      <Audio name="Surge 71 €" src={staticFile("sfx/stamp.wav")} from={CUT_PRICE + 46} volume={0.68} premountFor={fps} />

      {/* Keyboard. One template deliberately repeated, not sixteen things to
          edit separately — so this one is a loop. */}
      <Sequence name="Frappe clavier" from={CUT_APP + 30} durationInFrames={34} premountFor={fps}>
        {Array.from({ length: 12 }, (_, i) => (
          <Audio
            key={i}
            src={staticFile("sfx/tick.wav")}
            from={i * 3}
            volume={0.2}
            premountFor={fps}
          />
        ))}
      </Sequence>

      <Audio name="Prix verrouillé" src={staticFile("sfx/stamp.wav")} from={CUT_APP + 136} volume={0.62} premountFor={fps} />
      <Audio name="Appui WhatsApp" src={staticFile("sfx/tick.wav")} from={CUT_APP + 169} volume={0.5} premountFor={fps} />

      <Audio name="Message 1" src={staticFile("sfx/tick.wav")} from={CUT_PROOF + 4} volume={0.34} premountFor={fps} />
      <Audio name="Message 2" src={staticFile("sfx/tick.wav")} from={CUT_PROOF + 30} volume={0.34} premountFor={fps} />
      <Audio name="Message 3" src={staticFile("sfx/tick.wav")} from={CUT_PROOF + 54} volume={0.34} premountFor={fps} />
    </AbsoluteFill>
  );
};
