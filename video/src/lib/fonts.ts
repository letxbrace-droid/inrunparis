import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Every font this project uses, served from public/fonts rather than fetched
 * from Google at render time.
 *
 * `@remotion/google-fonts` downloads the woff2 from fonts.gstatic.com while the
 * frame is being rendered, so a render needs working HTTPS to that host — on a
 * locked-down CI runner, behind a proxy, or offline, it fails with "Failed to
 * fetch" before a single frame exists. These are the same faces, same latin
 * subset, now part of the repo.
 */
export const BARLOW_CONDENSED = "Barlow Condensed";
export const SPACE_GROTESK = "Space Grotesk";
export const BREE_SERIF = "Bree Serif";

export const legacyFontsReady = Promise.all([
  loadFont({ family: BARLOW_CONDENSED, url: staticFile("fonts/barlow-condensed-700.woff2"), weight: "700", format: "woff2" }),
  loadFont({ family: BARLOW_CONDENSED, url: staticFile("fonts/barlow-condensed-800.woff2"), weight: "800", format: "woff2" }),
  loadFont({ family: BARLOW_CONDENSED, url: staticFile("fonts/barlow-condensed-900.woff2"), weight: "900", format: "woff2" }),
  loadFont({ family: SPACE_GROTESK, url: staticFile("fonts/space-grotesk.woff2"), weight: "400 700", format: "woff2" }),
  loadFont({ family: BREE_SERIF, url: staticFile("fonts/bree-serif.woff2"), weight: "400", format: "woff2" }),
]);
