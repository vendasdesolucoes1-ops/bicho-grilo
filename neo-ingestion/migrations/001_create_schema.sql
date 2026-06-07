-- NEO Quant Lab Ingestion — Foundation schema
-- Run in Supabase Dashboard → SQL Editor

CREATE SCHEMA IF NOT EXISTS neo;

-- ─── Reference tables ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS neo.states (
    id   INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS neo.lotteries (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    num_digits INTEGER NOT NULL,
    max_value  INTEGER NOT NULL
);

-- ─── Draws ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS neo.draws (
    id          BIGSERIAL PRIMARY KEY,
    state_id    INTEGER NOT NULL REFERENCES neo.states(id),
    lottery_id  INTEGER NOT NULL REFERENCES neo.lotteries(id),
    draw_date   DATE NOT NULL,
    full_number TEXT NOT NULL,
    digit_1     SMALLINT NOT NULL,
    digit_2     SMALLINT NOT NULL,
    digit_3     SMALLINT NOT NULL,
    digit_4     SMALLINT NOT NULL,
    source_url  TEXT,
    data_hash   TEXT NOT NULL GENERATED ALWAYS AS (
        md5(state_id::text || '|' || lottery_id::text || '|' || draw_date::text || '|' || full_number)
    ) STORED,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draws_state_lottery_date
    ON neo.draws (state_id, lottery_id, draw_date DESC);

CREATE INDEX IF NOT EXISTS idx_draws_full_number
    ON neo.draws (full_number);

CREATE UNIQUE INDEX IF NOT EXISTS uq_draws_state_lottery_date_hash
    ON neo.draws (state_id, lottery_id, draw_date, data_hash);

CREATE INDEX IF NOT EXISTS idx_draws_source_url
    ON neo.draws (source_url);

-- ─── Import logs ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS neo.import_logs (
    id            BIGSERIAL PRIMARY KEY,
    status        TEXT NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    inserted      INTEGER NOT NULL DEFAULT 0,
    failed        INTEGER NOT NULL DEFAULT 0,
    errors        JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_import_logs_status_created
    ON neo.import_logs (status, started_at DESC);

-- ─── Seed data ─────────────────────────────────────────────────────────────

INSERT INTO neo.states (id, code, name) VALUES
    (24, 'SP', 'São Paulo'),
    (33, 'RJ', 'Rio de Janeiro'),
    (31, 'MG', 'Minas Gerais'),
    (29, 'BA', 'Bahia'),
    (43, 'RS', 'Rio Grande do Sul'),
    (41, 'PR', 'Paraná'),
    (52, 'GO', 'Goiás'),
    (32, 'ES', 'Espírito Santo'),
    (53, 'DF', 'Distrito Federal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO neo.lotteries (id, name, num_digits, max_value) VALUES
    (1, 'Milhar', 4, 9999),
    (2, 'Duque',  4, 9999),
    (3, 'Terno',  4, 9999),
    (4, 'Quadra', 4, 9999)
ON CONFLICT (id) DO NOTHING;

-- ─── Row-Level Security ────────────────────────────────────────────────────

ALTER TABLE neo.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE neo.import_logs ENABLE ROW LEVEL SECURITY;

-- MVP: allow public read access to draws and import logs.
-- Inserts are performed by the ingestion CLI using the service_role key,
-- which bypasses RLS — no INSERT policy is granted to anon/authenticated.
CREATE POLICY draws_public_select ON neo.draws
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY import_logs_public_select ON neo.import_logs
    FOR SELECT TO anon, authenticated
    USING (true);
