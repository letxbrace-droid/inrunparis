# I&N RUN OPS v0.3

Tableau de bord opérationnel VTC pour chauffeur professionnel basé en Île-de-France.  
**URL live** : https://letxbrace-droid.github.io/inrunparis/ops/

---

## Quick start

Ouvre l'URL ci-dessus dans Chrome Android ou Safari iOS.  
Au premier lancement, 119 courses historiques sont automatiquement chargées pour peupler les graphiques.

---

## Comment ajouter une course

1. Appuie sur le bouton **+** (rond doré, coin bas-droit)
2. Sélectionne la plateforme (Uber / Bolt / Heetch), saisis le **montant** (obligatoire)
3. Remplis optionnellement : pourboire, distance, durée, départ, destination, surge
4. Appuie sur **Enregistrer la course** — elle apparaît immédiatement dans le CA du jour

---

## Comment exporter en CSV

Onglet **Réglages** → **Exporter CSV** → fichier `inrun_AAAA-MM-JJ.csv` téléchargé.  
Le CSV contient toutes les courses avec colonnes : `id, datetime, platform, type, fare, tip, distance_km, duration_min, departure_city, destination_city, surge_active`.

---

## Comment effacer / réinitialiser

- **Supprimer une course** : Onglet Historique → icône poubelle sur la ligne
- **Recharger le seed démo** : Réglages → Recharger seed (119 courses)
- **Effacer tout** : Réglages → Effacer toutes les courses (irréversible)

---

## Installer sur écran d'accueil Android

1. Ouvre l'URL dans **Chrome** (Android)
2. Menu ⋮ → **Ajouter à l'écran d'accueil**
3. L'app s'installe en mode standalone (plein écran, sans barre d'URL)
4. Fonctionne **hors-ligne** grâce au Service Worker (assets mis en cache)

---

## Architecture

Single-file HTML PWA (~50 KB) sans build chain.  
React 18 + htm (JSX via template literals) servis depuis `esm.sh`.  
Recharts pour les graphiques, Lucide React pour les icônes, Tailwind CSS Play CDN.  
Persistance locale via **IndexedDB** (Dexie.js) — pas de localStorage, pas de limite 5 MB.  
Service Worker Cache-First pour les assets locaux, pass-through pour les CDN.

---

## Roadmap

| Version | Feature |
|---------|---------|
| v0.4 | Module ML adaptatif (remplace moteur déterministe) |
| v0.4 | Intégration bot COPILOTE-VTC Telegram |
| v0.5 | Sync cloud multi-device |
| v0.5 | OCR screenshots Uber/Bolt (saisie automatique) |
| v0.5 | GPS tracking km à vide |
| v1.0 | Notifications push · Comptabilité export |
