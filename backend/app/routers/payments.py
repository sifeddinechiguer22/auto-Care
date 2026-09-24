from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentPublic

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.get("", response_model=list[PaymentPublic])
def list_payments(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Payment)
    if q:
        query = query.filter(Payment.notes.ilike(f"%{q}%"))
    return query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=PaymentPublic, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Payment:
    invoice = db.query(Invoice).filter(Invoice.id == payload.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    payment = Payment(**payload.model_dump())
    db.add(payment)

    payment_amount = Decimal(str(payment.amount))
    invoice.paid_amount = Decimal(str(invoice.paid_amount)) + payment_amount
    invoice.remaining_amount = max(Decimal(str(invoice.total)) - invoice.paid_amount, Decimal("0"))
    if invoice.paid_amount >= Decimal(str(invoice.total)):
        invoice.status = "PAID"
    elif invoice.paid_amount > 0:
        invoice.status = "PARTIALLY_PAID"

    db.commit()
    db.refresh(payment)
    return payment
