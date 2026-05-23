-- Add a courtiq-specific access flag to profiles so shooting-coach players
-- aren't automatically granted access to the I2 Analytics (courtiq) app.
--
-- Coaches are unaffected (gating in the app only blocks role='player').
-- The create-player edge function flips this to true when a coach adds a
-- player via courtiq's roster UI.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS courtiq_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.courtiq_enabled IS
  'True when a coach has explicitly added this user to the I2 Analytics (courtiq) app. Defaults to false so shooting-coach players have no access until enabled.';
