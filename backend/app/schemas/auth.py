from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuthLogin(BaseModel):
    email: str = Field(..., min_length=3)
    password: str

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


class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    token_type: str = "bearer"
    user: dict
    role: str
