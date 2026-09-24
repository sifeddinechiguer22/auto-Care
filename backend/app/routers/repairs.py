from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.repair import Repair
from app.schemas.repair import RepairCreate, RepairPublic, RepairUpdate

router = APIRouter(prefix="/api/repairs", tags=["Repairs"])


@router.get("", response_model=list[RepairPublic])
def list_repairs(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Repair)
    if q:
        query = query.filter(Repair.diagnosis.ilike(f"%{q}%"))
    return query.order_by(Repair.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=RepairPublic, status_code=status.HTTP_201_CREATED)
def create_repair(
    payload: RepairCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Repair:
    repair = Repair(**payload.model_dump())
    db.add(repair)
    db.commit()
    db.refresh(repair)
    return repair


@router.get("/{repair_id}", response_model=RepairPublic)
def get_repair(
    repair_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Repair:
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repair not found")
    return repair


@router.put("/{repair_id}", response_model=RepairPublic)
def update_repair(
    repair_id: int,
    payload: RepairUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Repair:
    repair = db.query(Repair).filter(Repair.id == repair_id).first()
    if not repair:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repair not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(repair, field, value)
    db.commit()
    db.refresh(repair)
    return repair
