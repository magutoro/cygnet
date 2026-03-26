-- Stores any non-core profile fields used by the extension "追加情報" tab.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS additional_profile JSONB NOT NULL DEFAULT '{}'::jsonb;
