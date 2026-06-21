import "./index.css";
import { Composition, getStaticFiles } from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { InRunAd } from "./InRunAd";
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
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

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
