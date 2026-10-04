# /brag — I&N RUN

Run date: 2026-10-04 · Output: `brag-output/`

## Invocation

Invoked as `/brag` with no flags, from an uploaded `SKILL.md` only — the
skill's `references/`, `assets/` and the Hyperframes domain skills were not
part of the upload. This run follows SKILL.md's stated workflow, gates and
creative laws, and substitutes `npx hyperframes docs` for the missing domain
skills.

| Option | Resolved | Why |
|---|---|---|
| `--tone` | `polished` | A working VTC business, not a joke project. The skill's own rule: polished is "for projects that are not jokes". |
| `--format` | **vertical** (1080×1920) | The documented default is landscape. Overridden deliberately: this product's audience is on a phone, every reference the owner has supplied is 9:16, and the artefact is for WhatsApp/Instagram/TikTok rather than a dev timeline. |
| `--duration` | 20s | Inside the 15–25s law. |
| `--title` | I&N RUN | From `manifest.json`. |
| music / sfx | on | Reused from `video/public/sfx/`, synthesised for this project in `video/scripts/make-sfx.py`. No licence attaches to them. |
| `--voice` | off | Not requested. |

## Step 1 — Inspection

**What it is.** I&N RUN is an installable PWA for a one-driver private-hire
(VTC) service in Paris and Île-de-France. React + Vite + Zustand, Leaflet on
OpenStreetMap tiles, Photon for address autocomplete, OSRM for routing, a
local fixed-price engine, and WhatsApp as the booking channel. Deployed to
GitHub Pages.

**Who it is for.** Passengers booking a car in Paris — airports, stations,
long distance, and hourly hire.

**What is distinctive.** Everything about it is the opposite of a platform.
One driver, known by name. A price computed and shown *before* the trip, which
then does not move. No account, no commission, no surge. Booking is a WhatsApp
message a human answers.

**Real UI and real copy** (not invented for the video):
- Home: a live map, a burger, and one search pill — "Où allons-nous ?" /
  "CDG · Orly · Beauvais"
- Tarifs: "Aéroports & gares — dès 45 €", "Mise à disposition 2h — 80 €,
  4h — 150 €", "Longue distance — sur devis"
- Claims: "Tarif fixe garanti", "Confirmation en 2 min", 24h/7j
- Contact: WhatsApp, 07 67 74 22 20

**Visual identity.** True black `#050505`, a single accent `#FF5A1F`,
hairline borders, no diffuse glow. Bricolage Grotesque / Outfit /
JetBrains Mono. Taken from `src/styles/globals.css` so the film and the
product cannot drift apart.

**The hook.** The surprise is not the app — anyone can have an app. It is
that a single driver has one at all, and that it is better behaved than the
platforms': a fixed price, an installable shell, and a human on the other end.

**The punchline.** The install. It is a PWA, so the end of the film is also
the end of the funnel.

## Step 2 — Storyboard

Pattern: Hook 2.5s → Reveal 3.5s → three highlights 11s → outro 3s = 20s.

| # | t | Dur | Scene | On screen | Motion | Audio |
|---|---|---|---|---|---|---|
| 1 | 0.0 | 2.5 | **Hook** | "Un chauffeur parisien." / "Sa propre app." | Words land word-by-word, smeared, on near-black. Shaft ember low. | riser → impact on the cut |
| 2 | 2.5 | 3.5 | **Reveal** | Real app home screen in a phone, I&N RUN wordmark | Phone rises into frame, settles out of a 3/4 turn, floor reflection | impact, bed opens |
| 3 | 6.0 | 4.0 | **Le prix** | Real Tarifs screen · "dès 45 €" pulled out as a card | Screen slides in, the price card detaches and locks | stamp on the lock |
| 4 | 10.0 | 3.5 | **La réponse** | WhatsApp thread, 2 bubbles | Bubbles arrive from their own side | tick per bubble |
| 5 | 13.5 | 3.5 | **L'app** | Real Mes courses screen · "Installable · Hors-ligne · Sans compte" | Three chips land in sequence | tick per chip |
| 6 | 17.0 | 3.0 | **Outro** | I&N RUN · the URL · WhatsApp number | Wordmark assembles letter by letter | impact, bed resolves |

**Readability check.** Longest line is the outro's three stacked lines at
~3s. Scene 5's three chips are 2–3 words each and hold ≥0.9s after landing.
No line is on screen for less than 0.8s settled.

**Show the thing.** Scenes 2, 3 and 5 are real screenshots of the running
build, captured from a local server — not mockups.

## Music cue guidance

No bundled track and no `assets/music/cues/` in this upload. Using the
project's own 22s bed (`video/public/sfx/bed.mp3`), trimmed to 20s. Its
intensity automation is baked into the file, so the cut points carry the
rhythm via the impacts rather than via beat-sync. Cues are placed on the six
scene boundaries listed above.
