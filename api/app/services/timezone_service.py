from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from timezonefinder import TimezoneFinder


class TimezoneResolutionError(Exception):
    pass


class TimezoneService:
    def __init__(self) -> None:
        self.finder = TimezoneFinder(in_memory=True)

    def resolve(self, lat: float, lng: float, explicit_timezone: str | None = None) -> str:
        if explicit_timezone:
            self._validate_timezone(explicit_timezone)
            return explicit_timezone

        timezone = self.finder.timezone_at(lat=lat, lng=lng)
        if not timezone:
            raise TimezoneResolutionError("Could not resolve timezone for coordinates")

        self._validate_timezone(timezone)
        return timezone

    @staticmethod
    def _validate_timezone(value: str) -> None:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise TimezoneResolutionError(f"Invalid timezone: {value}") from exc
