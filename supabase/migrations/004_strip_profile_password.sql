-- Keep job-site passwords local-only by preventing cloud persistence.

CREATE OR REPLACE FUNCTION public.strip_profile_password()
RETURNS TRIGGER AS $$
BEGIN
  NEW.password := '';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_strip_password ON public.profiles;
CREATE TRIGGER profiles_strip_password
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.strip_profile_password();

UPDATE public.profiles
SET password = ''
WHERE password <> '';
