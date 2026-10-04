import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fonts, served from this repo rather than fetched from Google at render time.
 *
 * A render that reaches the network is a render that can fail for reasons that
 * have nothing to do with the video — a blocked host, a proxy, a plane. These
 * are the same three families the PWA uses, latin subset, variable where the
 * family is variable, and they weigh 95 kB in total.
 */
export const DISPLAY = "Bricolage Grotesque";
export const UI = "Outfit";
export const MONO = "JetBrains Mono";

export const fontsReady = Promise.all([
  loadFont({
    family: DISPLAY,
    url: staticFile("fonts/bricolage-grotesque.woff2"),
    weight: "400 800",
    format: "woff2",
  }),
  loadFont({
    family: UI,
    url: staticFile("fonts/outfit.woff2"),
    weight: "400 800",
    format: "woff2",
  }),
  loadFont({
    family: MONO,
    url: staticFile("fonts/jetbrains-mono.woff2"),
    weight: "500",
    format: "woff2",
  }),
]);

/**
 * Condensed display face, for numbers and labels only.
 *
 * Bricolage is the voice; Barlow Condensed is the shout. A price set in a
 * condensed face at 320px reads as a headline, where the same figure in the
 * body grotesk just reads as large text — and because it is narrow, it leaves
 * room on either side instead of filling the frame edge to edge.
 */
export { BARLOW_CONDENSED as CONDENSED } from "../lib/fonts";
