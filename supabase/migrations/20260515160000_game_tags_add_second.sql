-- Add seconds-within-quarter to game_tags. Existing rows get second=0.
ALTER TABLE public.game_tags
  ADD COLUMN second INTEGER NOT NULL DEFAULT 0
    CHECK (second BETWEEN 0 AND 59);
