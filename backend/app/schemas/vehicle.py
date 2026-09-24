from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VehicleBase(BaseModel):
    client_id: int
    brand: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    year: int = Field(..., ge=1900, le=2100)
    mileage: int = Field(default=0, ge=0)
    fuel_type: str = Field(..., min_length=2)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    client_id: int | None = None
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    mileage: int | None = None
    fuel_type: str | None = None


class VehiclePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    brand: str
    model: str
    year: int
    mileage: int
    fuel_type: str
    created_at: datetime
    updated_at: datetime
