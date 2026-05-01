CREATE TABLE IF NOT EXISTS public.gmail_sync_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_thread_id TEXT NOT NULL,
  gmail_message_id TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT '',
  snippet TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  role_title TEXT NOT NULL DEFAULT '',
  source_site TEXT NOT NULL DEFAULT 'Gmail / Cygnet',
  status TEXT NOT NULL DEFAULT 'saved',
  next_step_label TEXT NOT NULL DEFAULT '',
  next_step_at DATE,
  next_step_start_time TEXT,
  next_step_end_time TEXT,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  confidence INTEGER NOT NULL DEFAULT 0,
  confidence_reasons TEXT[] NOT NULL DEFAULT '{}'::text[],
  review_status TEXT NOT NULL DEFAULT 'pending',
  approved_application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, gmail_thread_id),
  CONSTRAINT gmail_sync_candidates_status_check CHECK (
    status IN ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')
  ),
  CONSTRAINT gmail_sync_candidates_review_status_check CHECK (
    review_status IN ('pending', 'approved', 'dismissed')
  ),
  CONSTRAINT gmail_sync_candidates_confidence_check CHECK (
    confidence >= 0 AND confidence <= 100
  )
);

ALTER TABLE public.gmail_sync_candidates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gmail_sync_candidates'
      AND policyname = 'Users can read own gmail candidates'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can read own gmail candidates"
        ON public.gmail_sync_candidates FOR SELECT
        USING (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gmail_sync_candidates'
      AND policyname = 'Users can insert own gmail candidates'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can insert own gmail candidates"
        ON public.gmail_sync_candidates FOR INSERT
        WITH CHECK (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gmail_sync_candidates'
      AND policyname = 'Users can update own gmail candidates'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can update own gmail candidates"
        ON public.gmail_sync_candidates FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gmail_sync_candidates'
      AND policyname = 'Users can delete own gmail candidates'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can delete own gmail candidates"
        ON public.gmail_sync_candidates FOR DELETE
        USING (auth.uid() = user_id)
    $sql$;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS gmail_sync_candidates_user_review_idx
  ON public.gmail_sync_candidates (user_id, review_status, detected_at DESC);

CREATE INDEX IF NOT EXISTS gmail_sync_candidates_gmail_message_idx
  ON public.gmail_sync_candidates (user_id, gmail_message_id);

DROP TRIGGER IF EXISTS gmail_sync_candidates_updated_at ON public.gmail_sync_candidates;
CREATE TRIGGER gmail_sync_candidates_updated_at
  BEFORE UPDATE ON public.gmail_sync_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
