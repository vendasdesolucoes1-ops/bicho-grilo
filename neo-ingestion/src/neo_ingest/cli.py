#!/usr/bin/env python3
"""CLI entrypoint: parse a CSV of historical draws, validate, and load into Supabase."""
from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

from neo_ingest.models import Draw
from neo_ingest.parsers.csv_parser import CSVParser
from neo_ingest.storage.supabase_client import SupabaseClient
from neo_ingest.validators.draw_validator import DrawValidator


def main() -> int:
    load_dotenv()

    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    csv_path = os.environ.get("CSV_FILE_PATH")

    missing = [
        name
        for name, value in (
            ("SUPABASE_URL", supabase_url),
            ("SUPABASE_SERVICE_ROLE_KEY", service_role_key),
            ("CSV_FILE_PATH", csv_path),
        )
        if not value
    ]
    if missing:
        print(f"❌ Missing required environment variable(s): {', '.join(missing)}")
        print("   Copy .env.example to .env and fill in the values.")
        return 1

    print(f"📄 Parsing {csv_path} ...")
    parser = CSVParser(csv_path)

    valid_draws: list[Draw] = []
    parse_errors: list[str] = []

    for draw, error in parser.parse():
        if error is not None:
            parse_errors.append(error)
            continue

        is_valid, validation_errors = DrawValidator.validate_all(draw)
        if is_valid:
            valid_draws.append(draw)
        else:
            parse_errors.extend(validation_errors)

    print(f"✅ {len(valid_draws)} valid draw(s), ❌ {len(parse_errors)} error(s)")
    for error in parse_errors:
        print(f"   - {error}")

    if not valid_draws:
        print("⚠️  No valid draws to import.")
        return 1

    print(f"🚀 Inserting {len(valid_draws)} draw(s) into Supabase ...")
    client = SupabaseClient(supabase_url, service_role_key)
    result = client.insert_draws(valid_draws)

    print("\n── Import summary ──────────────────────────")
    print(f"   Inserted: {result['inserted']}")
    print(f"   Failed:   {result['failed']}")
    if result["errors"]:
        print("   Errors:")
        for error in result["errors"]:
            print(f"     - {error}")

    return 0 if result["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
