from __future__ import annotations

import pytest

from neo_ingest.parsers.csv_parser import CSVParser

VALID_CSV = """state,lottery,date,number
SP,milhar,2024-01-05,1234
RJ,duque,2024-02-10,5678
MG,terno,2024-03-15,0042
"""


@pytest.fixture
def sample_csv(tmp_path):
    path = tmp_path / "draws.csv"
    path.write_text(VALID_CSV, encoding="utf-8")
    return str(path)


def _collect(parser):
    draws = []
    errors = []
    for draw, error in parser.parse():
        if error is not None:
            errors.append(error)
        else:
            draws.append(draw)
    return draws, errors


def test_csv_parser_success(sample_csv):
    draws, errors = _collect(CSVParser(sample_csv))

    assert len(draws) == 3
    assert errors == []
    assert draws[0].full_number == "1234"
    assert draws[0].state_id == 24  # SP
    assert draws[0].lottery_id == 1  # milhar


def test_csv_parser_invalid_state(tmp_path):
    csv_text = "state,lottery,date,number\nXX,milhar,2024-01-05,1234\n"
    path = tmp_path / "invalid_state.csv"
    path.write_text(csv_text, encoding="utf-8")

    draws, errors = _collect(CSVParser(str(path)))

    assert len(draws) == 0
    assert len(errors) == 1
    assert "unknown state code 'XX'" in errors[0]


def test_csv_parser_invalid_date(tmp_path):
    csv_text = "state,lottery,date,number\nSP,milhar,1899-01-01,1234\n"
    path = tmp_path / "invalid_date.csv"
    path.write_text(csv_text, encoding="utf-8")

    draws, errors = _collect(CSVParser(str(path)))

    assert len(draws) == 0
    assert len(errors) == 1
