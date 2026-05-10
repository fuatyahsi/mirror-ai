from __future__ import annotations

import itertools
import math
import os
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    import swisseph as swe
except ImportError as exc:  # pragma: no cover
    raise RuntimeError(
        "Swiss Ephemeris Python binding is not installed. Run: python -m pip install -r requirements.txt"
    ) from exc

from .models import NatalChartRequest, SynastryRequest

SIGNS = [
    ("aries", "Koç"),
    ("taurus", "Boğa"),
    ("gemini", "İkizler"),
    ("cancer", "Yengeç"),
    ("leo", "Aslan"),
    ("virgo", "Başak"),
    ("libra", "Terazi"),
    ("scorpio", "Akrep"),
    ("sagittarius", "Yay"),
    ("capricorn", "Oğlak"),
    ("aquarius", "Kova"),
    ("pisces", "Balık"),
]

PLANETS = [
    ("sun", "Güneş", swe.SUN),
    ("moon", "Ay", swe.MOON),
    ("mercury", "Merkür", swe.MERCURY),
    ("venus", "Venüs", swe.VENUS),
    ("mars", "Mars", swe.MARS),
    ("jupiter", "Jüpiter", swe.JUPITER),
    ("saturn", "Satürn", swe.SATURN),
    ("uranus", "Uranüs", swe.URANUS),
    ("neptune", "Neptün", swe.NEPTUNE),
    ("pluto", "Plüton", swe.PLUTO),
    ("true_node", "Kuzey Ay Düğümü", swe.TRUE_NODE),
]

ASPECTS = [
    ("conjunction", "Kavuşum", 0, 8),
    ("sextile", "Altmışlık", 60, 4),
    ("square", "Kare", 90, 6),
    ("trine", "Üçgen", 120, 6),
    ("opposition", "Karşıt", 180, 8),
]

SYNASTRY_ASPECTS = [
    {"type": "conjunction", "tr": "Kavuşum", "en": "Conjunction", "angle": 0, "orb": 7, "score": 8},
    {"type": "sextile", "tr": "Altmışlık", "en": "Sextile", "angle": 60, "orb": 4, "score": 7},
    {"type": "square", "tr": "Kare", "en": "Square", "angle": 90, "orb": 5, "score": -5},
    {"type": "trine", "tr": "Üçgen", "en": "Trine", "angle": 120, "orb": 5, "score": 8},
    {"type": "opposition", "tr": "Karşıt", "en": "Opposition", "angle": 180, "orb": 6, "score": -3},
]

SYNASTRY_PAIRS = [
    ("sun", "moon", "emotional", 1.2),
    ("moon", "sun", "emotional", 1.2),
    ("moon", "venus", "emotional", 1.1),
    ("venus", "moon", "emotional", 1.1),
    ("mercury", "mercury", "mental", 1.2),
    ("sun", "mercury", "mental", 0.8),
    ("mercury", "sun", "mental", 0.8),
    ("venus", "mars", "romantic", 1.4),
    ("mars", "venus", "romantic", 1.4),
    ("venus", "venus", "romantic", 0.9),
    ("mars", "mars", "crisis", 1.0),
    ("moon", "saturn", "attachment", 1.35),
    ("saturn", "moon", "attachment", 1.35),
    ("venus", "saturn", "long_term", 1.2),
    ("saturn", "venus", "long_term", 1.2),
    ("sun", "saturn", "long_term", 0.95),
    ("saturn", "sun", "long_term", 0.95),
    ("true_node", "sun", "karmic", 1.0),
    ("sun", "true_node", "karmic", 1.0),
    ("true_node", "moon", "karmic", 1.0),
    ("moon", "true_node", "karmic", 1.0),
]

CATEGORY_COPY = {
    "tr": {
        "emotional": "duygusal güven ve tepki ritmi",
        "mental": "iletişim ve zihinsel akış",
        "romantic": "romantik çekim ve temas dili",
        "long_term": "uzun vadeli sorumluluk",
        "crisis": "gerilim ve dürtü yönetimi",
        "attachment": "bağlanma ve güvenlik ihtiyacı",
        "karmic": "tekrarlayan/tanıdık tema",
    },
    "en": {
        "emotional": "emotional safety and reaction rhythm",
        "mental": "communication and mental flow",
        "romantic": "romantic pull and contact style",
        "long_term": "long-term responsibility",
        "crisis": "tension and impulse management",
        "attachment": "attachment and need for safety",
        "karmic": "repeating/familiar theme",
    },
}

EPHEMERIS_FILES = ["sepl_18.se1", "semo_18.se1", "seas_18.se1"]
DEFAULT_EPHEMERIS_DOWNLOAD_BASE_URL = "https://raw.githubusercontent.com/aloistr/swisseph/master/ephe"


