from fastapi import Depends, FastAPI, Header, HTTPException

from .astro import calculate_natal_chart, configure_ephemeris
from .models import NatalChartRequest

import os

app = FastAPI(title="Mirror AI Astrology Service", version="0.1.0")


def require_service_token(authorization: str | None = Header(default=None)) -> None:
    expected_token = os.getenv("MIRROR_ASTROLOGY_SERVICE_TOKEN")
    if not expected_token:
        return
    if authorization != f"Bearer {expected_token}":
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "mirror-ai-astrology",
        "ephemeris_path": configure_ephemeris(),
    }


@app.post("/natal-chart", dependencies=[Depends(require_service_token)])
def natal_chart(request: NatalChartRequest) -> dict:
    try:
        return calculate_natal_chart(request)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

