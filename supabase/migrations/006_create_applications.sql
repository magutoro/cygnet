CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  role_title TEXT NOT NULL DEFAULT '',
  source_site TEXT NOT NULL DEFAULT '',
  application_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'saved',
  applied_at DATE,
  next_step_label TEXT NOT NULL DEFAULT '',
  next_step_at DATE,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT applications_status_check CHECK (
    status IN ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')
  )
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
