from __future__ import annotations

from datetime import datetime, timezone

try:
    import swisseph as swe
except ModuleNotFoundError:
    swe = None

from app.schemas.chart import Aspect, HousePosition


ZODIAC_SIGNS = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
]

MAJOR_ASPECTS = {
    "conjunction": 0.0,
    "sextile": 60.0,
    "square": 90.0,
    "trine": 120.0,
    "opposition": 180.0,
}

if swe:
    BODY_MAP = {
        "Sun": swe.SUN,
        "Moon": swe.MOON,
        "Mercury": swe.MERCURY,
        "Venus": swe.VENUS,
        "Mars": swe.MARS,
        "Jupiter": swe.JUPITER,
        "Saturn": swe.SATURN,
        "Uranus": swe.URANUS,
        "Neptune": swe.NEPTUNE,
        "Pluto": swe.PLUTO,
    }

    POINT_MAP = {
        "North Node": swe.MEAN_NODE,
    }

    ASTEROID_MAP = {
        "Chiron": swe.CHIRON,
        "Ceres": swe.CERES,
        "Pallas": swe.PALLAS,
        "Juno": swe.JUNO,
        "Vesta": swe.VESTA,
    }

    HOUSE_SYSTEM_CODE = {
        "placidus": b"P",
        "koch": b"K",
        "whole_sign": b"W",
    }
else:
    BODY_MAP = {}
    POINT_MAP = {}
    ASTEROID_MAP = {}
    HOUSE_SYSTEM_CODE = {}


class AstrologyEngineUnavailableError(Exception):
    pass


def normalize_degrees(value: float) -> float:
    return value % 360.0


def sign_from_longitude(longitude: float) -> str:
    idx = int(normalize_degrees(longitude) // 30)
    return ZODIAC_SIGNS[idx]


def degree_in_sign(longitude: float) -> float:
    return normalize_degrees(longitude) % 30


class AstrologyService:
    def __init__(self) -> None:
        if swe:
            swe.set_ephe_path(".")

    def calculate(
        self,
        utc_dt: datetime,
        lat: float,
        lng: float,
        zodiac_mode: str,
        house_system: str,
    ) -> dict:
        if not swe:
            raise AstrologyEngineUnavailableError(
                "Swiss Ephemeris engine is unavailable in this runtime. "
                "Install requirements-astro.txt or deploy API runtime with native-extension support."
            )

        if utc_dt.tzinfo is None:
            utc_dt = utc_dt.replace(tzinfo=timezone.utc)
        utc_dt = utc_dt.astimezone(timezone.utc)

        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        if zodiac_mode == "sidereal":
            swe.set_sid_mode(swe.SIDM_LAHIRI)
            flags |= swe.FLG_SIDEREAL

        jd_ut = swe.julday(
            utc_dt.year,
            utc_dt.month,
            utc_dt.day,
            utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600,
        )

        planets = self._calc_bodies(jd_ut, BODY_MAP, flags)
        points = self._calc_bodies(jd_ut, POINT_MAP, flags)
        asteroids = self._calc_bodies(jd_ut, ASTEROID_MAP, flags, allow_partial=True)

        houses, ascendant = self._calc_houses(jd_ut, lat, lng, house_system, zodiac_mode)
        aspects = self._calc_aspects(planets + points)

        return {
            "planets": planets,
            "points": points,
            "asteroids": asteroids,
            "houses": houses,
            "ascendant": ascendant,
            "aspects": aspects,
        }

    def _calc_bodies(
        self,
        jd_ut: float,
        body_map: dict[str, int],
        flags: int,
        allow_partial: bool = False,
    ) -> list[dict]:
        data: list[dict] = []
        for name, body_id in body_map.items():
            try:
                xx, _ = swe.calc_ut(jd_ut, body_id, flags)
            except swe.Error:
                if allow_partial:
                    continue
                raise
            lon = normalize_degrees(xx[0])
            lat = xx[1]
            speed = xx[3]
            data.append(
                {
                    "name": name,
                    "longitude": round(lon, 6),
                    "latitude": round(lat, 6),
                    "speed": round(speed, 6),
                    "sign": sign_from_longitude(lon),
                    "degree_in_sign": round(degree_in_sign(lon), 6),
                    "retrograde": speed < 0,
                }
            )
        return data

    def _calc_houses(
        self,
        jd_ut: float,
        lat: float,
        lng: float,
        house_system: str,
        zodiac_mode: str,
    ) -> tuple[list[HousePosition], dict]:
        hsys = HOUSE_SYSTEM_CODE[house_system]
        cusps, ascmc = swe.houses_ex(jd_ut, lat, lng, hsys)

        raw_cusps = list(cusps)
        if len(raw_cusps) >= 13:
            cusps_values = [normalize_degrees(cusp) for cusp in raw_cusps[1:13]]
        else:
            cusps_values = [normalize_degrees(cusp) for cusp in raw_cusps[:12]]

        asc_value = normalize_degrees(ascmc[0])

        if zodiac_mode == "sidereal":
            ayanamsa = swe.get_ayanamsa_ut(jd_ut)
            cusps_values = [normalize_degrees(cusp - ayanamsa) for cusp in cusps_values]
            asc_value = normalize_degrees(asc_value - ayanamsa)

        if house_system == "whole_sign":
            asc_sign_start = int(asc_value // 30) * 30
            cusps_values = [normalize_degrees(asc_sign_start + i * 30) for i in range(12)]
        elif len(cusps_values) < 12:
            cusps_values = [normalize_degrees(asc_value + i * 30) for i in range(12)]

        houses = [
            HousePosition(
                house=i + 1,
                longitude=round(cusps_values[i], 6),
                sign=sign_from_longitude(cusps_values[i]),
            )
            for i in range(12)
        ]

        ascendant = {
            "name": "Ascendant",
            "longitude": round(asc_value, 6),
            "latitude": 0.0,
            "speed": 0.0,
            "sign": sign_from_longitude(asc_value),
            "degree_in_sign": round(degree_in_sign(asc_value), 6),
            "retrograde": False,
        }

        return houses, ascendant

    def _calc_aspects(self, bodies: list[dict], orb_limit: float = 6.0) -> list[Aspect]:
        aspects: list[Aspect] = []

        for idx, body_a in enumerate(bodies):
            for body_b in bodies[idx + 1 :]:
                angle = abs(body_a["longitude"] - body_b["longitude"])
                angle = min(angle, 360 - angle)

                for aspect_name, target in MAJOR_ASPECTS.items():
                    orb = abs(angle - target)
                    if orb <= orb_limit:
                        aspects.append(
                            Aspect(
                                body_a=body_a["name"],
                                body_b=body_b["name"],
                                aspect=aspect_name,
                                angle=round(angle, 6),
                                orb=round(orb, 6),
                            )
                        )
                        break

        return aspects
