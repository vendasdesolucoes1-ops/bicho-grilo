-- Create schema
CREATE SCHEMA IF NOT EXISTS neo;

-- Grant access to public roles
GRANT USAGE ON SCHEMA neo TO anon, authenticated, service_role;

-- Table: neo.draws
CREATE TABLE IF NOT EXISTS neo.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery TEXT NOT NULL,
    state TEXT NOT NULL,
    extraction TEXT NOT NULL,
    draw_date TIMESTAMPTZ NOT NULL,
    "group" INTEGER NOT NULL,
    animal TEXT NOT NULL,
    milhar TEXT,
    centena TEXT,
    dezena TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant access
GRANT SELECT ON neo.draws TO anon, authenticated;
GRANT ALL ON neo.draws TO service_role;

-- Enable RLS
ALTER TABLE neo.draws ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neo.draws
CREATE POLICY "Public read access for draws" 
    ON neo.draws FOR SELECT 
    USING (true);

-- Table: neo.import_logs
CREATE TABLE IF NOT EXISTS neo.import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    records_imported INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant access
GRANT SELECT ON neo.import_logs TO authenticated;
GRANT ALL ON neo.import_logs TO service_role;

-- Enable RLS
ALTER TABLE neo.import_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for neo.import_logs
CREATE POLICY "Authenticated users can read import logs" 
    ON neo.import_logs FOR SELECT 
    TO authenticated
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_draws_date ON neo.draws (draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_draws_group ON neo.draws ("group");
CREATE INDEX IF NOT EXISTS idx_draws_lottery_state ON neo.draws (lottery, state);
