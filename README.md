# I&N RUN — Chauffeur Privé Paris v19

## Structure du dépôt

```
inrunparis/
├── index.html             ← Site principal
├── mentions-legales.html  ← Mentions légales + RGPD + CGV
├── voiture.jpg            ← Photo véhicule (à ajouter à la RACINE)
└── README.md
```

## ⚠️ À compléter AVANT mise en ligne

1. Remplacer `[À COMPLÉTER AVANT MISE EN LIGNE]` par votre SIRET dans :
   - `index.html` (pied de page)
   - `mentions-legales.html` (section 1)
2. Uploader `voiture.jpg` à la **racine** du dépôt (PAS dans un sous-dossier)

## Météo v3 — 100% fiable

- Géoloc avec timeout 3s → fallback automatique Paris
- Retry automatique si erreur API
- Cache sessionStorage 15 min
- Widget TOUJOURS affiché (jamais invisible)

## Correctifs v19

- Photo : `src="voiture.jpg"` racine (pas `img/` ni `image/`)
- Météo : IIFE isolée, fallback garanti, retry, cache
- Toutes les API : AbortController + timeout
- Mentions légales complètes : LCEN + RGPD + CGV
