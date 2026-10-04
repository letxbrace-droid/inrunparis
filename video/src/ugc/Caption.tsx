import React from "react";
import {
  Interactive,
  type InteractivitySchema,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { ACCENT, INK, OUT, POP } from "./theme";
import { DISPLAY } from "./fonts";

type CaptionProps = {
  readonly children: string;
  /** Words matching this string are painted in the accent colour. */
  readonly highlight: string;
  readonly accentColor: string;
  readonly size: number;
  readonly style?: React.CSSProperties;
};

/**
 * A spoken-caption block, in the register people actually read on a phone:
 * heavy, tight, centred, one idea per card.
 *
 * Words land one after another rather than the block fading in as a lump —
 * that cadence is what makes a caption feel spoken instead of designed. The
 * stagger is 2 frames, fast enough that the sentence still arrives as a
 * sentence.
 */
const CaptionInner: React.FC<CaptionProps> = ({
  children,
  highlight,
  accentColor,
  size,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = children.split(" ");
  // Both sides go through the same normalisation. Matching a raw "même." from
  // the highlight list against a word that has already had its punctuation
  // stripped silently fails, and a caption quietly loses its accent colour.
  const bare = (w: string) => w.toLowerCase().replace(/[.,!?;:«»"']/g, "");
  const marked = highlight.split(" ").map(bare).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: `${size * 0.1}px ${size * 0.26}px`,
        maxWidth: 880,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.035em",
        textAlign: "center",
        textWrap: "balance",
        ...style,
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            color: marked.includes(bare(word)) ? accentColor : INK,
            // Each word carries its own entrance, offset by 2 frames.
            opacity: interpolate(frame, [i * 2, i * 2 + 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: OUT,
            }),
            translate: interpolate(
              frame,
              [i * 2, i * 2 + 9],
              [size * 0.3, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: POP,
              },
            ),
            // A real caption sits on video, so it needs its own contrast
            // rather than borrowing it from whatever is behind.
            textShadow: "0 4px 24px rgba(0,0,0,.75), 0 1px 3px rgba(0,0,0,.9)",
          }}
        >
          {word}
        </span>
      ))}
      {/* fps is read so the component re-renders per frame even if unused */}
      <span style={{ display: "none" }}>{fps}</span>
    </div>
  );
};

const captionSchema = {
  children: { type: "text-content", default: "", description: "Texte" },
  highlight: {
    type: "text-content",
    default: "",
    description: "Mots en orange (séparés par des espaces)",
  },
  accentColor: { type: "color", default: ACCENT, description: "Couleur accent" },
  size: {
    type: "number",
    default: 92,
    description: "Taille de police",
    hiddenFromList: false,
    min: 40,
    max: 160,
    step: 2,
  },
} as const satisfies InteractivitySchema;

export const Caption = Interactive.withSchema({
  Component: CaptionInner,
  componentName: "<Caption>",
  schema: captionSchema,
  wrapInSequence: true,
});
