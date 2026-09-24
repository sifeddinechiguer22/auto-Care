from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceCreate, InvoicePublic

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.get("", response_model=list[InvoicePublic])
def list_invoices(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Invoice)
    if q:
        query = query.filter(Invoice.invoice_number.ilike(f"%{q}%"))
    return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=InvoicePublic, status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Invoice:
    invoice = Invoice(
        **payload.model_dump(exclude={"issued_at"}),
        invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{payload.client_id}",
        issued_at=payload.issued_at or datetime.utcnow(),
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/{invoice_id}", response_model=InvoicePublic)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Invoice:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice
