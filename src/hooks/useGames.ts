import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Game, GameTag, GameTagInput } from '@/lib/games-types';

export function useGamesForPlayer(playerId: string | undefined) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!playerId) { setLoading(false); return; }
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('player_id', playerId)
      .order('date', { ascending: false });
    if (data) setGames(data as Game[]);
    setLoading(false);
  }, [playerId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { games, loading, refetch: fetch };
}

export function useGame(gameId: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [tags, setTags] = useState<GameTag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!gameId) { setLoading(false); return; }
    const [{ data: g }, { data: t }] = await Promise.all([
      supabase.from('games').select('*').eq('id', gameId).maybeSingle(),
      supabase.from('game_tags').select('*').eq('game_id', gameId).order('created_at', { ascending: true }),
    ]);
    if (g) setGame(g as Game);
    if (t) setTags(t as GameTag[]);
    setLoading(false);
  }, [gameId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscribe to tag inserts/deletes for this game
  useEffect(() => {
    if (!gameId) return;
    const channel = supabase
      .channel(`game_tags:${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_tags', filter: `game_id=eq.${gameId}` },
        () => { fetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameId, fetch]);

  return { game, tags, loading, refetch: fetch };
}

export async function createGame(input: {
  player_id: string;
  coach_id: string;
  date: string;
  opponent: string;
  video_url?: string | null;
}): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('games')
    .insert({
      player_id:  input.player_id,
      coach_id:   input.coach_id,
      date:       input.date,
      opponent:   input.opponent,
      video_url:  input.video_url || null,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function addTag(gameId: string, tag: GameTagInput): Promise<{ error?: string }> {
  const { error } = await supabase.from('game_tags').insert({ game_id: gameId, ...tag });
  return error ? { error: error.message } : {};
}

export async function deleteTag(tagId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('game_tags').delete().eq('id', tagId);
  return error ? { error: error.message } : {};
}

export async function updateTagDescription(tagId: string, description: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('game_tags')
    .update({ description })
    .eq('id', tagId);
  return error ? { error: error.message } : {};
}

export async function closeGame(gameId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('games').update({ status: 'closed' }).eq('id', gameId);
  return error ? { error: error.message } : {};
}
