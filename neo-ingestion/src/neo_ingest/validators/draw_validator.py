"""Standalone validation helpers for Draw records (defense-in-depth alongside pydantic)."""
from __future__ import annotations

from datetime import date
from typing import Optional

from neo_ingest.models import MIN_DRAW_DATE, Draw

MIN_NUMBER = 0
MAX_NUMBER = 9999


class DrawValidator:
    @staticmethod
    def validate_date_range(draw_date: date) -> Optional[str]:
        if draw_date < MIN_DRAW_DATE or draw_date > date.today():
            return (
                f"draw_date {draw_date.isoformat()} is outside the allowed range "
                f"({MIN_DRAW_DATE.isoformat()} .. {date.today().isoformat()})"
            )
        return None

    @staticmethod
    def validate_number_range(full_number: str) -> Optional[str]:
        if not full_number.isdigit() or len(full_number) != 4:
            return f"full_number '{full_number}' must be a 4-digit numeric string"
        value = int(full_number)
        if value < MIN_NUMBER or value > MAX_NUMBER:
            return f"full_number {value} is outside the allowed range ({MIN_NUMBER:04d}..{MAX_NUMBER})"
        return None

    @staticmethod
    def validate_digits(draw: Draw) -> Optional[str]:
        expected = f"{draw.digit_1}{draw.digit_2}{draw.digit_3}{draw.digit_4}"
        if expected != draw.full_number:
            return f"digits {expected} do not match full_number {draw.full_number}"
        return None

    @classmethod
    def validate_all(cls, draw: Draw) -> tuple[bool, list[str]]:
        errors: list[str] = []
        for check in (
            cls.validate_date_range(draw.draw_date),
            cls.validate_number_range(draw.full_number),
            cls.validate_digits(draw),
        ):
            if check:
                errors.append(check)
        return (len(errors) == 0, errors)
