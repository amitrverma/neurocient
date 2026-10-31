import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    notifications_routes,
    nudge_routes,
    preferences_route,
    reflections_routes,
    spot_routes,
    webpush_routes,
    whatsapp_routes,
)
from app.config import settings
from app.utils.scheduler import start_scheduler, stop_scheduler
from app.middleware import CsrfProtectionMiddleware, MutationBodyLimitMiddleware

openai.api_key = settings.OPENAI_API_KEY

app = FastAPI()
app.add_middleware(MutationBodyLimitMiddleware)
app.add_middleware(CsrfProtectionMiddleware)


@app.get("/healthz", include_in_schema=False)
async def healthcheck():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.CSRF_TRUSTED_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    settings.validate_for_startup()
    if settings.ENABLE_SCHEDULER:
        start_scheduler()


@app.on_event("shutdown")
async def on_shutdown():
    if settings.ENABLE_SCHEDULER:
        stop_scheduler()


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
app.include_router(contact_routes.router, prefix="/api", tags=["contact"])
app.include_router(admin_data_routes.router, prefix="/api", tags=["admin"])
