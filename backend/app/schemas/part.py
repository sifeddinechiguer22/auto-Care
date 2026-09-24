from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PartBase(BaseModel):
    name: str = Field(..., min_length=2)
    reference: str = Field(..., min_length=2)
    description: str | None = None
    quantity_in_stock: int = Field(default=0, ge=0)
    minimum_stock: int = Field(default=0, ge=0)
    purchase_price: float = Field(default=0.0, ge=0)
    selling_price: float = Field(default=0.0, ge=0)


class PartCreate(PartBase):
    pass


class PartUpdate(BaseModel):
    name: str | None = None
    reference: str | None = None
    description: str | None = None
    quantity_in_stock: int | None = Field(default=None, ge=0)
    minimum_stock: int | None = Field(default=None, ge=0)
    purchase_price: float | None = Field(default=None, ge=0)
    selling_price: float | None = Field(default=None, ge=0)


class PartPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    reference: str
    description: str | None
    quantity_in_stock: int
    minimum_stock: int
    purchase_price: float
    selling_price: float
    created_at: datetime
    updated_at: datetime
