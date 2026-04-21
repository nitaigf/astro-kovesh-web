from datetime import timezone
from zoneinfo import ZoneInfo

from app.schemas.chart import ChartRequest
from app.services.astrology import AstrologyEngineUnavailableError, AstrologyService
from app.services.geocoding import GeocodingError, GeocodingRateLimitError, GeocodingService
from app.services.timezone_service import TimezoneResolutionError, TimezoneService
from app.utils.datetime_utils import combine_date_time


class ChartServiceError(Exception):
    pass


class ChartService:
    def __init__(self) -> None:
        self.geocoding = GeocodingService()
        self.timezones = TimezoneService()
        self.astrology = AstrologyService()

    def build_chart(self, payload: ChartRequest) -> dict:
        try:
            local_naive_dt = combine_date_time(payload.date, payload.time)
        except ValueError as exc:
            raise ChartServiceError(str(exc)) from exc

        location = payload.location

        try:
            if location.lat is not None and location.lng is not None:
                lat = location.lat
                lng = location.lng
                location_name = location.name or "Custom coordinates"
            else:
                geocoded = self.geocoding.geocode(location.query or "")
                lat = geocoded.lat
                lng = geocoded.lng
                location_name = location.name or geocoded.display_name

            timezone_name = self.timezones.resolve(
                lat=lat,
                lng=lng,
                explicit_timezone=payload.timezone or location.timezone,
            )
        except GeocodingRateLimitError as exc:
            raise ChartServiceError(f"geocoding_quota_exceeded: {exc}") from exc
        except GeocodingError as exc:
            raise ChartServiceError(f"geocoding_failed: {exc}") from exc
        except TimezoneResolutionError as exc:
            raise ChartServiceError(f"timezone_resolution_failed: {exc}") from exc
        except Exception as exc:
            raise ChartServiceError(f"external_service_failed: {exc}") from exc

        local_aware_dt = local_naive_dt.replace(tzinfo=ZoneInfo(timezone_name))
        utc_dt = local_aware_dt.astimezone(timezone.utc)

        try:
            astro = self.astrology.calculate(
                utc_dt=utc_dt,
                lat=lat,
                lng=lng,
                zodiac_mode=payload.zodiac_mode.value,
                house_system=payload.house_system.value,
            )
        except AstrologyEngineUnavailableError as exc:
            raise ChartServiceError(f"astrology_engine_unavailable: {exc}") from exc

        return {
            "normalized_input": {
                "local_datetime": local_aware_dt.isoformat(),
                "utc_datetime": utc_dt.isoformat(),
                "timezone": timezone_name,
                "coordinates": {
                    "lat": round(lat, 6),
                    "lng": round(lng, 6),
                    "name": location_name,
                },
                "zodiac_mode": payload.zodiac_mode,
                "house_system": payload.house_system,
            },
            "planets": astro["planets"],
            "points": astro["points"],
            "asteroids": astro["asteroids"],
            "ascendant": astro["ascendant"],
            "houses": astro["houses"],
            "aspects": astro["aspects"],
        }
