"""CSV parser that converts raw rows into validated Draw models."""
from __future__ import annotations

import csv
import io
from datetime import datetime
from typing import Iterator, Optional

from neo_ingest.models import Draw

# Maps recognized in CSV "state" column → neo.states.id (see migrations/001_create_schema.sql)
STATE_CODE_MAP: dict[str, int] = {
    "SP": 24,
    "RJ": 33,
    "MG": 31,
    "BA": 29,
    "RS": 43,
    "PR": 41,
    "GO": 52,
    "ES": 32,
    "DF": 53,
}

# Maps recognized in CSV "lottery" column → neo.lotteries.id
LOTTERY_NAME_MAP: dict[str, int] = {
    "milhar": 1,
    "duque": 2,
    "terno": 3,
    "quadra": 4,
}

REQUIRED_COLUMNS = {"state", "lottery", "date", "number"}

DATE_FORMATS = ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y")

ParsedRow = tuple[Optional[Draw], Optional[str]]


class CSVParser:
    """Parses a lottery draw CSV file into `Draw` models, tolerating common format quirks."""

    def __init__(self, file_path: str):
        self.file_path = file_path

    def _read_text(self) -> str:
        """Read the file, falling back from UTF-8 to Latin-1 on decode errors."""
        with open(self.file_path, "rb") as f:
            raw = f.read()
        try:
            return raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            return raw.decode("latin-1")

    @staticmethod
    def _detect_dialect(sample: str) -> csv.Dialect:
        try:
            return csv.Sniffer().sniff(sample, delimiters=",;\t|")
        except csv.Error:
            return csv.excel  # default: comma-delimited

    @staticmethod
    def _parse_date(raw_value: str) -> Optional[datetime]:
        raw_value = raw_value.strip()
        for fmt in DATE_FORMATS:
            try:
                return datetime.strptime(raw_value, fmt)
            except ValueError:
                continue
        return None

    def parse(self) -> Iterator[ParsedRow]:
        """Yield (Draw, None) for valid rows or (None, error_message) for invalid ones."""
        text = self._read_text()
        dialect = self._detect_dialect(text[:4096])
        reader = csv.DictReader(io.StringIO(text), dialect=dialect)

        if reader.fieldnames is None:
            yield None, "CSV file has no header row"
            return

        normalized_fields = {name.strip().lower() for name in reader.fieldnames}
        missing = REQUIRED_COLUMNS - normalized_fields
        if missing:
            yield None, f"CSV is missing required columns: {sorted(missing)}"
            return

        for line_num, row in enumerate(reader, start=2):
            normalized_row = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}
            yield self._parse_row(normalized_row, line_num)

    def _parse_row(self, row: dict[str, str], line_num: int) -> ParsedRow:
        state_code = row["state"].upper()
        lottery_name = row["lottery"].lower()
        raw_date = row["date"]
        number = row["number"]
        source_url = row.get("source_url") or None

        state_id = STATE_CODE_MAP.get(state_code)
        if state_id is None:
            return None, f"Line {line_num}: unknown state code '{state_code}'"

        lottery_id = LOTTERY_NAME_MAP.get(lottery_name)
        if lottery_id is None:
            return None, f"Line {line_num}: unknown lottery '{lottery_name}'"

        parsed_date = self._parse_date(raw_date)
        if parsed_date is None:
            return None, f"Line {line_num}: unrecognized date format '{raw_date}'"

        number = number.zfill(4)
        if not number.isdigit() or len(number) != 4:
            return None, f"Line {line_num}: invalid number '{row['number']}'"

        try:
            draw = Draw.from_full_number(
                state_id=state_id,
                lottery_id=lottery_id,
                draw_date=parsed_date.date(),
                full_number=number,
                source_url=source_url,
            )
        except Exception as exc:  # pydantic ValidationError or value errors
            return None, f"Line {line_num}: {exc}"

        return draw, None
