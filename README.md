# I&N RUN — Chauffeur Privé VTC Paris

PWA de réservation de chauffeur privé VTC à Paris et Île-de-France.
Tarif fixe calculé en temps réel, réservation envoyée via WhatsApp — aucun backend.

**Production :** https://letxbrace-droid.github.io/inrunparis/

---

## Stack

| Couche | Technologie |
|---|---|
| UI | React 18 + Vite 5 |
| State | Zustand (persisté localStorage) |
| Carte | Leaflet + OSRM (routing public, fallback haversine) |
| Animations | Framer Motion |
| Styles | Tailwind CSS + design system CSS variables (dark/light) |
| Tests | Vitest + Testing Library |

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173/inrunparis/
npm test           # tests unitaires
npm run build      # build production → dist/
```

## Structure

```
index.html               ← entrée Vite (SEO, Schema.org, manifest)
src/
├── App.jsx              ← orchestration vues + thème auto Paris
├── components/
│   ├── map/             ← LeafletMap (jour/nuit)
│   ├── tunnel/          ← BottomSheet 4 étapes (route → prix → options → récap)
│   ├── views/           ← Tarifs, Courses, Promo, FAQ, Légal, Appel
│   ├── layout/          ← TopBar, SideDrawer
│   ├── home/            ← HomePill, AwaitingCard
│   └── ui/              ← GlassCard, GlowingCTA, toasts…
├── hooks/               ← useOSRM, useGeolocation, useTrafficWeather
├── store/               ← useBookingStore (Zustand)
└── utils/               ← priceEngine, whatsappEncoder, geocoder, push
public/                  ← manifest, sw.js, icônes, hub.html (dashboard chauffeur)
ops/                     ← PWA admin séparée (copiée dans dist/ par la CI)
```

## Tarification

Base 13 € + 0,82 €/km + 0,16 €/min · minimum 32 € · nuit +15 % (22h–6h) ·
aéroport +6 € · van +25 % · codes promo (%, fixe) — voir `src/utils/priceEngine.js`.

## Déploiement

Push sur `main` → GitHub Actions build Vite + copie `ops/` → GitHub Pages.
Workflow : `.github/workflows/deploy-pages.yml`.
