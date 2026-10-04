#!/usr/bin/env python3
"""
Génère la bande-son du montage UGC — entièrement synthétisée.

Pourquoi synthétiser plutôt que télécharger : une pub diffusée est une
publication. Un whoosh pris sur une banque gratuite arrive avec une licence
qu'il faut lire, créditer et pouvoir prouver trois ans plus tard. Ces fichiers
n'appartiennent à personne d'autre, et le jour où le montage change de rythme,
on régénère au lieu de rechercher.

    python3 scripts/make-sfx.py        → public/sfx/*.wav
"""
import math
import struct
import wave
from pathlib import Path

import numpy as np

SR = 48_000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"


def write(name: str, data: np.ndarray) -> None:
    """Écrit un WAV 16 bits. `data` est mono (N,) ou stéréo (N, 2), dans [-1, 1]."""
    data = np.clip(data, -1.0, 1.0)
    channels = 1 if data.ndim == 1 else data.shape[1]
    pcm = (data * 32767).astype("<i2").tobytes()
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    print(f"  {name:16} {len(data)/SR:5.2f}s  {len(pcm)//1024:5d} Ko")


def t(seconds: float) -> np.ndarray:
    return np.arange(int(SR * seconds)) / SR


def lowpass(x: np.ndarray, cutoff: np.ndarray) -> np.ndarray:
    """Passe-bas un pôle à fréquence de coupure variable (un tableau, pas un scalaire).

    C'est la coupure *mobile* qui fait tout le travail : un whoosh n'est que du
    bruit dont la bande passante se déplace. À coupure fixe on obtient du
    souffle, pas un mouvement.
    """
    a = np.exp(-2.0 * np.pi * np.clip(cutoff, 20, SR / 2.2) / SR)
    y = np.empty_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def highpass(x: np.ndarray, cutoff: np.ndarray) -> np.ndarray:
    return x - lowpass(x, cutoff)


def noise(n: int, seed: int) -> np.ndarray:
    return np.random.default_rng(seed).standard_normal(n)


def fade(x: np.ndarray, ms_in: float = 3, ms_out: float = 12) -> np.ndarray:
    """Tout son doit commencer et finir à zéro, sinon le haut-parleur claque."""
    n_in, n_out = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    x = x.copy()
    # Shape the ramps so they broadcast over a stereo (N, 2) buffer as well as
    # a mono (N,) one.
    shape = (-1, 1) if x.ndim == 2 else (-1,)
    x[:n_in] *= np.linspace(0, 1, n_in).reshape(shape)
    x[-n_out:] *= np.linspace(1, 0, n_out).reshape(shape)
    return x


# ── Transitions ──────────────────────────────────────────────────────────────
def whoosh(dur=0.46, seed=1, reverse=False):
    tt = t(dur)
    p = tt / dur
    # La coupure monte de 300 Hz à 7 kHz puis redescend : le son passe *devant*
    # l'auditeur au lieu de simplement s'ouvrir.
    sweep = 300 + 6700 * np.sin(np.pi * p) ** 1.4
    body = lowpass(noise(len(tt), seed), sweep)
    body = highpass(body, 180 + 900 * p)
    env = np.sin(np.pi * p) ** 1.6
    out = body * env * 0.9
    return fade(out[::-1] if reverse else out)


def impact(dur=0.72, seed=2):
    tt = t(dur)
    p = tt / dur
    # Sub : 130 Hz qui tombe à 36 Hz. La chute est ce qu'on ressent dans la
    # poitrine ; la fréquence finale est ce qu'on entend à peine.
    freq = 36 + 94 * np.exp(-tt * 16)
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 5.2)
    # Transitoire : 6 ms de bruit, c'est ce qui donne le "coup" plutôt que le "boum"
    click = lowpass(noise(len(tt), seed), 2600 * np.exp(-tt * 40) + 200) * np.exp(-tt * 45)
    out = np.tanh((sub * 1.15 + click * 0.55) * 1.3) * 0.88
    return fade(out, 1, 40)


def riser(dur=1.15, seed=3):
    tt = t(dur)
    p = tt / dur
    air = highpass(noise(len(tt), seed), 400 + 5200 * p**2) * (p**2.2)
    tone = np.sin(2 * np.pi * np.cumsum(220 + 900 * p**3) / SR) * (p**3) * 0.35
    return fade(np.tanh((air * 0.8 + tone) * 1.1) * 0.62, 20, 25)


def tick(dur=0.055, seed=4):
    tt = t(dur)
    body = noise(len(tt), seed) * np.exp(-tt * 190)
    ping = np.sin(2 * np.pi * 2100 * tt) * np.exp(-tt * 150) * 0.5
    return fade(lowpass(body, np.full(len(tt), 5200)) * 0.45 + ping * 0.3, 0.4, 8)


