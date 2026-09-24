from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServicePublic, ServiceUpdate

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.get("", response_model=list[ServicePublic])
def list_services(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Service)
    if q:
        query = query.filter(Service.name.ilike(f"%{q}%"))
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=ServicePublic, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Service:
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServicePublic)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Service:
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> None:
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    db.delete(service)
    db.commit()
    return None
