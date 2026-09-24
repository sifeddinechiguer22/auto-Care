from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RepairStatus(str, Enum):
    PENDING = "PENDING"
    DIAGNOSIS = "DIAGNOSIS"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Repair(Base):
    __tablename__ = "repairs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.id"), nullable=False, unique=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    assigned_garagiste_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RepairStatus] = mapped_column(SAEnum(RepairStatus), default=RepairStatus.PENDING, nullable=False)
    labor_cost: Mapped[float] = mapped_column(default=0.0, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    appointment: Mapped["Appointment"] = relationship(back_populates="repair")
    vehicle: Mapped["Vehicle"] = relationship(back_populates="repairs")
    assigned_garagiste: Mapped["User | None"] = relationship(
        foreign_keys="Repair.assigned_garagiste_id",
        back_populates="assigned_repairs",
    )
    repair_services: Mapped[list["RepairService"]] = relationship(back_populates="repair", cascade="all, delete-orphan")
    repair_parts: Mapped[list["RepairPart"]] = relationship(back_populates="repair", cascade="all, delete-orphan")
    invoice: Mapped["Invoice | None"] = relationship(back_populates="repair", uselist=False)


class RepairService(Base):
    __tablename__ = "repair_services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    repair_id: Mapped[int] = mapped_column(ForeignKey("repairs.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(nullable=False)
    total_price: Mapped[float] = mapped_column(nullable=False)

    repair: Mapped[Repair] = relationship(back_populates="repair_services")
    service: Mapped["Service"] = relationship(back_populates="repair_services")
