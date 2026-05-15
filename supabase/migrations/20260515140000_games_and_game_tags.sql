-- Game tagging feature: clean per-player "game" + per-play "tag" tables.
-- Independent of legacy public.sessions / public.game_actions, which remain
-- in use by other features (shooting-coach co-tenant). Do NOT mutate legacy.

CREATE TABLE public.games (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL,
  coach_id    UUID NOT NULL,
  date        DATE NOT NULL,
  opponent    TEXT NOT NULL,
  video_url   TEXT,                       -- YouTube/Vimeo URL; NULL for live-only games
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX games_player_id_idx ON public.games (player_id, date DESC);
CREATE INDEX games_coach_id_idx  ON public.games (coach_id, date DESC);

CREATE TABLE public.game_tags (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id                  UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  quarter                  INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 6),  -- allow OT
  minute                   INTEGER NOT NULL CHECK (minute BETWEEN 0 AND 15),
  video_timestamp_seconds  NUMERIC,                                           -- NULL for live tags
  score                    INTEGER NOT NULL DEFAULT 0,
  type                     TEXT    NOT NULL,
  description              TEXT    NOT NULL DEFAULT '',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX game_tags_game_id_idx ON public.game_tags (game_id, quarter, minute);

-- updated_at trigger for games
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER games_touch_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.games     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tags ENABLE ROW LEVEL SECURITY;

-- games: coach who owns the game manages it; player can view their own games
CREATE POLICY "Coaches manage their games"
  ON public.games FOR ALL TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Players can view their games"
  ON public.games FOR SELECT TO authenticated
  USING (player_id = auth.uid());

-- game_tags: inherit visibility from parent game
CREATE POLICY "Visibility inherits from games"
  ON public.game_tags FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games g
      WHERE g.id = game_tags.game_id
        AND (g.coach_id = auth.uid() OR g.player_id = auth.uid())
    )
  );

CREATE POLICY "Coach who owns the game can write tags"
  ON public.game_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games g
      WHERE g.id = game_tags.game_id AND g.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games g
      WHERE g.id = game_tags.game_id AND g.coach_id = auth.uid()
    )
  );

-- Enable realtime on game_tags so future multi-device tagging just works
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_tags;
