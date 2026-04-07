# I&N RUN — Documentation Technique

> Site vitrine pour chauffeur privé VTC · GitHub Pages · Statique

---

## Structure du dépôt

```
inrunparis/
├── index.html             ← Site principal (toutes fonctionnalités)
├── mentions-legales.html  ← Mentions légales, RGPD, CGV
├── voiture.jpg            ← Photo véhicule (à placer à la RACINE)
└── README.md              ← Ce fichier
```

---

## Stack technique

| Composant | Technologie | CDN |
|---|---|---|
| Calendrier | Flatpickr | jsdelivr |
| Carte | Leaflet 1.9.4 | unpkg |
| Tuiles sombres | CartoDB Dark Matter | — |
| Géocodage | Nominatim / OSM | gratuit |
| Routage | OSRM public | gratuit |
| Météo | Open-Meteo | gratuit, sans clé |
| Trafic | TomTom Traffic API v5 | clé gratuite |
| Trafic fallback | Bison Futé RSS + allorigins CORS | gratuit, sans clé |
| Polices | Google Fonts (Playfair + Inter) | — |

---

## Modules JavaScript

### 1. Météo (`initWeather`)
- Géolocalisation avec timeout **3 secondes**
- Fallback automatique sur Paris si refus ou timeout
- Cache `sessionStorage` valide **15 min**
- Retry automatique sur erreur API
- `AbortController` sur chaque fetch (timeout 5s)

### 2. Fil Trafic (`IIFE anonyme`)
- Source primaire : **TomTom Traffic Incidents API v5**
  - Bounding box Île-de-France : `1.8, 48.45 → 3.1, 49.15`
  - Filtre : incidents présents, langue `fr-FR`
- Source fallback : **Bison Futé RSS** via proxy `allorigins.win`
- Cache `sessionStorage` **3 min**
- Auto-refresh **5 min** avec countdown
- 6 zones filtrables : CDG · Orly · Périphérique · A86 · Paris · Tout
- Tap incident → ouvre **Waze** (mobile) ou waze.com (desktop)

### 3. Ticker supérieur (`initTicker`)
- Bande défilante en haut de page (CSS `@keyframes`)
- Se synchronise avec les modules météo et trafic (zéro requête)
- Mise à jour horloge toutes les **30 s**
- Fermable via bouton ✕ (mémorisé en `sessionStorage`)
- Pause automatique au survol

### 4. Tunnel de réservation
- Étape 1 : Calendrier Flatpickr inline (J+0 à J+90)
- Étape 2 : Autocomplete adresses Nominatim avec debounce 350ms
- Étape 3 : Préférences confort (musique, température, extras)
- Calcul tarif : `max(6 + km × 1.95, 12)` + majoration nuit +10€
- Carte Leaflet avec tracé OSRM
- Bouton WhatsApp pré-rempli avec tous les paramètres
- vCard téléchargeable (`.vcf`)

---

## APIs utilisées

| API | Endpoint | Auth | Limite gratuite |
|---|---|---|---|
| Open-Meteo | `api.open-meteo.com/v1/forecast` | Aucune | Illimitée |
| Nominatim | `nominatim.openstreetmap.org/search` | Aucune | 1 req/s |
| OSRM | `router.project-osrm.org/route/v1` | Aucune | Raisonnable |
| TomTom Traffic | `api.tomtom.com/traffic/services/5` | API Key | 2 500 req/jour |
| Bison Futé RSS | via `api.allorigins.win` | Aucune | Illimitée |
| CartoDB Tiles | basemaps.cartocdn.com | Aucune | Illimitée |

---

## Clé TomTom (optionnelle)

1. Créer un compte gratuit sur [developer.tomtom.com](https://developer.tomtom.com)
2. Générer une clé API (sans CB, 2 500 req/jour)
3. Entrer la clé dans le champ prévu sur le site
4. Stockée en `localStorage` sous la clé `inrun_tt_key`
5. Sans clé → fallback Bison Futé RSS automatique

---

## Performance

- **Aucune dépendance NPM** — tout via CDN
- **Aucun cookie tiers** — uniquement `sessionStorage` / `localStorage`
- **Lazy loading** des modules : météo → trafic → ticker (décalés)
- `AbortController` sur toutes les requêtes réseau
- CSS `will-change: transform` sur le ticker pour GPU

---

## Déploiement GitHub Pages

```bash
# Paramètres → Pages → Source : branch main / root
# URL : https://[username].github.io/[repo]/
```

Fichier obligatoire à la racine : **`voiture.jpg`** (photo du véhicule)

---

## Navigateurs supportés

Chrome 90+ · Safari 14+ · Firefox 88+ · Edge 90+  
Compatible PWA (meta `apple-mobile-web-app-capable`)
