ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS next_step_start_time TEXT,
  ADD COLUMN IF NOT EXISTS next_step_end_time TEXT,
  ADD COLUMN IF NOT EXISTS capture_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS gmail_thread_id TEXT,
  ADD COLUMN IF NOT EXISTS gmail_message_id TEXT,
  ADD COLUMN IF NOT EXISTS calendar_provider TEXT,
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS calendar_event_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_capture_source_check'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_capture_source_check
      CHECK (capture_source IN ('manual', 'quick_add', 'gmail_sync'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_calendar_provider_check'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_calendar_provider_check
      CHECK (calendar_provider IS NULL OR calendar_provider IN ('google'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS applications_next_step_at_idx
  ON public.applications (user_id, next_step_at);

CREATE INDEX IF NOT EXISTS applications_gmail_thread_idx
  ON public.applications (user_id, gmail_thread_id);

CREATE TABLE IF NOT EXISTS public.google_workspace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT NOT NULL DEFAULT '',
  scopes TEXT[] NOT NULL DEFAULT '{}'::text[],
  label_name TEXT NOT NULL DEFAULT 'Cygnet',
  refresh_token_encrypted TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  last_sync_error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.google_workspace_integrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'google_workspace_integrations'
      AND policyname = 'Users can read own google integrations'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can read own google integrations"
        ON public.google_workspace_integrations FOR SELECT
        USING (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'google_workspace_integrations'
      AND policyname = 'Users can insert own google integrations'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can insert own google integrations"
        ON public.google_workspace_integrations FOR INSERT
        WITH CHECK (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'google_workspace_integrations'
      AND policyname = 'Users can update own google integrations'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can update own google integrations"
        ON public.google_workspace_integrations FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'google_workspace_integrations'
      AND policyname = 'Users can delete own google integrations'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can delete own google integrations"
        ON public.google_workspace_integrations FOR DELETE
        USING (auth.uid() = user_id)
    $sql$;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS google_workspace_integrations_scopes_idx
  ON public.google_workspace_integrations
  USING GIN (scopes);

DROP TRIGGER IF EXISTS google_workspace_integrations_updated_at ON public.google_workspace_integrations;
CREATE TRIGGER google_workspace_integrations_updated_at
  BEFORE UPDATE ON public.google_workspace_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
