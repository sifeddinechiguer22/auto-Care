from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.part import Part
from app.schemas.part import PartCreate, PartPublic, PartUpdate

router = APIRouter(prefix="/api/parts", tags=["Parts"])


@router.get("", response_model=list[PartPublic])
def list_parts(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Part)
    if q:
        query = query.filter((Part.name.ilike(f"%{q}%")) | (Part.reference.ilike(f"%{q}%")))
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=PartPublic, status_code=status.HTTP_201_CREATED)
def create_part(
    payload: PartCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Part:
    part = Part(**payload.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.put("/{part_id}", response_model=PartPublic)
def update_part(
    part_id: int,
    payload: PartUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Part:
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(part, field, value)
    db.commit()
    db.refresh(part)
    return part


@router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_part(
    part_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> None:
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")
    db.delete(part)
    db.commit()
    return None
