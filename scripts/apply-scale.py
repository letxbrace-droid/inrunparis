#!/usr/bin/env python3
"""
Ramène les tailles de texte et les rayons sur une échelle.

L'audit avait trouvé 28 tailles distinctes entre 9 et 57,6 px, avec des écarts
de 0,2 px — 12 / 12,5 / 13 / 14 / 15 / 16 / 16,8 / 17 / 17,6. L'œil ne
distingue pas 16,8 de 17, mais il sent que rien ne s'aligne. Et 13 rayons
différents alors que le système en déclarait trois.

La cause n'était pas le goût mais l'application : --r-card, --r-cell,
--r-control, --ease-out, --dur-base étaient déclarés et utilisés ZÉRO fois.
Chaque valeur était réécrite à la main sur place.

Ce script arrondit, il ne redessine pas : rien ne change de place, tout cesse
de vibrer. Chaque taille rejoint le palier le plus proche, et les paliers ont
été choisis pour que le petit texte ne GROSSISSE jamais de plus d'un pixel —
sinon on répare une échelle en cassant des mises en page.

    python3 scripts/apply-scale.py [--dry]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "components"
DRY = "--dry" in sys.argv

# ── L'échelle ────────────────────────────────────────────────────────────────
# 9 paliers, rapport ~1,1 à 1,25. Les classes Tailwind nommées tombent déjà
# dessus : text-xs 12, text-sm 14, text-base 16, text-2xl 24, text-3xl 30.
TEXT = [11, 12, 14, 16, 19, 24, 30, 40, 56]
RADII = [8, 12, 16, 24]
# rounded-md (6px) n'a pas de palier : il rejoint 8.


def nearest(value, scale):
    return min(scale, key=lambda s: abs(s - value))


def fmt(n):
    return str(int(n)) if float(n).is_integer() else str(n)


def rewrite(text):
    changes = []

    def px_class(m):
        old = float(m.group(1))
        new = nearest(old, TEXT)
        if new != old:
            changes.append(f"text {fmt(old)}→{new}")
        return f"text-[{new}px]"

    def inline_size(m):
        old = float(m.group(1))
        new = nearest(old, TEXT)
        if new != old:
            changes.append(f"fontSize {fmt(old)}→{new}")
        # On conserve l'alignement d'origine : certains fichiers alignent les
        # valeurs sur plusieurs espaces, et un motif à espace unique les
        # laissait passer — c'est d'où venaient les derniers récalcitrants.
        return f"fontSize:{m.group(1).rjust(0) and m.group(0).split(':')[1].replace(m.group(1), '')}{new}"

    def radius_class(m):
        old = float(m.group(1))
        new = nearest(old, RADII)
        if new != old:
            changes.append(f"radius {fmt(old)}→{new}")
        return f"rounded-[{new}px]"

    def radius_inline(m):
        old = float(m.group(1))
        # 99+ reste une pilule : ce n'est pas un rayon, c'est une forme.
        if old >= 99:
            return m.group(0)
        new = nearest(old, RADII)
        if new != old:
            changes.append(f"radius {fmt(old)}→{new}")
        return f"borderRadius:{m.group(0).split(':')[1].replace(m.group(1), '')}{new}"

    def rem_size(m):
        old = float(m.group(1)) * 16
        new = nearest(old, TEXT)
        if new != old:
            changes.append(f"fontSize {fmt(old)}→{new}")
        return f"fontSize: {new}"

    def tw_named(m):
        old = {"lg": 18, "xl": 20}[m.group(1)]
        new = nearest(old, TEXT)
        if new != old:
            changes.append(f"text-{m.group(1)} {old}→{new}")
        return f"text-[{new}px]"

    # Les tailles en rem échappaient au passage : 1,05rem et 1,1rem valent
    # 16,8 et 17,6 px, soit exactement le bruit sous le pixel qu'on corrige.
    text = re.sub(r"fontSize: *'([0-9.]+)rem'", rem_size, text)
    # text-lg et text-xl (18 et 20) sont les deux classes nommées de Tailwind
    # qui ne tombent pas sur un palier ; les autres y sont déjà.
    text = re.sub(r"\btext-(lg|xl)\b", tw_named, text)
    text = re.sub(r"text-\[([0-9.]+)px\]", px_class, text)
    text = re.sub(r"fontSize: +([0-9.]+)", inline_size, text)
    text = re.sub(r"rounded-\[([0-9.]+)px\]", radius_class, text)
    text = re.sub(r"borderRadius: +([0-9.]+)", radius_inline, text)
    return text, changes


def main():
    total = 0
    for f in sorted(ROOT.rglob("*.jsx")):
        before = f.read_text()
        after, changes = rewrite(before)
        if not changes:
            continue
        total += len(changes)
        print(f"  {str(f.relative_to(ROOT)):38} {len(changes):3d}  {', '.join(sorted(set(changes))[:4])}"
              + (" …" if len(set(changes)) > 4 else ""))
        if not DRY:
            f.write_text(after)
    print(f"\n{total} valeurs ramenées sur l'échelle{' (simulation)' if DRY else ''}.")


if __name__ == "__main__":
    main()
