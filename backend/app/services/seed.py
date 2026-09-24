from __future__ import annotations

from sqlalchemy.orm import Session

from app.auth.security import get_password_hash
from app.models.user import User, UserRole
from app.models.service import Service


def seed_admin_and_services(db: Session) -> None:
    existing_admin = db.query(User).filter(User.email == "admin@autocare.local").first()
    if not existing_admin:
        admin = User(
            first_name="Admin",
            last_name="Garage",
            email="admin@autocare.local",
            phone="+212600000000",
            password_hash=get_password_hash("Admin123!"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)

    if db.query(Service).count() == 0:
        default_services = [
            Service(name="Oil Change", description="Engine oil replacement", price=120.0, is_active=True),
            Service(name="Brake Inspection", description="Brake system inspection", price=80.0, is_active=True),
            Service(name="Diagnostic", description="Vehicle diagnostic scan", price=150.0, is_active=True),
        ]
        db.add_all(default_services)

    db.commit()
