-- Security hardening pass.
-- This migration preserves the existing owner-only access model while
-- re-asserting key controls and reducing unused surface area.

-- ============================================================
-- RE-ASSERT TABLE-LEVEL RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can read own profile'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can read own profile"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can insert own profile"
        ON public.profiles FOR INSERT
        WITH CHECK (auth.uid() = id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can update own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can delete own profile'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can delete own profile"
        ON public.profiles FOR DELETE
        USING (auth.uid() = id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resumes'
      AND policyname = 'Users can read own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can read own resumes"
        ON public.resumes FOR SELECT
        USING (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resumes'
      AND policyname = 'Users can insert own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can insert own resumes"
        ON public.resumes FOR INSERT
        WITH CHECK (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resumes'
      AND policyname = 'Users can update own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can update own resumes"
        ON public.resumes FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resumes'
      AND policyname = 'Users can delete own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can delete own resumes"
        ON public.resumes FOR DELETE
        USING (auth.uid() = user_id)
    $sql$;
  END IF;
END
$$;

-- ============================================================
-- RESUME STORAGE BUCKET: KEEP PRIVATE AND PDF-ONLY
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can upload own resumes"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'resumes'
          AND auth.uid()::text = (storage.foldername(name))[1]
        )
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can read own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can read own resumes"
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'resumes'
          AND auth.uid()::text = (storage.foldername(name))[1]
        )
    $sql$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete own resumes'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Users can delete own resumes"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'resumes'
          AND auth.uid()::text = (storage.foldername(name))[1]
        )
    $sql$;
  END IF;
END
$$;

-- ============================================================
-- LOCK DOWN UNUSED VIEW SURFACE
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_views
    WHERE schemaname = 'public'
      AND viewname = 'profile_additional_fields'
  ) THEN
    EXECUTE 'REVOKE ALL ON TABLE public.profile_additional_fields FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON TABLE public.profile_additional_fields FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE public.profile_additional_fields FROM authenticated';
  END IF;
END
$$;
