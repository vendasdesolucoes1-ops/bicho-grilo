"""Pydantic models for the ingestion pipeline."""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator, model_validator

MIN_DRAW_DATE = date(1900, 1, 1)


class State(BaseModel):
    id: int
    code: str
    name: str


class Lottery(BaseModel):
    id: int
    name: str
    num_digits: int
    max_value: int


class Draw(BaseModel):
    state_id: int
    lottery_id: int
    draw_date: date
    full_number: str
    digit_1: int
    digit_2: int
    digit_3: int
    digit_4: int
    source_url: Optional[str] = None

    @field_validator("full_number")
    @classmethod
    def validate_full_number_format(cls, value: str) -> str:
        if not value.isdigit() or len(value) != 4:
            raise ValueError(f"full_number must be a 4-digit numeric string, got '{value}'")
        return value

    @field_validator("draw_date")
    @classmethod
    def validate_date_range(cls, value: date) -> date:
        if value < MIN_DRAW_DATE or value > date.today():
            raise ValueError(
                f"draw_date must be between {MIN_DRAW_DATE.isoformat()} and today, got {value.isoformat()}"
            )
        return value

    @model_validator(mode="after")
    def validate_digits_match_full_number(self) -> "Draw":
        expected = f"{self.digit_1}{self.digit_2}{self.digit_3}{self.digit_4}"
        if expected != self.full_number:
            raise ValueError(
                f"digit_1..digit_4 ({expected}) do not match full_number ({self.full_number})"
            )
        return self

    @classmethod
    def from_full_number(
        cls,
        *,
        state_id: int,
        lottery_id: int,
        draw_date: date,
        full_number: str,
        source_url: Optional[str] = None,
    ) -> "Draw":
        """Build a Draw deriving digit_1..digit_4 from the full_number string."""
        digits = [int(c) for c in full_number]
        return cls(
            state_id=state_id,
            lottery_id=lottery_id,
            draw_date=draw_date,
            full_number=full_number,
            digit_1=digits[0],
            digit_2=digits[1],
            digit_3=digits[2],
            digit_4=digits[3],
            source_url=source_url,
        )


class ImportLog(BaseModel):
    status: str
    inserted: int = 0
    failed: int = 0
    errors: list[str] = []
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
