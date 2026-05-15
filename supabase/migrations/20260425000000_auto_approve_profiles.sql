-- DEV ONLY: Auto-approve all new profile registrations
-- Remove this migration before going to production

CREATE OR REPLACE FUNCTION public.auto_approve_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.is_approved := true;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_approve_profile ON public.profiles;

CREATE TRIGGER trg_auto_approve_profile
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_profile();
