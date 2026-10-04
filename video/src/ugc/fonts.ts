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
