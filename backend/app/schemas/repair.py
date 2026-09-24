from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.repair import RepairStatus


class RepairBase(BaseModel):
    appointment_id: int
    vehicle_id: int
    assigned_garagiste_id: int | None = None
    diagnosis: str | None = None
    description: str | None = None
    status: RepairStatus = RepairStatus.PENDING
    labor_cost: float = Field(default=0.0, ge=0)


class RepairCreate(RepairBase):
    pass


class RepairUpdate(BaseModel):
    appointment_id: int | None = None
    vehicle_id: int | None = None
    assigned_garagiste_id: int | None = None
    diagnosis: str | None = None
    description: str | None = None
    status: RepairStatus | None = None
    labor_cost: float | None = Field(default=None, ge=0)


class RepairPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    appointment_id: int
    vehicle_id: int
    assigned_garagiste_id: int | None
    diagnosis: str | None
    description: str | None
    status: RepairStatus
    labor_cost: float
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
