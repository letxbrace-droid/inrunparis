#!/usr/bin/env python3
"""Génère actus.json pour les dashboards TV : titres franceinfo + Ligue 1 (TheSportsDB).

Lancé toutes les 30 min par .github/workflows/tv-data.yml ; le résultat est publié
sur la branche `tv-data` et lu par la TV via raw.githubusercontent.com (CORS ouvert).
"""
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

UA = {"User-Agent": "Mozilla/5.0 (inrun-tv-dashboard)"}
RSS = "https://www.francetvinfo.fr/titres.rss"
SDB = "https://www.thesportsdb.com/api/v1/json/123/"
LIGUE = "4334"  # French Ligue 1


def get(url, as_json=True):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        data = r.read()
    return json.loads(data) if as_json else data


def actus():
    root = ET.fromstring(get(RSS, as_json=False))
    out = []
    for item in root.iter("item"):
        t = (item.findtext("title") or "").strip()
        if t:
            out.append(t)
        if len(out) >= 15:
            break
    return out


def match(e):
    when = None
    if e.get("dateEvent") and e.get("strTime"):
        when = e["dateEvent"] + "T" + e["strTime"][:8] + "Z"  # strTime est en UTC
    return {
        "dom": e.get("strHomeTeam"), "ext": e.get("strAwayTeam"),
        "bdom": e.get("strHomeTeamBadge"), "bext": e.get("strAwayTeamBadge"),
        "sd": e.get("intHomeScore"), "se": e.get("intAwayScore"),
        "quand": when, "statut": e.get("strStatus"),
    }


def foot():
    nxt = (get(SDB + "eventsnextleague.php?id=" + LIGUE).get("events") or [])
    if not nxt:
        return None
    rnd = int(nxt[0]["intRound"])
    season = nxt[0]["strSeason"]

    def round_events(r):
        if r < 1:
            return []
        ev = get(SDB + "eventsround.php?id=%s&r=%d&s=%s" % (LIGUE, r, season)).get("events") or []
        return [match(e) for e in ev]

    cur = round_events(rnd)
    prev = round_events(rnd - 1)
    joues = [m for m in cur if m["sd"] is not None] or [m for m in prev if m["sd"] is not None]
    a_venir = sorted([m for m in cur if m["sd"] is None], key=lambda m: m["quand"] or "")
    table = get(SDB + "lookuptable.php?l=%s&s=%s" % (LIGUE, season)).get("table") or []
    return {
        "ligue": "Ligue 1", "journee": rnd, "saison": season,
        "prochains": a_venir,
        "resultats": joues,
        "journee_resultats": rnd if any(m["sd"] is not None for m in cur) else rnd - 1,
        "classement": [{"rang": t.get("intRank"), "equipe": t.get("strTeam"), "badge": t.get("strBadge"),
                        "pts": t.get("intPoints"), "j": t.get("intPlayed")} for t in table],
    }


def main(path):
    out = {"maj": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    try:
        out["actus"] = actus()
    except Exception as e:  # une source en panne ne bloque pas l'autre
        print("actus:", e, file=sys.stderr)
        out["actus"] = []
    try:
        out["foot"] = foot()
    except Exception as e:
        print("foot:", e, file=sys.stderr)
        out["foot"] = None
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("ok:", len(out["actus"]), "titres, foot:", bool(out["foot"]))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "actus.json")
