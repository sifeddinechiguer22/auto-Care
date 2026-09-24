from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.appointment import Appointment
from app.models.client import Client
from app.models.expense import Expense
from app.models.invoice import Invoice
from app.models.part import Part
from app.models.payment import Payment
from app.models.repair import Repair
from app.models.vehicle import Vehicle

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> dict:
    today = datetime.utcnow().date()
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    recent_appointments = db.query(Appointment).order_by(Appointment.created_at.desc()).limit(5).all()
    recent_payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(5).all()

    stats = {
        "total_clients": db.query(Client).count(),
        "total_vehicles": db.query(Vehicle).count(),
        "today_appointments": db.query(Appointment).filter(func.date(Appointment.appointment_date) == today).count(),
        "repairs_in_progress": db.query(Repair).filter(Repair.status.in_(["IN_PROGRESS", "DIAGNOSIS"])) .count(),
        "unpaid_invoices_count": db.query(Invoice).filter(Invoice.status != "PAID").count(),
        "unpaid_invoices_amount": float(db.query(func.coalesce(func.sum(Invoice.remaining_amount), 0)).scalar() or 0),
        "monthly_revenue": float(db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.payment_date >= month_start).scalar() or 0),
        "monthly_expenses": float(db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.expense_date >= month_start).scalar() or 0),
        "monthly_net_profit": 0.0,
        "low_stock_parts_count": db.query(Part).filter(Part.quantity_in_stock <= Part.minimum_stock).count(),
        "active_repairs_count": db.query(Repair).filter(Repair.status.in_(["IN_PROGRESS", "DIAGNOSIS"])).count(),
        "recent_appointments": [
            {
                "id": item.id,
                "date": item.date,
                "time_slot": item.time_slot,
                "reason": item.reason,
                "status": item.status.value if hasattr(item.status, "value") else item.status,
                "client_id": item.client_id,
                "vehicle_id": item.vehicle_id,
                "created_at": item.created_at.isoformat(),
            }
            for item in recent_appointments
        ],
        "recent_payments": [
            {
                "id": item.id,
                "amount": float(item.amount),
                "payment_method": item.payment_method.value if hasattr(item.payment_method, "value") else item.payment_method,
                "date": item.payment_date.isoformat(),
                "invoice_id": item.invoice_id,
                "notes": item.notes,
            }
            for item in recent_payments
        ],
    }
    stats["monthly_net_profit"] = round(stats["monthly_revenue"] - stats["monthly_expenses"], 2)
    return stats