def stamp(dur=0.5, seed=5):
    """Le son du prix qui se verrouille : un coup sec, pas une explosion."""
    tt = t(dur)
    metal = sum(
        np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * a
        for f, d, a in ((1180, 26, 0.34), (1790, 34, 0.22), (2630, 44, 0.12))
    )
    thud = np.sin(2 * np.pi * (58 + 70 * np.exp(-tt * 22)) * tt) * np.exp(-tt * 13) * 0.75
    snap = noise(len(tt), seed) * np.exp(-tt * 120) * 0.3
    return fade(np.tanh((metal + thud + snap) * 1.15) * 0.8, 0.5, 30)


# ── Lit rythmique ────────────────────────────────────────────────────────────
def bed(dur=22.5, bpm=102):
    """Nappe sombre + pulsation.

    Pas de boucle de batterie : les coupes du montage ne tombent pas sur une
    grille musicale, et forcer la musique à s'aligner dessus produit toujours un
    décalage audible. Une nappe et une pulsation n'ont pas besoin de mesures, et
    laissent les impacts posés exactement sur les coupes porter le rythme.
    """
    n = int(SR * dur)
    tt = np.arange(n) / SR
    p = tt / dur

    # Intensité : monte, retombe pendant la scène WhatsApp (il s'y dit quelque
    # chose), repart pour la voiture et la carte de fin.
    # The opening used to start at 0.25 and the first two seconds measured
    # −37 dBFS — effectively silence. A hook that opens on silence gets
    # scrolled past before the first word lands, so the bed now arrives
    # already playing and the curve never drops below half.
    shape = np.interp(tt, [0, 0.4, 2.4, 6.0, 13.2, 14.5, 17.0, 20.0, 22.0, dur],
                          [0.62, 0.78, 0.84, 0.90, 0.95, 0.60, 0.80, 1.0, 0.92, 0.0])

    # Sub battant : deux sinus désaccordés de 0,35 Hz, ce qui crée une pulsation
    # lente que l'oreille lit comme de la tension et non comme une note tenue.
    sub = (np.sin(2 * np.pi * 55 * tt) + np.sin(2 * np.pi * 55.35 * tt)) * 0.18

    # Nappe : quinte filtrée, très basse, juste de quoi que le silence ne soit
    # jamais vraiment du silence.
    saw = sum(np.sin(2 * np.pi * f * tt + ph) / k
              for k, (f, ph) in enumerate(((110, 0.0), (165, 1.1), (220, 2.3)), start=1))
    pad = lowpass(saw * 0.1, 320 + 620 * np.sin(2 * np.pi * 0.07 * tt) ** 2)

    beat = 60.0 / bpm
    pulse = np.zeros(n)
    hats = np.zeros(n)
    for i in range(int(dur / beat) + 1):
        s = int(i * beat * SR)
        k = t(0.17)
        kick = np.sin(2 * np.pi * (44 + 56 * np.exp(-k * 30)) * k) * np.exp(-k * 19)
        end = min(s + len(k), n)
        pulse[s:end] += kick[: end - s] * 0.5
        # contretemps, un peu en retard : à la croche exacte c'est une machine
        s2 = int((i + 0.52) * beat * SR)
        hk = t(0.035)
        hat = highpass(noise(len(hk), 100 + i), np.full(len(hk), 6500)) * np.exp(-hk * 95)
        end2 = min(s2 + len(hk), n)
        if s2 < n:
            hats[s2:end2] += hat[: end2 - s2] * 0.18

    mono = (sub + pad + pulse + hats) * shape
    # Soft-clip, then leave headroom for the impacts Remotion lays on top.
    mono = np.tanh(mono * 1.45) * 0.62
    # Léger élargissement stéréo : la nappe s'ouvre, le sub reste au centre.
    wide = lowpass(mono, np.full(n, 900))
    left = mono * 0.86 + np.roll(wide, 180) * 0.14
    right = mono * 0.86 + np.roll(wide, -180) * 0.14
    return fade(np.stack([left, right], axis=1), 60, 500)


if __name__ == "__main__":
    print("Génération des sons…")
    write("whoosh.wav", whoosh())
    write("whoosh-rev.wav", whoosh(0.5, seed=11, reverse=True))
    write("impact.wav", impact())
    write("riser.wav", riser())
    write("tick.wav", tick())
    write("stamp.wav", stamp())
    write("bed.wav", bed())
    print("Terminé. Pensez à compresser le lit musical — 4 Mo de WAV dans un dépôt,")
    print("c'est 4 Mo que tout le monde reclone à chaque fois :")
    print("  npx remotion ffmpeg -y -i public/sfx/bed.wav -c:a libmp3lame -b:a 192k \\")
    print("      public/sfx/bed.mp3 && rm public/sfx/bed.wav")
