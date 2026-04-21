from fastapi import APIRouter, HTTPException, status

from app.schemas.chart import ChartData, ChartRequest
from app.services.chart_service import ChartService, ChartServiceError

router = APIRouter(prefix="/v1", tags=["chart"])
service = ChartService()


@router.post("/chart", response_model=ChartData)
def create_chart(payload: ChartRequest) -> ChartData:
    try:
        result = service.build_chart(payload)
    except ChartServiceError as exc:
        message = str(exc)
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        if message.startswith("geocoding_quota_exceeded"):
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        elif message.startswith("geocoding_failed"):
            status_code = status.HTTP_404_NOT_FOUND
        elif message.startswith("timezone_resolution_failed"):
            status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        elif message.startswith("astrology_engine_unavailable"):
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE

        raise HTTPException(
            status_code=status_code,
            detail={
                "code": "chart_request_error",
                "message": message,
            },
        ) from exc

    return ChartData.model_validate(result)
