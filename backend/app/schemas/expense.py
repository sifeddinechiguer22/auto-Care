from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseBase(BaseModel):
    category: str = Field(..., min_length=2)
    description: str | None = None
    amount: float = Field(..., gt=0)
    expense_date: datetime | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpensePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    description: str | None
    amount: float
    expense_date: datetime
    created_at: datetime
    updated_at: datetime
