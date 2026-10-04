#!/usr/bin/env python3
"""
Construit la carte de la scène « app » à partir de vraie géométrie OpenStreetMap.

La carte du téléphone était un réseau de rues inventé : joli, mais ce n'était
pas Paris. Celle-ci l'est. Quatre jeux de données publics, projetés en Web
Mercator dans le repère de l'écran du téléphone, simplifiés, et écrits en dur
dans src/ugc/map-data.ts :

  · autoroutes      Natural Earth 10m roads  (l'A1 vers Roissy en est une)
  · arrondissements blackmad/neighborhoods
  · communes        gregoiredavid/france-geojson
  · la Seine        Natural Earth 10m rivers

Le tracé du trajet n'est pas davantage inventé : il suit la polyligne réelle de
l'autoroute qui passe au plus près des deux points, coupée entre eux.

    python3 scripts/build-map.py
"""
import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".mapcache"
OUT = ROOT / "src" / "ugc" / "map-data.ts"

SOURCES = {
    "roads.geojson": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_roads.geojson",
    "rivers.geojson": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson",
    "quartiers.geojson": "https://raw.githubusercontent.com/blackmad/neighborhoods/master/paris.geojson",
    "communes.geojson": "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes.geojson",
}

# L'écran du téléphone, en pixels de la composition.
W, H = 620, 1343
PARIS = (2.3522, 48.8566)
CDG = (2.5479, 49.0097)
PAD = 1.42  # marge autour du trajet, en multiples de son étendue


def fetch() -> dict:
    CACHE.mkdir(exist_ok=True)
    data = {}
    for name, url in SOURCES.items():
        p = CACHE / name
        if not p.exists():
            print(f"  téléchargement {name}…")
            urllib.request.urlretrieve(url, p)
        data[name] = json.loads(p.read_text())
    return data


# ── Projection ───────────────────────────────────────────────────────────────
def merc(lon: float, lat: float) -> tuple[float, float]:
    """Web Mercator. Conforme : une même échelle en x et en y, ce qui est la
    raison pour laquelle on peut cadrer sur x et déduire y."""
    return lon, math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


VIEWPORT = ROOT / "public" / "map" / "viewport.json"


def make_projector():
    (px, py), (cx, cy) = merc(*PARIS), merc(*CDG)
    mx, my = (px + cx) / 2, (py + cy) / 2
    span_x = max(abs(cx - px) * PAD, abs(cy - py) * PAD * W / H)
    span_y = span_x * H / W
    x0, y1 = mx - span_x / 2, my + span_y / 2

    # The raster tile fetcher has to land on exactly this viewport or the tiles
    # and the markers drawn over them disagree about where Roissy is. Write it
    # out rather than letting the two scripts each recompute it from constants
    # that can drift apart.
    VIEWPORT.parent.mkdir(parents=True, exist_ok=True)
    VIEWPORT.write_text(json.dumps(
        {"w": W, "h": H, "mercX0": x0, "mercSpanX": span_x,
         "mercY1": y1, "mercSpanY": span_y}, indent=2) + "\n")

    def project(lon: float, lat: float) -> tuple[float, float]:
        X, Y = merc(lon, lat)
        return ((X - x0) / span_x * W, (y1 - Y) / span_y * H)

    return project


def simplify(pts, eps):
    """Douglas-Peucker. Les sources sont bien plus détaillées que 620 px de
    large ne peut en montrer ; sans ça le fichier pèse des centaines de Ko de
    points qui retombent tous sur le même pixel."""
    if len(pts) < 3:
        return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    norm = math.hypot(dx, dy) or 1e-9
    worst, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + x1 * y0 - y1 * x0) / norm
        if d > worst:
            worst, idx = d, i
    if worst <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[: idx + 1], eps)[:-1] + simplify(pts[idx:], eps)


def rings(geom):
    """Aplatit n'importe quelle géométrie GeoJSON en une liste d'anneaux."""
    t, c = geom["type"], geom["coordinates"]
    if t == "LineString":
        return [c]
    if t in ("MultiLineString", "Polygon"):
        return list(c)
    if t == "MultiPolygon":
        return [r for poly in c for r in poly]
    return []


def ring_area(pts):
    """Shoelace, in screen px². Used only to rank communes by size."""
    a = 0.0
    for i in range(len(pts)):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % len(pts)]
        a += x0 * y1 - x1 * y0
    return abs(a) / 2


def to_path(ring, project, eps, close=False):
    pts = simplify([project(lon, lat) for lon, lat in ring], eps)
    if len(pts) < 2:
        return None
    d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    return d + " Z" if close else d


def visible(ring, project, margin=260):
    return any(-margin <= x <= W + margin and -margin <= y <= H + margin
               for x, y in (project(lon, lat) for lon, lat in ring))


