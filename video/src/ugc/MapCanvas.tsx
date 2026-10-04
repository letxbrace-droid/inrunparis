import React from "react";
import { CanvasImage, staticFile } from "remotion";
import {
  ARRONDISSEMENTS,
  COMMUNES,
  MOTORWAYS,
  SEINE,
} from "./map-data";
import { SCREEN_H, SCREEN_W } from "./PhoneFrame";
import rawManifest from "../../public/map/manifest.json";

type TileManifest = {
  readonly ready: boolean;
  readonly tileSize: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly tiles: readonly { readonly dx: number; readonly dy: number; readonly file: string }[];
};

// `tiles` is [] until scripts/fetch-tiles.mjs has run, so TypeScript infers
// never[] from the checked-in file and every field access fails. Assert the
// shape the fetcher writes.
const manifest = rawManifest as TileManifest;

/**
 * The basemap inside the phone.
 *
 * Two implementations, one switch. When public/map/manifest.json says ready,
 * these are the actual OpenStreetMap raster tiles the PWA serves, at the same
 * framing — run `node scripts/fetch-tiles.mjs` to fetch them. Until then it
 * draws real OSM *geometry* instead: the motorway the trip uses, the twenty
 * arrondissements, 198 communes and the Seine, projected to this exact
 * viewport so markers land in the same place either way.
 *
 * The fallback is honest about what it is. Natural Earth knows motorways and
 * not streets, so it cannot look like a street map however it is styled; what
 * it can do is be right about where Paris, the river and the A1 are.
 */
export const MapCanvas: React.FC = () => {
  if (manifest.ready) {
    return (
      <>
        {manifest.tiles.map((t) => (
          <CanvasImage
            key={t.file}
            src={staticFile(`map/${t.file}`)}
            style={{
              position: "absolute",
              left: manifest.offsetX + t.dx * manifest.tileSize,
              top: manifest.offsetY + t.dy * manifest.tileSize,
              width: manifest.tileSize,
              height: manifest.tileSize,
            }}
          />
        ))}
        {/* The app inverts OSM's light tiles for dark mode; the video has to
            match or the phone in the ad is not the app being advertised. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "invert(1) hue-rotate(180deg) brightness(.92) contrast(.9) saturate(.55)",
          }}
        />
      </>
    );
  }

  return (
    <svg
      width={SCREEN_W}
      height={SCREEN_H}
      viewBox={`0 0 ${SCREEN_W} ${SCREEN_H}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <rect width={SCREEN_W} height={SCREEN_H} fill="#090A0C" />

      {/* Communes, shaded by how small they are. Tight footprints mean inner
          suburb, sprawling ones mean countryside, so the fill alone carries
          the city fading out towards Roissy. */}
      {COMMUNES.map(([d, density], i) => (
        <path
          key={`c${i}`}
          d={d}
          fill={`rgba(152,164,188,${0.02 + density * 0.1})`}
          stroke="rgba(152,164,188,0.1)"
          strokeWidth={0.7}
        />
      ))}

      {/* The snail. One shape that says Paris before any label is read. */}
      {ARRONDISSEMENTS.map((d, i) => (
        <path key={`a${i}`} d={d} fill="rgba(162,174,198,0.1)" stroke="rgba(166,178,202,0.26)" strokeWidth={1} />
      ))}

      {SEINE.map((d, i) => (
        <React.Fragment key={`s${i}`}>
          <path d={d} stroke="#0D1D30" strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} stroke="#17314F" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </React.Fragment>
      ))}

      {/* Motorways, cased the way a basemap cases them — a dark wide stroke
          under a light narrow one, so crossings stay legible instead of
          merging into one blob. */}
      {MOTORWAYS.map((d, i) => (
        <path key={`m${i}`} d={d} stroke="#0C0D10" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {MOTORWAYS.map((d, i) => (
        <path key={`m2${i}`} d={d} stroke="#4A505C" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
};
