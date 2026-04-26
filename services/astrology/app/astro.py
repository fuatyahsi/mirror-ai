from __future__ import annotations

import itertools
import math
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    import swisseph as swe
except ImportError as exc:  # pragma: no cover
    raise RuntimeError(
        "Swiss Ephemeris Python binding is not installed. Run: python -m pip install -r requirements.txt"
    ) from exc

from .models import NatalChartRequest

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


def configure_ephemeris() -> str:
    ephe_path = Path(os.getenv("SWISS_EPHEMERIS_PATH", "./ephe")).resolve()
    swe.set_ephe_path(str(ephe_path))
    return str(ephe_path)


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


def parse_local_datetime(request: NatalChartRequest) -> datetime:
    local_time = request.birth_time or "12:00"
    if len(local_time.split(":")) == 2:
        local_time = f"{local_time}:00"

    naive = datetime.fromisoformat(f"{request.birth_date}T{local_time}")
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
        if error_text:
            fallback_warning = error_text
        return list(values), result_flags, fallback_warning
    except Exception:
        if os.getenv("MIRROR_ASTRO_FALLBACK_TO_MOSHIER", "true").lower() != "true":
            raise
        values, result_flags, _error_text = unpack_calc_result(
            swe.calc_ut(jd_ut, body_id, swe.FLG_MOSEPH | swe.FLG_SPEED)
        )
        fallback_warning = "Swiss ephemeris files were unavailable; Moshier fallback was used for development."
        return list(values), result_flags, fallback_warning


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
            "python_package": "pysweph",
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
