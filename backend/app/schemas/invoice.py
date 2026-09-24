from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.invoice import InvoiceStatus


class InvoiceBase(BaseModel):
    client_id: int
    vehicle_id: int
    repair_id: int | None = None
    subtotal: float = Field(default=0.0, ge=0)
    tax: float = Field(default=0.0, ge=0)
    total: float = Field(default=0.0, ge=0)
    paid_amount: float = Field(default=0.0, ge=0)
    remaining_amount: float = Field(default=0.0, ge=0)
    status: InvoiceStatus = InvoiceStatus.UNPAID
    issued_at: datetime | None = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoicePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    vehicle_id: int
    repair_id: int | None
    invoice_number: str
    subtotal: float
    tax: float
    total: float
    paid_amount: float
    remaining_amount: float
    status: InvoiceStatus
    issued_at: datetime
    created_at: datetime
