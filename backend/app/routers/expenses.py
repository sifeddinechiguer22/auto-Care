from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpensePublic

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=list[ExpensePublic])
def list_expenses(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Expense)
    if q:
        query = query.filter(Expense.description.ilike(f"%{q}%"))
    return query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=ExpensePublic, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Expense:
    expense = Expense(**payload.model_dump(exclude={"expense_date"}), expense_date=payload.expense_date or __import__("datetime").datetime.utcnow())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
