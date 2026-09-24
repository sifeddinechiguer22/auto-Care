from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin_or_garagiste
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientPublic, ClientUpdate

router = APIRouter(prefix="/api/clients", tags=["Clients"])


@router.get("", response_model=list[ClientPublic])
def list_clients(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Any:
    query = db.query(Client)
    if q:
        query = query.filter((Client.first_name.ilike(f"%{q}%")) | (Client.last_name.ilike(f"%{q}%")))
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=ClientPublic, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Client:
    client = Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/{client_id}", response_model=ClientPublic)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Client:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientPublic)
def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> Client:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_garagiste),
) -> None:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    db.delete(client)
    db.commit()
    return None
