#!/usr/bin/env python3
"""Generate bot/Timezones.gs from the IANA tz database shipped with the OS.

Source files (public domain, part of tzdata):
  /usr/share/zoneinfo/iso3166.tab  -> ISO 3166-1 alpha-2 code + English country name
  /usr/share/zoneinfo/zone.tab     -> country code -> IANA timezone(s)

tzdata orders the zones of a country most-populous-first, so the first zone
listed for a country is the one to offer as its default.

Run:  python3 bot/tools/generate_timezones.py > bot/Timezones.gs
"""

import datetime
import json
import re
import unicodedata
import sys
import zoneinfo
from collections import OrderedDict

ISO3166 = "/usr/share/zoneinfo/iso3166.tab"
ZONETAB = "/usr/share/zoneinfo/zone.tab"

# Names people actually type into a bot, mapped to ISO 3166-1 alpha-2.
# Country names from iso3166.tab are added automatically; this covers the rest.
ALIASES = {
    "usa": "US", "us": "US", "u.s.": "US", "u.s.a.": "US", "america": "US",
    "united states of america": "US", "states": "US",
    "uk": "GB", "u.k.": "GB", "england": "GB", "scotland": "GB", "wales": "GB",
    "northern ireland": "GB", "britain": "GB", "great britain": "GB",
    "uae": "AE", "u.a.e.": "AE", "emirates": "AE", "dubai": "AE", "abu dhabi": "AE",
    "holland": "NL", "the netherlands": "NL",
    "south korea": "KR", "korea": "KR", "republic of korea": "KR",
    "north korea": "KP",
    "russia": "RU", "russian federation": "RU",
    "turkey": "TR", "turkiye": "TR", "türkiye": "TR",
    "czechia": "CZ", "czech": "CZ", "czech republic": "CZ",
    "iran": "IR", "persia": "IR",
    "vietnam": "VN", "viet nam": "VN",
    "syria": "SY", "laos": "LA", "brunei": "BN", "macau": "MO", "macao": "MO",
    "hong kong": "HK", "taiwan": "TW", "palestine": "PS", "vatican": "VA",
    "ivory coast": "CI", "cote d'ivoire": "CI", "côte d'ivoire": "CI",
    "cape verde": "CV", "cabo verde": "CV",
    "swaziland": "SZ", "eswatini": "SZ",
    "burma": "MM", "myanmar": "MM",
    "east timor": "TL", "timor leste": "TL",
    "congo": "CD", "drc": "CD", "dr congo": "CD", "democratic republic of the congo": "CD",
    "republic of the congo": "CG", "congo brazzaville": "CG",
    "bolivia": "BO", "venezuela": "VE", "tanzania": "TZ", "moldova": "MD",
    "macedonia": "MK", "north macedonia": "MK",
    "bosnia": "BA", "herzegovina": "BA",
    "saudi": "SA", "saudi arabia": "SA",
    "new zealand": "NZ", "south africa": "ZA", "sri lanka": "LK",
    "dominican republic": "DO", "costa rica": "CR", "puerto rico": "PR",
    "el salvador": "SV", "papua new guinea": "PG", "sierra leone": "SL",
    "burkina": "BF", "burkina faso": "BF",
    "germany": "DE", "deutschland": "DE", "france": "FR", "spain": "ES",
    "italy": "IT", "canada": "CA", "australia": "AU", "china": "CN",
    "india": "IN", "japan": "JP", "brazil": "BR", "mexico": "MX",
}


# tzdata sorts a country's zones geographically first, population second, so for
# a few large countries the first row is not where most people live (Russia leads
# with Kaliningrad, Canada with Newfoundland). Pin those to the capital/largest city.
PRIMARY_OVERRIDES = {
    "AU": "Australia/Sydney",
    "BR": "America/Sao_Paulo",
    "CA": "America/Toronto",
    "RU": "Europe/Moscow",
    "UA": "Europe/Kyiv",
    "UZ": "Asia/Tashkent",
    "FM": "Pacific/Pohnpei",   # capital Palikir is on Pohnpei
}



