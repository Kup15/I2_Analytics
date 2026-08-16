-- Replace the create-player edge function with a SQL RPC.
--
-- The Supabase project is managed from a Lovable account we don't control, so
-- edge functions cannot be redeployed from here — the deployed create-player
-- has been crashing since 2026-05-23 and there is no way to ship the fix to it.
-- Same reasoning as enable_player_courtiq: keep server-side logic in SQL, where
-- we can actually deploy it.
--
-- Creating the auth user is all this needs to do by hand:
--   * handle_new_user()      builds the profiles row (display_name, role,
--                            coach_id, team, age) + the user_roles row
--   * auto_approve_profile() forces is_approved on insert
-- Only `position` and `courtiq_enabled` need setting afterwards.

CREATE OR REPLACE FUNCTION public.create_player(
  p_email        text,
  p_password     text,
  p_display_name text,
  p_team         text    DEFAULT NULL,
  p_position     text    DEFAULT NULL,
  p_age          integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  v_caller  uuid := auth.uid();
  v_email   text := lower(trim(p_email));
  v_name    text := trim(coalesce(p_display_name, ''));
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = v_caller AND role = 'coach' AND is_approved
  ) THEN
    RAISE EXCEPTION 'Only approved coaches can add players';
  END IF;

  IF v_email = '' OR v_name = '' OR p_password IS NULL THEN
    RAISE EXCEPTION 'Missing required fields';
  END IF;

  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_email) THEN
    RAISE EXCEPTION 'Email already registered: %', v_email;
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    crypt(p_password, gen_salt('bf')),
    now(),                                    -- email pre-confirmed, as the edge function did
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_strip_nulls(jsonb_build_object(
      'display_name', v_name,
      'role',         'player',
      'coach_id',     v_caller::text,
      'team',         nullif(trim(coalesce(p_team, '')), ''),
      'age',          p_age
    )),
    now(), now(),
    '', '', '', ''                            -- NOT NULL token columns
  );

  -- Password sign-in resolves the user through this row.
  INSERT INTO auth.identities (
    user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_user_id::text,
    'email',
    jsonb_build_object(
      'sub',            v_user_id::text,
      'email',          v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    now(), now(), now()
  );

  UPDATE public.profiles
     SET position        = nullif(trim(coalesce(p_position, '')), ''),
         is_approved     = true,
         courtiq_enabled = true
   WHERE user_id = v_user_id;

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_player(text, text, text, text, text, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_player(text, text, text, text, text, integer) TO authenticated;

COMMENT ON FUNCTION public.create_player(text, text, text, text, text, integer) IS
  'Coach-only: creates a player auth user + profile with I2 Analytics access. Replaces the create-player edge function, which cannot be redeployed from this repo.';
