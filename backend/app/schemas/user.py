from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.user import UserRole


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    phone: str | None = None
    role: UserRole = UserRole.GARAGISTE

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.count("@") != 1:
            raise ValueError("Enter a valid email address")
        local_part, domain = normalized.split("@", 1)
        if not local_part or not domain:
            raise ValueError("Enter a valid email address")
        if "." not in domain and not domain.endswith(".local"):
            raise ValueError("Enter a valid email address")
        return normalized


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.count("@") != 1:
            raise ValueError("Enter a valid email address")
        local_part, domain = normalized.split("@", 1)
        if not local_part or not domain:
            raise ValueError("Enter a valid email address")
        if "." not in domain and not domain.endswith(".local"):
            raise ValueError("Enter a valid email address")
        return normalized


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
