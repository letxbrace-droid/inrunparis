import "./index.css";
import { Composition, Folder, getStaticFiles } from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { InRunAd } from "./InRunAd";
import { InRunUGC } from "./ugc/InRunUGC";
import { Hook } from "./ugc/scenes/Hook";
import { PriceChaos } from "./ugc/scenes/PriceChaos";
import { AppDemo } from "./ugc/scenes/AppDemo";
import { Proof } from "./ugc/scenes/Proof";
import { Driver } from "./ugc/scenes/Driver";
import { Cta } from "./ugc/scenes/Cta";
import { FPS, INTRO_DURATION } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

export const RemotionRoot: React.FC = () => {
  const staticFiles = getStaticFiles();
  const timelines = staticFiles
    .filter((file) => file.name.endsWith("timeline.json"))
    .map((file) => file.name.split("/")[1]);

  return (
    <>
      {/* ── I&N RUN PWA Ad — 15s · 9:16 ── */}
      <Composition
        id="InRunAd"
        component={InRunAd}
        durationInFrames={435}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ── UGC cut — 22s · 9:16 · coupes franches ── */}
      <Composition
        id="InRunUGC"
        component={InRunUGC}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Chaque scène a son propre timeline éditable dans le Studio. */}
      <Folder name="UGC-scenes">
        <Composition id="UGC-Hook" component={Hook} durationInFrames={78} fps={30} width={1080} height={1920} />
        <Composition id="UGC-PriceChaos" component={PriceChaos} durationInFrames={102} fps={30} width={1080} height={1920} />
        <Composition id="UGC-AppDemo" component={AppDemo} durationInFrames={216} fps={30} width={1080} height={1920} />
        <Composition id="UGC-Proof" component={Proof} durationInFrames={114} fps={30} width={1080} height={1920} />
        <Composition id="UGC-Driver" component={Driver} durationInFrames={90} fps={30} width={1080} height={1920} />
        <Composition id="UGC-Cta" component={Cta} durationInFrames={60} fps={30} width={1080} height={1920} />
      </Folder>

      {timelines.map((storyName) => (
        <Composition
          id={storyName}
          component={AIVideo}
          fps={FPS}
          width={1080}
          height={1920}
          schema={aiVideoSchema}
          defaultProps={{
            timeline: null,
          }}
          calculateMetadata={async ({ props }) => {
            const { lengthFrames, timeline } = await loadTimelineFromFile(
              getTimelinePath(storyName),
            );

            return {
              durationInFrames: lengthFrames + INTRO_DURATION,
              props: {
                ...props,
                timeline,
              },
            };
          }}
        />
      ))}
    </>
  );
};
