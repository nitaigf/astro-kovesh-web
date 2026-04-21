from datetime import date
from enum import Enum

from pydantic import BaseModel, Field, model_validator


class ZodiacMode(str, Enum):
    TROPICAL = "tropical"
    SIDEREAL = "sidereal"


class HouseSystem(str, Enum):
    PLACIDUS = "placidus"
    KOCH = "koch"
    WHOLE_SIGN = "whole_sign"


class LocationInput(BaseModel):
    query: str | None = Field(default=None, description="Text query, e.g. Sao Paulo, Brazil")
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    name: str | None = None
    timezone: str | None = None

    @model_validator(mode="after")
    def validate_source(self):
        has_query = bool(self.query and self.query.strip())
        has_coordinates = self.lat is not None and self.lng is not None
        if not has_query and not has_coordinates:
            raise ValueError("Provide location.query or both location.lat and location.lng")
        return self


class ChartRequest(BaseModel):
    date: date
    time: str = Field(..., examples=["14:30", "14:30:00"])
    location: LocationInput
    timezone: str | None = Field(default=None, description="Optional timezone override")
    zodiac_mode: ZodiacMode = ZodiacMode.TROPICAL
    house_system: HouseSystem = HouseSystem.PLACIDUS


class Coordinates(BaseModel):
    lat: float
    lng: float
    name: str | None = None


class NormalizedInput(BaseModel):
    local_datetime: str
    utc_datetime: str
    timezone: str
    coordinates: Coordinates
    zodiac_mode: ZodiacMode
    house_system: HouseSystem


class BodyPosition(BaseModel):
    name: str
    longitude: float
    latitude: float
    speed: float
    sign: str
    degree_in_sign: float
    retrograde: bool


class HousePosition(BaseModel):
    house: int
    longitude: float
    sign: str


class Aspect(BaseModel):
    body_a: str
    body_b: str
    aspect: str
    angle: float
    orb: float


class ChartData(BaseModel):
    normalized_input: NormalizedInput
    planets: list[BodyPosition]
    points: list[BodyPosition]
    asteroids: list[BodyPosition]
    ascendant: BodyPosition
    houses: list[HousePosition]
    aspects: list[Aspect]