def normalize(text):
    """Must stay byte-for-byte equivalent to normalizeName() in TimezoneBot.gs."""
    text = text.replace("\u200c", " ")                 # ZWNJ / نیم‌فاصله
    text = text.replace("\u064a", "\u06cc").replace("\u0649", "\u06cc")  # ي ى -> ی
    text = text.replace("\u0643", "\u06a9")            # ك -> ک
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[.,\-_'\"()\[\]/]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def load_countries():
    names = OrderedDict()
    with open(ISO3166, encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("#") or not line.strip():
                continue
            code, name = line.rstrip("\n").split("\t", 1)
            names[code] = name

    zones = OrderedDict()
    with open(ZONETAB, encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("#") or not line.strip():
                continue
            parts = line.rstrip("\n").split("\t")
            code, zone = parts[0], parts[2]
            comment = parts[3] if len(parts) > 3 else ""
            zones.setdefault(code, []).append((zone, comment))
    return names, zones


def offsets(zone, year):
    """Return (standard offset minutes, dst offset minutes or None)."""
    tz = zoneinfo.ZoneInfo(zone)
    std = dst = None
    for month in range(1, 13):
        moment = datetime.datetime(year, month, 15, 12, 0, tzinfo=tz)
        off = int(moment.utcoffset().total_seconds() // 60)
        if moment.dst():
            dst = off if dst is None else max(dst, off)
        else:
            std = off if std is None else min(std, off)
    if std is None:  # permanent DST (rare, e.g. some zones after law changes)
        std, dst = dst, None
    return std, dst


def fmt_offset(minutes):
    sign = "+" if minutes >= 0 else "-"
    minutes = abs(minutes)
    return "UTC%s%02d:%02d" % (sign, minutes // 60, minutes % 60)


def city_of(zone):
    return zone.split("/")[-1].replace("_", " ")


def main():
    year = datetime.date.today().year
    names, zones = load_countries()

    entries = OrderedDict()
    for code, name in names.items():
        rows = zones.get(code)
        if not rows:
            continue  # e.g. AQ sub-entries with no civil zone
        primary, _ = rows[0]
        forced = PRIMARY_OVERRIDES.get(code)
        if forced:
            assert forced in [z for z, _ in rows], (code, forced)
            primary = forced
        std, dst = offsets(primary, year)
        entries[code] = {
            "name": name,
            "tz": primary,
            "city": city_of(primary),
            "std": std,
            "dst": dst,
            "zones": [z for z, _ in rows],
            "regions": [c for _, c in rows if c],
        }

    # Countries whose primary zone keeps the exact same clock all year.
    # These are the ones Windows lumps into one dropdown row.
    groups = {}
    for code, e in entries.items():
        groups.setdefault((e["std"], e["dst"]), []).append(code)

    alias_map = {}

    def claim(key, code, overwrite=False):
        key = normalize(key)
        if key and (overwrite or key not in alias_map):
            alias_map[key] = code

    # 1. full country name, e.g. "britain uk", "korea south"
    for code, e in entries.items():
        claim(e["name"], code, overwrite=True)
    # 2. ISO code — always wins over a name collision
    for code in entries:
        claim(code, code, overwrite=True)
    # 3. the part before a parenthesis: "Korea (South)" -> "korea"
    for code, e in entries.items():
        head = e["name"].split("(")[0]
        if head.strip() and head != e["name"]:
            claim(head, code)
    # 4. short abbreviations inside parentheses: "Britain (UK)" -> "uk"
    for code, e in entries.items():
        for inner in re.findall(r"\(([^)]*)\)", e["name"]):
            if len(inner.strip()) <= 3:
                claim(inner, code)
    # 5. representative city, only where it does not shadow a country name
    for code, e in entries.items():
        claim(e["city"], code)
    # 6. hand-written aliases always win
    for k, v in ALIASES.items():
        if v in entries:
            claim(k, v, overwrite=True)

    out = sys.stdout.write
    out("/**\n")
    out(" * Timezones.gs - country -> IANA timezone lookup for the bot.\n")
    out(" *\n")
    out(" * GENERATED FILE - do not edit by hand.\n")
    out(" * Regenerate with: python3 bot/tools/generate_timezones.py > bot/Timezones.gs\n")
    out(" * Source: IANA tz database (iso3166.tab + zone.tab), public domain.\n")
    out(" * Generated for year %d, %d countries/territories.\n" % (year, len(entries)))
    out(" */\n\n")

    out("// code -> { name, tz, city, std, dst, zones, regions }\n")
    out("//   tz      primary IANA zone (tzdata lists the most populous zone first)\n")
    out("//   city    the label a phone/PC clock picker actually shows\n")
    out("//   std     standard-time offset in minutes from UTC\n")
    out("//   dst     summer-time offset in minutes, or null if the country has no DST\n")
    out("//   zones   every IANA zone in the country\n")
    out("//   regions tzdata's description of each extra zone (multi-zone countries only)\n")
    out("const COUNTRY_TIMEZONES = ")
    out(json.dumps(entries, ensure_ascii=False, indent=2))
    out(";\n\n")

    out("// Lowercased country name / ISO code / capital city / common alias -> ISO code.\n")
    out("const COUNTRY_ALIASES = ")
    out(json.dumps(OrderedDict(sorted(alias_map.items())), ensure_ascii=False, indent=2))
    out(";\n")

    sys.stderr.write(
        "generated %d countries, %d aliases, %d distinct offset groups\n"
        % (len(entries), len(alias_map), len(groups))
    )


if __name__ == "__main__":
    main()
