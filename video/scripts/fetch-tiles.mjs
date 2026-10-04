#!/usr/bin/env node
/**
 * Télécharge les vraies tuiles OpenStreetMap de la scène « app ».
 *
 * La carte vectorielle de secours (scripts/build-map.py) est de la vraie
 * géométrie, mais Natural Earth ne connaît que les autoroutes : à l'écran ça
 * reste une approximation. Ces tuiles-ci sont littéralement l'image que la PWA
 * affiche, au même cadrage.
 *
 *     node scripts/fetch-tiles.mjs
 *
 * Si l'hôte est bloqué — c'est le cas dans un conteneur à égress restreint —
 * le script le dit et ne touche à rien : la composition reste sur la carte
 * vectorielle tant que public/map/manifest.json porte "ready": false.
 *
 * Politique d'usage OSM : un User-Agent identifiant est obligatoire, et ce
 * script télécharge quelques dizaines de tuiles une seule fois, pas à chaque
 * rendu. https://operations.osmfoundation.org/policies/tiles/
 */
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "public", "map");
const UA = "inrunparis-ugc-video/1.0 (https://letxbrace-droid.github.io/inrunparis)";
const TILE = 256;

const vp = JSON.parse(readFileSync(path.join(DIR, "viewport.json"), "utf8"));

// Pick the zoom whose tile pixels are closest to screen pixels. One level too
// low and the map is visibly soft under a 1080-wide render; one too high and
// the download quadruples for detail nobody sees.
const worldPx = (360 / vp.mercSpanX) * vp.w;
const z = Math.min(19, Math.max(1, Math.round(Math.log2(worldPx / TILE))));
const scale = (TILE * 2 ** z) / 360; // px per degree of mercator at this zoom

// Top-left of the viewport in world pixels at this zoom.
const originX = (vp.mercX0 + 180) * scale;
const originY = (180 - vp.mercY1) * scale;
const x0 = Math.floor(originX / TILE);
const y0 = Math.floor(originY / TILE);
const nx = Math.ceil((originX % TILE) / TILE + (vp.mercSpanX * scale) / TILE);
const ny = Math.ceil((originY % TILE) / TILE + (vp.mercSpanY * scale) / TILE);

const manifest = {
  ready: false,
  attribution: "© OpenStreetMap",
  z,
  x0,
  y0,
  nx,
  ny,
  tileSize: TILE,
  // Where tile (x0, y0)'s top-left corner sits in the 620×1343 screen box.
  offsetX: -(originX - x0 * TILE),
  offsetY: -(originY - y0 * TILE),
  tiles: [],
};

await mkdir(DIR, { recursive: true });
console.log(`zoom ${z} · grille ${nx}×${ny} = ${nx * ny} tuiles`);

let ok = 0;
for (let dy = 0; dy < ny; dy++) {
  for (let dx = 0; dx < nx; dx++) {
    const x = x0 + dx;
    const y = y0 + dy;
    const name = `${z}-${x}-${y}.png`;
    const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await writeFile(path.join(DIR, name), Buffer.from(await res.arrayBuffer()));
      manifest.tiles.push({ dx, dy, file: name });
      ok++;
    } catch (err) {
      console.error(`  échec ${name}: ${err.message}`);
    }
  }
}

manifest.ready = ok === nx * ny && ok > 0;
await writeFile(path.join(DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

if (manifest.ready) {
  console.log(`${ok} tuiles écrites · manifest ready:true — la composition bascule dessus toute seule.`);
} else {
  console.error(
    `\n${ok}/${nx * ny} tuiles récupérées. manifest ready:false, la carte vectorielle reste en place.\n` +
      `Si rien n'est passé, tile.openstreetmap.org est bloqué par la politique réseau\n` +
      `de cet environnement — à autoriser dans les réglages avant de relancer.`,
  );
  process.exitCode = 1;
}
