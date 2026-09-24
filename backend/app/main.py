from __future__ import annotations

import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers.auth import router as auth_router
from app.routers.appointments import router as appointments_router
from app.routers.clients import router as clients_router
from app.routers.dashboard import router as dashboard_router
from app.routers.expenses import router as expenses_router
from app.routers.invoices import router as invoices_router
from app.routers.notifications import router as notifications_router
from app.routers.parts import router as parts_router
from app.routers.payments import router as payments_router
from app.routers.repairs import router as repairs_router
from app.routers.services import router as services_router
from app.routers.users import router as users_router
from app.routers.vehicles import router as vehicles_router
from app.services.seed import seed_admin_and_services

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AutoCare Garage management backend",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(clients_router)
app.include_router(vehicles_router)
app.include_router(appointments_router)
app.include_router(repairs_router)
app.include_router(services_router)
app.include_router(parts_router)
app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(expenses_router)
app.include_router(users_router)
app.include_router(notifications_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


def initialize_database() -> None:
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            with SessionLocal() as db:
                db.execute(text("SELECT 1"))
                seed_admin_and_services(db)
            return
        except Exception:
            if attempt == 29:
                raise
            time.sleep(2)


@app.on_event("startup")
def startup_event() -> None:
    initialize_database()
