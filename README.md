# I&N RUN — Chauffeur Privé Paris

## 🚀 Structure du dépôt

```
inrunparis/
├── index.html           ← Site principal
├── mentions-legales.html ← Page mentions légales + RGPD + CGV
├── voiture.jpg          ← Photo du véhicule (à ajouter à la racine)
└── README.md
```

## 📋 À compléter avant mise en ligne

- [ ] `index.html` → remplacer `[à compléter]` par votre vrai SIRET
- [ ] `mentions-legales.html` → idem SIRET
- [ ] Uploader `voiture.jpg` à la **racine** du dépôt (pas dans un sous-dossier)

## 🌦 Météo — Fonctionnement fiable

- Géolocalisation avec timeout 3 secondes
- Fallback automatique sur Paris si refus ou timeout
- Cache sessionStorage 15 minutes (évite les appels répétés)
- Retry automatique en cas d'erreur API

## 📞 Contact

WhatsApp : +33 7 67 74 22 20
Email : contact.inrun@gmail.com

## v18 — Changelog

- ✅ Photo à la racine (`voiture.jpg` sans sous-dossier)
- ✅ Météo fiabilisée (fallback + retry + cache)
- ✅ Mentions légales complètes (LCEN + RGPD + CGV)
- ✅ Code health review complet
- ✅ Gestion erreurs API renforcée (AbortController partout)
