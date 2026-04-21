from collections import defaultdict, deque
from collections.abc import Callable
from datetime import datetime, timedelta, timezone

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class SimpleWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, deque[datetime]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(seconds=self.window_seconds)
        bucket = self._requests[key]

        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self.max_requests:
            return False

        bucket.append(now)
        return True


class IpRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: Callable,
        limiter: SimpleWindowLimiter,
        enabled_paths: set[str] | None = None,
    ) -> None:
        super().__init__(app)
        self.limiter = limiter
        self.enabled_paths = enabled_paths or {"/v1/chart"}

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.enabled_paths:
            client_ip = request.client.host if request.client else "unknown"
            if not self.limiter.allow(client_ip):
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": {
                            "code": "rate_limit_exceeded",
                            "message": "Rate limit exceeded. Try again in a minute.",
                        }
                    },
                )

        return await call_next(request)
