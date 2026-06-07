-- C-01: prevent duplicate tenants from concurrent first-login requests (race condition)
-- neo_profiles.id already references auth.users(id) as primary key, so only the
-- tenant slug needs a uniqueness guarantee at the database level.
ALTER TABLE neo.neo_tenants
  ADD CONSTRAINT neo_tenants_slug_unique UNIQUE (slug);
