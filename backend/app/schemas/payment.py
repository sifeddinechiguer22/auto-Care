from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.payment import PaymentMethod


class PaymentBase(BaseModel):
    invoice_id: int
    amount: float = Field(..., gt=0)
    payment_method: PaymentMethod
    payment_date: datetime | None = None
    notes: str | None = None


class PaymentCreate(PaymentBase):
    pass


class PaymentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_id: int
    amount: float
    payment_method: PaymentMethod
    payment_date: datetime
    notes: str | None
    created_at: datetime
