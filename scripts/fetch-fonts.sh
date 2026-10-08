#!/usr/bin/env bash
# Récupère les polices de l'app depuis Google Fonts pour les auto-héberger.
#
# Deux raisons, dans cet ordre :
#   1. Le <link> vers fonts.googleapis.com bloque le premier rendu et ajoute un
#      aller-retour DNS + TLS vers un tiers avant que la moindre pixel s'affiche.
#   2. Le hotlink transmet l'IP de chaque visiteur à Google. La CNIL et les
#      tribunaux allemands l'ont qualifié de transfert non consenti ; pour une
#      entreprise française c'est un risque gratuit.
#
# On prend latin ET latin-ext : « Paris 11ᵉ » utilise U+1D49, qui vit dans
# latin-ext. Avec le seul sous-ensemble latin, cet exposant retombe sur une
# police système au milieu d'un mot.
#
#   bash scripts/fetch-fonts.sh
set -euo pipefail
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
URL='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Outfit:wght@400..800&family=JetBrains+Mono:wght@400;500&display=swap'

curl -sS -A "$UA" "$URL" -o /tmp/inrun-fonts.css
python3 - <<'PY'
import re, subprocess, pathlib
css = open('/tmp/inrun-fonts.css').read()
out = pathlib.Path('public/fonts'); out.mkdir(parents=True, exist_ok=True)
SUBSETS = {'latin': 'U+0000-00FF', 'latin-ext': 'U+1D00-1DBF'}
faces = []
for b in re.findall(r'@font-face\s*\{(.*?)\}', css, re.S):
    fam = re.search(r"font-family:\s*'([^']+)'", b).group(1)
    wt  = re.search(r"font-weight:\s*([^;]+);", b).group(1).strip()
    url = re.search(r"url\(([^)]+)\)", b).group(1)
    ur  = re.search(r"unicode-range:\s*([^;]+);", b).group(1).strip()
    sub = next((k for k, probe in SUBSETS.items() if probe in ur), None)
    if not sub:
        continue
    name = f"{fam.lower().replace(' ', '-')}-{sub}-{wt.replace(' ', '-')}.woff2"
    subprocess.run(['curl', '-sSL', '-o', str(out / name), url], check=True)
    faces.append((fam, wt, name, ur, (out / name).stat().st_size))
for fam, wt, name, ur, size in faces:
    print(f"  {fam:20} {wt:9} {name:46} {size/1024:5.1f} Ko")
open('/tmp/inrun-faces.txt', 'w').write('\n'.join(
    f"{fam}\t{wt}\t{name}\t{ur}" for fam, wt, name, ur, _ in faces))
PY
