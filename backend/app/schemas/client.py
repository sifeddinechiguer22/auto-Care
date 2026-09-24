from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ClientBase(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone: str | None = None
    email: str | None = None

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


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    email: str | None = None


class ClientPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    phone: str | None
    email: str | None
    created_at: datetime
    updated_at: datetime