def configure_ephemeris() -> str:
    ephe_path = Path(os.getenv("SWISS_EPHEMERIS_PATH", "./ephe")).resolve()
    swe.set_ephe_path(str(ephe_path))
    return str(ephe_path)


def ephemeris_status() -> dict:
    ephe_path = Path(configure_ephemeris())
    files = {name: (ephe_path / name).exists() for name in EPHEMERIS_FILES}
    return {
        "path": str(ephe_path),
        "required_files": files,
        "ready": all(files.values()),
        "auto_download_enabled": is_ephemeris_auto_download_enabled(),
        "download_base_url": ephemeris_download_base_url(),
        "moshier_fallback_enabled": is_moshier_fallback_enabled(),
    }


def is_moshier_fallback_enabled() -> bool:
    return os.getenv("MIRROR_ASTRO_FALLBACK_TO_MOSHIER", "true").lower() == "true"


def is_ephemeris_auto_download_enabled() -> bool:
    return os.getenv("MIRROR_ASTRO_AUTO_DOWNLOAD_EPHEMERIS", "true").lower() == "true"


def ephemeris_download_base_url() -> str:
    return os.getenv("SWISS_EPHEMERIS_DOWNLOAD_BASE_URL", DEFAULT_EPHEMERIS_DOWNLOAD_BASE_URL).rstrip("/")


def ensure_ephemeris_files() -> None:
    if ephemeris_status()["ready"] or not is_ephemeris_auto_download_enabled():
        return

    ephe_path = Path(configure_ephemeris())
    ephe_path.mkdir(parents=True, exist_ok=True)
    base_url = ephemeris_download_base_url()

    for file_name in EPHEMERIS_FILES:
        destination = ephe_path / file_name
        if destination.exists():
            continue

        temporary_destination = destination.with_suffix(destination.suffix + ".tmp")
        urllib.request.urlretrieve(f"{base_url}/{file_name}", temporary_destination)
        temporary_destination.replace(destination)


def require_ephemeris_ready() -> None:
    ensure_ephemeris_files()
    status = ephemeris_status()
    if status["ready"] or status["moshier_fallback_enabled"]:
        return

    missing = [name for name, exists in status["required_files"].items() if not exists]
    raise RuntimeError(
        "Swiss ephemeris files are required when MIRROR_ASTRO_FALLBACK_TO_MOSHIER=false. "
        f"Missing files in {status['path']}: {', '.join(missing)}"
    )


def decimal_hour(value: datetime) -> float:
    return value.hour + value.minute / 60 + value.second / 3600 + value.microsecond / 3_600_000_000


