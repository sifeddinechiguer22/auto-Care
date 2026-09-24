from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehiclePublic, VehicleUpdate

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=list[VehiclePublic])
def list_vehicles(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
):
    query = db.query(Vehicle)
    if q:
        query = query.filter(
            (Vehicle.registration_number.ilike(f"%{q}%"))
            | (Vehicle.brand.ilike(f"%{q}%"))
            | (Vehicle.model.ilike(f"%{q}%"))
        )
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=VehiclePublic, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Vehicle:
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehiclePublic)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehiclePublic)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> None:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return None
