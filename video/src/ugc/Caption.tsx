import React from "react";
import {
  Interactive,
  type InteractivitySchema,
  useCurrentFrame,
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

const STAGGER = 2.4;

/**
 * A spoken-caption block, in the register people actually read on a phone:
 * heavy, tight, centred, one idea per card.
 *
 * Four things happen to every word as it lands, and the reason it reads as
 * expensive is that no single one of them is noticeable:
 *
 *   · it rises out from behind a clip edge, so it is uncovered rather than
 *     moved — a word that merely slides in has no relationship to the line
 *     it belongs to
 *   · its weight animates 380 → 800. Bricolage is a variable font, so this is
 *     one axis interpolating, not two files swapping; the word visibly gains
 *     mass as it arrives and that is what sells the whole caption
 *   · its tracking settles from loose to tight, which reads as the line
 *     locking into place
 *   · it comes in a hair out of focus and sharpens
 *
 * The stagger is 2.4 frames — fast enough that the sentence still arrives as a
 * sentence rather than as a list of words.
 */
const CaptionInner: React.FC<CaptionProps> = ({
  children,
  highlight,
  accentColor,
  size,
  style,
}) => {
  const frame = useCurrentFrame();
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
        alignItems: "flex-end",
        gap: `${size * 0.06}px ${size * 0.24}px`,
        maxWidth: 880,
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 1.04,
        textAlign: "center",
        textWrap: "balance",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const t0 = i * STAGGER;
        const isMarked = marked.includes(bare(word));
        return (
          <span
            key={`${word}-${i}`}
            style={{
              position: "relative",
              display: "inline-block",
              // The clip box. Generous top padding, pulled back with a
              // matching negative margin, so accented capitals (Ê, É) are not
              // guillotined by the very edge that creates the reveal.
              overflow: "hidden",
              paddingTop: size * 0.26,
              marginTop: -size * 0.26,
              paddingBottom: size * 0.12,
              marginBottom: -size * 0.12,
            }}
          >
            <span
              style={{
                display: "inline-block",
                color: isMarked ? accentColor : INK,
                fontVariationSettings: `'wght' ${interpolate(
                  frame,
                  [t0, t0 + 16],
                  [380, 800],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT },
                )}`,
                letterSpacing: `${interpolate(frame, [t0, t0 + 16], [0.055, -0.035], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: OUT,
                })}em`,
                filter: `blur(${interpolate(frame, [t0, t0 + 7], [7, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: OUT,
                })}px)`,
                opacity: interpolate(frame, [t0, t0 + 5], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: OUT,
                }),
                translate: `0 ${interpolate(frame, [t0, t0 + 13], [size * 1.1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: POP,
                })}px`,
                // A caption sits on picture, so it carries its own contrast
                // instead of borrowing it from whatever is behind.
                textShadow: "0 4px 24px rgba(0,0,0,.75), 0 1px 3px rgba(0,0,0,.9)",
              }}
            >
              {word}
            </span>

            {/* Accent words get a rule wiped under them, a beat late. It is
                the one gesture in the caption that is meant to be noticed. */}
            {isMarked ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: size * 0.13,
                  height: Math.max(3, size * 0.045),
                  borderRadius: 99,
                  background: accentColor,
                  transformOrigin: "left center",
                  scale: `${interpolate(frame, [t0 + 9, t0 + 24], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: OUT,
                  })} 1`,
                }}
              />
            ) : null}
          </span>
        );
      })}
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