def sign_for_longitude(longitude: float) -> dict:
    normalized = longitude % 360
    index = int(normalized // 30)
    sign_key, sign_label = SIGNS[index]
    return {
        "absolute_degree": round(normalized, 6),
        "sign_key": sign_key,
        "sign_label": sign_label,
        "degree": round(normalized % 30, 6),
    }


def zodiac_point(key: str, label: str, longitude: float) -> dict:
    return {
        "key": key,
        "label": label,
        **sign_for_longitude(longitude),
    }


def parse_birth_date(value: str) -> str:
    clean = value.strip().replace("/", ".").replace("-", ".")
    parts = [part for part in clean.split(".") if part]
    if len(parts) != 3:
        return value.strip()

    first, second, third = parts
    if len(first) == 4:
        return f"{first}-{second.zfill(2)}-{third.zfill(2)}"
    if len(third) == 4:
        return f"{third}-{second.zfill(2)}-{first.zfill(2)}"
    return value.strip()


def parse_local_datetime(request: NatalChartRequest) -> datetime:
    local_time = request.birth_time or "12:00"
    if len(local_time.split(":")) == 2:
        local_time = f"{local_time}:00"

    birth_date = parse_birth_date(request.birth_date)
    naive = datetime.fromisoformat(f"{birth_date}T{local_time}")
    return naive.replace(tzinfo=ZoneInfo(request.timezone))


def unpack_calc_result(result: tuple) -> tuple[list[float], int, str]:
    if len(result) == 3:
        values, result_flags, error_text = result
        return list(values), int(result_flags), str(error_text or "")
    if len(result) == 2:
        values, result_flags = result
        return list(values), int(result_flags), ""
    return list(result), 0, ""


def calc_body(jd_ut: float, body_id: int) -> tuple[list[float], int, str | None]:
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    fallback_warning = None
    try:
        values, result_flags, error_text = unpack_calc_result(swe.calc_ut(jd_ut, body_id, flags))
        if error_text and is_user_facing_warning(error_text):
            fallback_warning = error_text
        return list(values), result_flags, fallback_warning
    except Exception:
        if not is_moshier_fallback_enabled():
            raise
        values, result_flags, _error_text = unpack_calc_result(
            swe.calc_ut(jd_ut, body_id, swe.FLG_MOSEPH | swe.FLG_SPEED)
        )
        fallback_warning = "Swiss ephemeris files were unavailable; Moshier fallback was used for development."
        return list(values), result_flags, fallback_warning


def is_user_facing_warning(message: str) -> bool:
    lower = message.lower()
    technical_fragments = [
        "not found in path",
        "using moshier",
        "sepl_",
        "semo_",
        "seas_",
        ".se1",
    ]
    return not any(fragment in lower for fragment in technical_fragments)


def normalize_angle_distance(a: float, b: float) -> float:
    distance = abs((a - b) % 360)
    return min(distance, 360 - distance)


def calculate_aspects(planets: list[dict]) -> list[dict]:
    aspects = []
    for first, second in itertools.combinations(planets, 2):
        distance = normalize_angle_distance(first["absolute_degree"], second["absolute_degree"])
        for key, label, exact, orb in ASPECTS:
            delta = abs(distance - exact)
            if delta <= orb:
                aspects.append(
                    {
                        "type": key,
                        "label": label,
                        "between": [first["key"], second["key"]],
                        "orb": round(delta, 4),
                    }
                )
                break
    return aspects


def calculate_houses(jd_ut: float, latitude: float, longitude: float, house_system: str) -> tuple[list[dict], dict]:
    hsys = house_system.encode("ascii", errors="ignore")[:1] or b"P"
    cusps, ascmc = swe.houses_ex(jd_ut, latitude, longitude, hsys)
    cusp_values = list(cusps)
    if len(cusp_values) == 13:
        cusp_values = cusp_values[1:]

    houses = [
        {"house": index + 1, **sign_for_longitude(cusp)}
        for index, cusp in enumerate(cusp_values[:12])
    ]
    ascendant = zodiac_point("ascendant", "Yükselen", list(ascmc)[0])
    midheaven = zodiac_point("midheaven", "Tepe Noktası", list(ascmc)[1])
    return houses, {"ascendant": ascendant, "midheaven": midheaven}


def calculate_natal_chart(request: NatalChartRequest) -> dict:
    require_ephemeris_ready()
    ephe_path = configure_ephemeris()
    local_dt = parse_local_datetime(request)
    utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
    jd_ut = swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        decimal_hour(utc_dt),
        swe.GREG_CAL,
    )

    warnings = []
    planets = []
    for key, label, body_id in PLANETS:
        values, _flags, warning = calc_body(jd_ut, body_id)
        if warning and warning not in warnings:
            warnings.append(warning)
        point = zodiac_point(key, label, values[0])
        point["speed"] = round(values[3], 8)
        point["retrograde"] = values[3] < 0
        planets.append(point)

    houses, angles = calculate_houses(
        jd_ut,
        request.latitude,
        request.longitude,
        request.house_system,
    )

    by_key = {planet["key"]: planet for planet in planets}
    chart = {
        "input": request.model_dump(),
        "time": {
            "local": local_dt.isoformat(),
            "utc": utc_dt.isoformat(),
            "julian_day_ut": round(jd_ut, 8),
        },
        "engine": {
            "name": "Swiss Ephemeris",
            "python_package": "pyswisseph",
            "version": swe.version,
            "ephemeris_path": ephe_path,
        },
        "sun": by_key["sun"],
        "moon": by_key["moon"],
        "ascendant": angles["ascendant"],
        "midheaven": angles["midheaven"],
        "planets": planets,
        "houses": houses,
        "aspects": calculate_aspects(planets),
        "warnings": warnings,
    }

    if not math.isfinite(chart["sun"]["absolute_degree"]):
        raise ValueError("Invalid chart calculation result.")

    return chart


def calculate_synastry(request: SynastryRequest) -> dict:
    first_chart = calculate_natal_chart(request.first)
    second_chart = calculate_natal_chart(request.second)
    locale = request.locale if request.locale in ("tr", "en") else "tr"
    aspects = calculate_synastry_aspects(first_chart, second_chart, locale)
    scores = calculate_synastry_scores(aspects)
    supportive_average = (
        scores["emotional_harmony"]
        + scores["mental_flow"]
        + scores["romantic_pull"]
        + scores["long_term_potential"]
    ) / 4
    pressure = (
        scores["crisis_intensity"]
        + scores["attachment_dynamic"]
        + scores["repeating_theme"]
    ) / 3
    overall_score = round(max(28, min(92, supportive_average * 0.74 + (100 - pressure) * 0.26)))

    report = {
        "overall_score": overall_score,
        "confidence": 0.81 if request.second_birth_time_known else 0.66,
        "time_accuracy_note": partner_time_accuracy_note(request.second_birth_time_known, locale),
        "strengths": top_synastry_categories(
            aspects,
            ["emotional", "mental", "romantic", "long_term"],
            locale,
        ),
        "risk_areas": top_synastry_categories(
            aspects,
            ["crisis", "attachment", "karmic"],
            locale,
        ),
        "scores": scores,
        "key_aspects": aspects[:10],
    }

    return {
        "input": request.model_dump(),
        "first_chart": first_chart,
        "second_chart": second_chart,
        "synastry": report,
    }