def build_route(roads, project):
    """Le trajet suit une vraie autoroute, pas une courbe dessinée à la main.

    On prend la polyligne qui minimise la somme des distances à Paris et à
    Roissy, puis on la coupe entre son point le plus proche de chacun.

    Toutes les comparaisons se font en coordonnées *projetées*, jamais en
    degrés. À 49° de latitude un degré de longitude vaut 1,52 fois moins qu'un
    degré de latitude : mesurée en degrés, la distance classait les points dans
    un ordre différent de celui qu'on voit à l'écran, et le tracé repartait en
    arrière après Roissy en formant un crochet.
    """
    def d2(p, q):
        return (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2

    paris_xy, cdg_xy = project(*PARIS), project(*CDG)
    best, best_cost = None, float("inf")
    for f in roads["features"]:
        for ring in rings(f["geometry"]):
            if len(ring) < 2:
                continue
            xy = [project(lon, lat) for lon, lat in ring]
            cost = min(d2(p, paris_xy) for p in xy) + min(d2(p, cdg_xy) for p in xy)
            if cost < best_cost:
                best, best_cost = xy, cost

    i = min(range(len(best)), key=lambda k: d2(best[k], paris_xy))
    j = min(range(len(best)), key=lambda k: d2(best[k], cdg_xy))
    seg = best[i : j + 1] if i <= j else best[j : i + 1][::-1]
    # Stop the moment the motorway starts heading away from the airport again.
    for k in range(1, len(seg)):
        if d2(seg[k], cdg_xy) > d2(seg[k - 1], cdg_xy):
            seg = seg[:k]
            break
    pts = simplify([paris_xy] + seg + [cdg_xy], 0.7)
    return "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts), len(pts)


def main():
    print("Sources…")
    src = fetch()
    project = make_projector()

    roads = [p for f in src["roads.geojson"]["features"]
             for ring in rings(f["geometry"]) if visible(ring, project)
             for p in [to_path(ring, project, 0.8)] if p]

    arrs = [p for f in src["quartiers.geojson"]["features"]
            for ring in rings(f["geometry"]) if visible(ring, project)
            for p in [to_path(ring, project, 0.7, close=True)] if p]

    communes = []
    for f in src["communes.geojson"]["features"]:
        for ring in rings(f["geometry"]):
            if not visible(ring, project, 40):
                continue
            pts = [project(lon, lat) for lon, lat in ring]
            d = to_path(ring, project, 1.0, close=True)
            if not d:
                continue
            # Small commune = dense urban fabric. Normalised against 9000 px²,
            # roughly a tight inner-suburb footprint at this zoom.
            density = max(0.0, min(1.0, 9000.0 / max(ring_area(pts), 400.0)))
            communes.append((d, round(density, 3)))

    seine = [p for f in src["rivers.geojson"]["features"]
             if (f["properties"].get("name") or "") == "Seine"
             for ring in rings(f["geometry"]) if visible(ring, project)
             for p in [to_path(ring, project, 0.6)] if p]

    route, route_pts = build_route(src["roads.geojson"], project)
    px, py = project(*PARIS)
    cx, cy = project(*CDG)

    def arr(name, items):
        body = ",\n  ".join(json.dumps(i) for i in items)
        return f"export const {name}: readonly string[] = [\n  {body},\n];\n"

    def pairs(name, items):
        body = ",\n  ".join(f"[{json.dumps(d)}, {v}]" for d, v in items)
        return (f"/** [chemin SVG, densité 0–1] — la densité vient de la taille réelle\n"
                f" *  de la commune : petite et serrée en proche couronne, vaste en\n"
                f" *  grande couronne. C'est ce dégradé qui fait lire la ville. */\n"
                f"export const COMMUNES: readonly (readonly [string, number])[] = [\n  {body},\n];\n")

    OUT.write_text(f'''// GÉNÉRÉ par scripts/build-map.py — ne pas éditer à la main.
//
// Vraie géométrie OpenStreetMap, projetée en Web Mercator dans le repère de
// l'écran du téléphone ({W}×{H}) et simplifiée par Douglas-Peucker. La carte de
// la scène « app » était auparavant un réseau de rues inventé ; celle-ci est
// Paris, avec l'autoroute que la course emprunte réellement.
//
// Sources : Natural Earth (routes, rivières) · blackmad/neighborhoods
// (arrondissements) · gregoiredavid/france-geojson (communes).
// Données © les contributeurs OpenStreetMap, ODbL.

export const MAP_W = {W};
export const MAP_H = {H};

/** Paris 11e et Roissy CDG, aux coordonnées réelles de l'app. */
export const PARIS_XY = [{px:.1f}, {py:.1f}] as const;
export const CDG_XY = [{cx:.1f}, {cy:.1f}] as const;

/** Le trajet, tracé sur la polyligne réelle de l'autoroute entre les deux. */
export const ROUTE = {json.dumps(route)};

{arr("MOTORWAYS", roads)}
{arr("ARRONDISSEMENTS", arrs)}
{pairs("COMMUNES", communes)}
{arr("SEINE", seine)}''')

    size = OUT.stat().st_size
    print(f"  autoroutes      {len(roads):4d}")
    print(f"  arrondissements {len(arrs):4d}")
    print(f"  communes        {len(communes):4d}")
    print(f"  Seine           {len(seine):4d}")
    print(f"  trajet          {route_pts:4d} points")
    print(f"→ {OUT.relative_to(ROOT)}  ({size//1024} Ko)")


if __name__ == "__main__":
    main()
