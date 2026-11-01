import openai
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.Routes import (
    admin_data_routes,
    article_routes,
    auth_routes,
    caveman_scan_routes,
    challenge_routes,
    cohort_routes,
    contact_routes,
    ikea_routes,
    newsletter_routes,
    membership_cancellation_routes,
    membership_routes,
    notifications_routes,
    nudge_routes,
    preferences_route,
    reflections_routes,
    spot_routes,
    webpush_routes,
    whatsapp_routes,
)
from app.config import settings
from app.middleware import (
    CorrelationMiddleware,
    CsrfProtectionMiddleware,
    MutationBodyLimitMiddleware,
)
from app.observability import (
    configure_logging,
    current_correlation_id,
    log_event,
    safe_exception_fields,
)
from app.services.operational_health import readiness_snapshot

openai.api_key = settings.OPENAI_API_KEY
configure_logging()
logger = logging.getLogger("api")

app = FastAPI()
app.add_middleware(MutationBodyLimitMiddleware)
app.add_middleware(CsrfProtectionMiddleware)


@app.exception_handler(Exception)
async def unexpected_exception_handler(_: Request, error: Exception):
    log_event(
        logger,
        "api_unexpected_error",
        level=logging.ERROR,
        component="fastapi",
        operation="request_handler",
        outcome="failure",
        **safe_exception_fields(error),
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "code": "internal_error",
                "correlation_id": current_correlation_id.get(),
            }
        },
        headers={"Cache-Control": "no-store"},
    )


@app.get("/healthz", include_in_schema=False)
async def healthcheck():
    return {"status": "ok"}


@app.get("/readyz", include_in_schema=False)
async def readinesscheck():
    ready, payload = await readiness_snapshot()
    return JSONResponse(
        status_code=200 if ready else 503,
        content=payload,
        headers={"Cache-Control": "no-store"},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.CSRF_TRUSTED_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationMiddleware)


@app.on_event("startup")
async def on_startup():
    settings.validate_for_startup()


app.include_router(webpush_routes.router, prefix="/api")
app.include_router(notifications_routes.router, prefix="/api")
app.include_router(ikea_routes.router, prefix="/api", tags=["ikea"])
app.include_router(reflections_routes.router, prefix="/api", tags=["reflections"])
app.include_router(whatsapp_routes.router, prefix="/wa", tags=["whatsapp"])
app.include_router(newsletter_routes.router, prefix="/api", tags=["newsletter"])
app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(article_routes.router, prefix="/articles", tags=["saved"])
app.include_router(challenge_routes.router, prefix="/challenges", tags=["microchallenge"])
app.include_router(spot_routes.router, prefix="/api", tags=["spots"])
app.include_router(nudge_routes.router, prefix="/api", tags=["nudges"])
app.include_router(preferences_route.router, prefix="/user", tags=["preferences"])
app.include_router(caveman_scan_routes.router, prefix="/api", tags=["caveman-scan"])
app.include_router(cohort_routes.router, prefix="/api", tags=["cohorts"])
app.include_router(
    membership_cancellation_routes.router,
    prefix="/api",
    tags=["membership"],
)
app.include_router(membership_routes.router, prefix="/api", tags=["membership"])
app.include_router(contact_routes.router, prefix="/api", tags=["contact"])
app.include_router(admin_data_routes.router, prefix="/api", tags=["admin"])
