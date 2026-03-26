-- Add additional education fields used by newer autofill flows.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS humanities_science_type TEXT NOT NULL DEFAULT '';
