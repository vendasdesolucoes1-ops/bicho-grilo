from __future__ import annotations

from datetime import date

import pytest

from neo_ingest.models import Draw
from neo_ingest.validators.draw_validator import DrawValidator


@pytest.fixture
def valid_draw():
    return Draw.from_full_number(
        state_id=24,
        lottery_id=1,
        draw_date=date(2024, 1, 5),
        full_number="1234",
    )


def test_valid_draw(valid_draw):
    is_valid, errors = DrawValidator.validate_all(valid_draw)

    assert is_valid is True
    assert errors == []


def test_invalid_date_too_old(valid_draw):
    too_old = valid_draw.model_copy(update={"draw_date": date(1800, 1, 1)})

    is_valid, errors = DrawValidator.validate_all(too_old)

    assert is_valid is False
    assert any("draw_date" in e for e in errors)


def test_invalid_number_range(valid_draw):
    out_of_range = valid_draw.model_copy(update={"full_number": "99999"})

    is_valid, errors = DrawValidator.validate_all(out_of_range)

    assert is_valid is False
    assert any("full_number" in e for e in errors)