def calculate_synastry_aspects(first_chart: dict, second_chart: dict, locale: str) -> list[dict]:
    first_points = synastry_point_map(first_chart)
    second_points = synastry_point_map(second_chart)
    aspects = []

    for first_key, second_key, category, weight in SYNASTRY_PAIRS:
        first = first_points.get(first_key)
        second = second_points.get(second_key)
        if not first or not second:
            continue

        distance = normalize_angle_distance(first["absolute_degree"], second["absolute_degree"])
        for definition in SYNASTRY_ASPECTS:
            delta = abs(distance - definition["angle"])
            if delta > definition["orb"]:
                continue

            orb = round(delta, 2)
            label = definition["en"] if locale == "en" else definition["tr"]
            aspects.append(
                {
                    "type": definition["type"],
                    "label": label,
                    "between": [first["key"], second["key"]],
                    "orb": orb,
                    "category": category,
                    "weight": weight,
                    "reference": (
                        f"{first['label']} {format_synastry_point(first)} - "
                        f"{second['label']} {format_synastry_point(second)}: {label}, orb {orb:.2f}°"
                    ),
                }
            )
            break

    return sorted(aspects, key=lambda item: item["orb"])


def synastry_point_map(chart: dict) -> dict[str, dict]:
    points = {}
    for point in [
        chart.get("sun"),
        chart.get("moon"),
        chart.get("ascendant"),
        chart.get("midheaven"),
        *chart.get("planets", []),
    ]:
        if point and point.get("key") and math.isfinite(point.get("absolute_degree", float("nan"))):
            points[point["key"]] = point
    return points


def calculate_synastry_scores(aspects: list[dict]) -> dict:
    return {
        "emotional_harmony": synastry_category_score(aspects, "emotional"),
        "mental_flow": synastry_category_score(aspects, "mental"),
        "romantic_pull": synastry_category_score(aspects, "romantic"),
        "long_term_potential": synastry_category_score(aspects, "long_term"),
        "crisis_intensity": synastry_category_intensity(aspects, "crisis"),
        "attachment_dynamic": synastry_category_intensity(aspects, "attachment"),
        "repeating_theme": synastry_category_intensity(aspects, "karmic"),
    }


def synastry_category_score(aspects: list[dict], category: str) -> int:
    matches = [aspect for aspect in aspects if aspect["category"] == category]
    if not matches:
        return 54

    raw = 0.0
    for aspect in matches:
        definition = next((item for item in SYNASTRY_ASPECTS if item["type"] == aspect["type"]), None)
        raw += (definition["score"] if definition else 0) * aspect["weight"] * (
            1 - min(aspect["orb"], 8) / 14
        )

    return round(max(24, min(94, 56 + raw * 5)))


def synastry_category_intensity(aspects: list[dict], category: str) -> int:
    matches = [aspect for aspect in aspects if aspect["category"] == category]
    if not matches:
        return 42

    raw = sum(aspect["weight"] * (1 - min(aspect["orb"], 8) / 10) for aspect in matches)
    return round(max(38, min(91, 46 + raw * 21)))


def top_synastry_categories(aspects: list[dict], categories: list[str], locale: str) -> list[str]:
    seen = set()
    result = []
    for aspect in aspects:
        category = aspect["category"]
        if category not in categories or category in seen:
            continue
        seen.add(category)
        result.append(f"{CATEGORY_COPY[locale][category]}: {aspect['reference']}")
    return result[:3]


def partner_time_accuracy_note(is_known: bool, locale: str) -> str | None:
    if is_known:
        return None
    if locale == "en":
        return (
            "Partner birth time is unknown, so houses and Ascendant are read flexibly. "
            "The report leans on planet-to-planet synastry."
        )
    return (
        "Karşı tarafın doğum saati bilinmediği için evler ve yükselen esnek okunur. "
        "Analiz gezegenler arası sinastriye dayanır."
    )


def format_synastry_point(point: dict) -> str:
    retrograde = " R" if point.get("retrograde") else ""
    return f"{point['sign_label']} {float(point['degree']):.1f}°{retrograde}"
