from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.security import get_password_hash
from app.database import get_db
from app.dependencies.auth import require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserPublic, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=list[UserPublic])
def list_users(
    q: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    query = db.query(User)
    if q:
        query = query.filter((User.first_name.ilike(f"%{q}%")) | (User.last_name.ilike(f"%{q}%")))
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> User:
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists")
    user = User(
        **payload.model_dump(exclude={"password"}),
        email=payload.email.lower(),
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserPublic)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if payload.email and payload.email.lower() != user.email:
        if db.query(User).filter(User.email == payload.email.lower()).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User email already exists")
    for field, value in payload.model_dump(exclude_unset=True, exclude={"password"}).items():
        setattr(user, field, value)
    if payload.password:
        user.password_hash = get_password_hash(payload.password)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return None
