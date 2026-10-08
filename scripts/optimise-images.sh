#!/usr/bin/env bash
# Recompresse les images déployées sans changer de format.
#
# Les cinq écrans de lancement iOS sont des PHOTOGRAPHIES (la Swace sur une rue
# mouillée, ~92 000 couleurs uniques) stockées en PNG 24 bits : 17,6 Mo à eux
# seuls, dont 3,9 Mo téléchargés par un iPhone 15 Pro Max avant même que l'app
# s'ouvre.
#
# On quantifie plutôt que de passer en JPEG : `apple-touch-startup-image` est
# historiquement servi en PNG, et pngquant atteint ici le même poids que du
# JPEG q82 — donc aucune raison de parier sur ce que Safari accepte.
#
#   bash scripts/optimise-images.sh
#
# Idempotent : relancer sur des fichiers déjà quantifiés ne les dégrade pas
# davantage (pngquant repart de la palette existante).
set -euo pipefail
command -v pngquant >/dev/null || { echo "pngquant manquant : apt-get install -y pngquant"; exit 1; }

before=$(du -sb public | cut -f1)
for f in public/brand/splash-*.png; do
  [ -e "$f" ] || continue
  pngquant --quality=40-60 --speed 1 --skip-if-larger --force --output "$f" "$f" 2>/dev/null \
    || echo "  (inchangé) $f"
done
for f in public/icon-512.png public/icon-maskable-512.png public/brand/swace-hybrid.png public/brand/swace-side.png; do
  [ -e "$f" ] || continue
  pngquant --quality=65-85 --speed 1 --skip-if-larger --force --output "$f" "$f" 2>/dev/null \
    || echo "  (inchangé) $f"
done
after=$(du -sb public | cut -f1)
printf "public/ : %.1f Mo → %.1f Mo (%.0f %% de moins)\n" \
  "$(echo "$before/1000000" | bc -l)" "$(echo "$after/1000000" | bc -l)" \
  "$(echo "100*(1-$after/$before)" | bc -l)"
