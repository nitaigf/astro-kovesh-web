from datetime import date, datetime, time


def parse_time_string(value: str) -> time:
    formats = ["%H:%M", "%H:%M:%S"]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).time()
        except ValueError:
            continue
    raise ValueError("Time must be in HH:mm or HH:mm:ss format")


def combine_date_time(value_date: date, value_time: str) -> datetime:
    parsed_time = parse_time_string(value_time)
    return datetime.combine(value_date, parsed_time)
