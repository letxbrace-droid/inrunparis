import React from "react";
import { AbsoluteFill, Series, useVideoConfig } from "remotion";
import { BG } from "./theme";
import { Hook } from "./scenes/Hook";
import { PriceChaos } from "./scenes/PriceChaos";
import { AppDemo } from "./scenes/AppDemo";
import { Proof } from "./scenes/Proof";
import { Driver } from "./scenes/Driver";
import { Cta } from "./scenes/Cta";

/**
 * I&N RUN — UGC cut · 22s · 9:16
 *
 * Hard cuts between scenes, on purpose. Crossfades are the grammar of a brand
 * film; a jump cut is the grammar of someone talking to a camera, and that is
 * the register this is written in. The arithmetic is also exact as a result:
 * 78 + 102 + 216 + 114 + 90 + 60 = 660 frames.
 */
export const InRunUGC: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Series>
        <Series.Sequence name="Hook" durationInFrames={78} premountFor={fps}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence name="Le prix qui monte" durationInFrames={102} premountFor={fps}>
          <PriceChaos />
        </Series.Sequence>
        <Series.Sequence name="L'app" durationInFrames={216} premountFor={fps}>
          <AppDemo />
        </Series.Sequence>
        <Series.Sequence name="WhatsApp" durationInFrames={114} premountFor={fps}>
          <Proof />
        </Series.Sequence>
        <Series.Sequence name="Le chauffeur" durationInFrames={90} premountFor={fps}>
          <Driver />
        </Series.Sequence>
        <Series.Sequence name="Carte de fin" durationInFrames={60} premountFor={fps}>
          <Cta />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
