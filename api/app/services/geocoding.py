from dataclasses import dataclass

from geopy.exc import GeocoderServiceError, GeocoderTimedOut, GeocoderUnavailable
from geopy.extra.rate_limiter import RateLimiter
from geopy.geocoders import Nominatim

from app.core.config import get_settings
from app.core.rate_limit import SimpleWindowLimiter


class GeocodingError(Exception):
    pass


class GeocodingRateLimitError(GeocodingError):
    pass


@dataclass
class GeocodedLocation:
    lat: float
    lng: float
    display_name: str


class GeocodingService:
    def __init__(self) -> None:
        settings = get_settings()
        self.client = Nominatim(user_agent=settings.geocoder_user_agent, timeout=settings.request_timeout_seconds)
        self.rate_limited_geocode = RateLimiter(
            self.client.geocode,
            min_delay_seconds=settings.geocoder_min_seconds_between_calls,
            max_retries=0,
            swallow_exceptions=False,
        )
        self.limiter = SimpleWindowLimiter(max_requests=settings.geocoder_calls_per_minute, window_seconds=60)

    def geocode(self, query: str) -> GeocodedLocation:
        if not self.limiter.allow("geocode_process"):
            raise GeocodingRateLimitError("Internal geocoding quota exceeded. Try again later.")

        try:
            result = self.rate_limited_geocode(query, addressdetails=False)
        except (GeocoderTimedOut, GeocoderUnavailable, GeocoderServiceError) as exc:
            raise GeocodingError("Geocoding provider unavailable") from exc

        if not result:
            raise GeocodingError("Location not found")

        return GeocodedLocation(
            lat=float(result.latitude),
            lng=float(result.longitude),
            display_name=str(result.address),
        )
