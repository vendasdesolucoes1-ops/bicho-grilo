# NEO Quant Lab Ingestion

CSV → Supabase ingestion pipeline for historical lottery draw records that feed
the NEO Quant Lab statistical audits.

## Install

```bash
pip install -e .
# or, including test dependencies
pip install -e ".[dev]"
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase project values:

   ```bash
   cp .env.example .env
   ```

   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (required to bypass RLS on insert; never expose this client-side)
   - `CSV_FILE_PATH` — path to the CSV file to import (defaults to `data/draws_sample.csv`)

2. Run the schema migration in the Supabase Dashboard → SQL Editor:

   ```bash
   # Paste the contents of migrations/001_create_schema.sql, or via psql:
   psql "$SUPABASE_DB_URL" -f migrations/001_create_schema.sql
   ```

   This creates `neo.states`, `neo.lotteries`, `neo.draws`, `neo.import_logs`,
   seeds 9 states and 4 lottery types, and enables RLS with public-read policies.

## Usage

```bash
python -m neo_ingest.cli
```

The CLI will:

1. Parse the CSV pointed to by `CSV_FILE_PATH` (auto-detects encoding and delimiter).
2. Validate every row (state/lottery codes, date range, number format, digit consistency).
3. Insert valid draws into Supabase in batches of 1000.
4. Record a summary in `neo.import_logs` and print the results.

Exit code is `0` on full success, `1` if any record failed to parse, validate, or insert.

## CSV format

Required columns (case-insensitive): `state`, `lottery`, `date`, `number`.
Optional: `source_url`.

- `state`: two-letter code (`SP`, `RJ`, `MG`, `BA`, `RS`, `PR`, `GO`, `ES`, `DF`)
- `lottery`: `milhar`, `duque`, `terno`, or `quadra`
- `date`: `YYYY-MM-DD`, `DD/MM/YYYY`, or `DD-MM-YYYY`
- `number`: 4-digit draw number (`0000`–`9999`)

See `data/draws_sample.csv` for an example.

## Test

```bash
pytest tests/ -v
```
