from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentPublic, AppointmentUpdate

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.get("", response_model=list[AppointmentPublic])
def list_appointments(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Appointment)
    if q:
        query = query.filter(Appointment.description.ilike(f"%{q}%"))
    return query.order_by(Appointment.appointment_date.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=AppointmentPublic, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Appointment:
    data = payload.model_dump(exclude={"date", "time_slot", "reason", "notes"}, exclude_none=True)
    if payload.reason and "description" not in data:
        data["description"] = payload.reason
    if payload.appointment_date is not None:
        data["appointment_date"] = payload.appointment_date
    appointment = Appointment(**data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/{appointment_id}", response_model=AppointmentPublic)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Appointment:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentPublic)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Appointment:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    updates = payload.model_dump(exclude={"date", "time_slot", "reason", "notes"}, exclude_unset=True, exclude_none=True)
    if payload.reason is not None:
        updates["description"] = payload.reason
    if payload.appointment_date is not None:
        updates["appointment_date"] = payload.appointment_date
    for field, value in updates.items():
        setattr(appointment, field, value)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> None:
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
    return None
