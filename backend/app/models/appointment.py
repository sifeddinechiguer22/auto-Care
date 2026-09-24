from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AppointmentStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    assigned_garagiste_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    appointment_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[AppointmentStatus] = mapped_column(SAEnum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    @property
    def date(self) -> str:
        return self.appointment_date.date().isoformat()

    @property
    def time_slot(self) -> str:
        return "09:00 - 10:00"

    @property
    def reason(self) -> str:
        return self.description or ""

    @property
    def notes(self) -> str:
        return ""

    client: Mapped["Client"] = relationship(back_populates="appointments")
    vehicle: Mapped["Vehicle"] = relationship(back_populates="appointments")
    assigned_garagiste: Mapped["User | None"] = relationship(
        foreign_keys="Appointment.assigned_garagiste_id",
        back_populates="assigned_appointments",
    )
    repair: Mapped["Repair | None"] = relationship(back_populates="appointment", uselist=False)
