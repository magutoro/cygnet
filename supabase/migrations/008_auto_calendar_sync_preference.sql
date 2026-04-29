ALTER TABLE public.google_workspace_integrations
  ADD COLUMN IF NOT EXISTS auto_calendar_sync_enabled BOOLEAN NOT NULL DEFAULT true;
