from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    client_id: int
    vehicle_id: int
    assigned_garagiste_id: int | None = None
    appointment_date: datetime | None = None
    date: str | None = None
    time_slot: str | None = None
    reason: str | None = None
    description: str | None = None
    status: AppointmentStatus = AppointmentStatus.PENDING
    notes: str | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_payload(cls, values):
        if not isinstance(values, dict):
            return values

        data = dict(values)

        if data.get("appointment_date") is None and data.get("date") is not None:
            raw_date = data["date"]
            if isinstance(raw_date, str):
                raw_date = raw_date.split("T")[0]
                data["appointment_date"] = datetime.fromisoformat(f"{raw_date}T00:00:00")
            else:
                data["appointment_date"] = raw_date

        if data.get("description") is None and data.get("reason") is not None:
            data["description"] = data["reason"]

        if data.get("reason") is None and data.get("description") is not None:
            data["reason"] = data["description"]

        if data.get("time_slot") is None:
            data["time_slot"] = "09:00 - 10:00"

        return data


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    client_id: int | None = None
    vehicle_id: int | None = None
    assigned_garagiste_id: int | None = None
    appointment_date: datetime | None = None
    date: str | None = None
    time_slot: str | None = None
    reason: str | None = None
    description: str | None = None
    status: AppointmentStatus | None = None
    notes: str | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_payload(cls, values):
        if not isinstance(values, dict):
            return values

        data = dict(values)

        if data.get("appointment_date") is None and data.get("date") is not None:
            raw_date = data["date"]
            if isinstance(raw_date, str):
                raw_date = raw_date.split("T")[0]
                data["appointment_date"] = datetime.fromisoformat(f"{raw_date}T00:00:00")
            else:
                data["appointment_date"] = raw_date

        if data.get("description") is None and data.get("reason") is not None:
            data["description"] = data["reason"]

        if data.get("reason") is None and data.get("description") is not None:
            data["reason"] = data["description"]

        return data


class AppointmentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    client_id: int
    vehicle_id: int
    assigned_garagiste_id: int | None
    appointment_date: datetime
    date: str = Field(default="")
    time_slot: str = "09:00 - 10:00"
    reason: str = ""
    notes: str | None = None
    description: str | None = None
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime
