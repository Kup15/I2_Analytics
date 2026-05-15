import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { addTag, closeGame, deleteTag, useGame } from '@/hooks/useGames';
import { GROUP_META, TAG_TYPES_BY_GROUP, TAG_TYPES_BY_VALUE, type TagGroup } from '@/lib/games-types';
import { usePlayer } from '@/hooks/useSupabaseData';
import YouTubePlayer, { YouTubePlayerHandle, extractYouTubeId } from '@/components/YouTubePlayer';
import { toast } from 'sonner';

const formatTimestamp = (s: number | null): string => {
  if (s == null) return '';
  const total = Math.floor(s);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const formatGameClock = (m: number, s: number): string => `${m}:${String(s).padStart(2, '0')}`;

const GameTaggingPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { game, tags, loading, refetch } = useGame(gameId);
  const { player } = usePlayer(game?.player_id);

  const [quarter, setQuarter] = useState(1);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const playerRef = useRef<YouTubePlayerHandle>(null);

  const isCoach = role === 'coach' && user?.id === game?.coach_id;
  const isClosed = game?.status === 'closed';
  const videoId = useMemo(() => extractYouTubeId(game?.video_url ?? ''), [game?.video_url]);

  const totalScore = useMemo(() => tags.reduce((sum, t) => sum + t.score, 0), [tags]);

  const handleTag = async (typeValue: string, scoreOverride?: number) => {
    if (!gameId || !isCoach || isClosed) return;
    const def = TAG_TYPES_BY_VALUE[typeValue];
    if (!def) return;

    if (minute === 0 && second === 0) {
      toast.error('יש להגדיר את הזמן ברבע לפני תיוג');
      return;
    }

    const ts = videoId ? playerRef.current?.getCurrentTime() ?? null : null;
    const score = scoreOverride ?? def.defaultScore;

    const res = await addTag(gameId, {
      quarter,
      minute,
      second,
      video_timestamp_seconds: ts,
      score,
      type: typeValue,
    });
    if (res.error) {
      toast.error(`שגיאה בשמירה: ${res.error}`);
    } else {
      // Realtime subscription will refetch, but force a refresh in case it lags
      setTimeout(() => refetch(), 200);
    }
    setPendingType(null);
  };

  const handleSeek = (seconds: number | null) => {
    if (seconds == null || !playerRef.current) return;
    playerRef.current.seekTo(seconds);
    playerRef.current.play();
  };

  const handleDelete = async (tagId: string) => {
    const res = await deleteTag(tagId);
    if (res.error) toast.error(`שגיאה במחיקה: ${res.error}`);
  };

  const handleUndo = async () => {
    const last = [...tags].sort((a, b) => a.created_at.localeCompare(b.created_at)).pop();
    if (!last) return;
    await handleDelete(last.id);
  };

  const handleClose = async () => {
    if (!gameId) return;
    if (!confirm('לסגור את המשחק? לא ניתן יהיה להוסיף תיוגים.')) return;
    const res = await closeGame(gameId);
    if (res.error) toast.error(`שגיאה: ${res.error}`);
    else { toast.success('המשחק נסגר'); refetch(); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">טוען...</div>;
  if (!game) return <div className="p-8 text-center">משחק לא נמצא</div>;

  const sortedTags = [...tags].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="min-h-screen px-4 py-4 md:px-8" dir="rtl">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(game ? `/player/${game.player_id}` : '/')}
            className="text-muted-foreground"
          >
            חזרה
            <ArrowRight className="mr-2 h-4 w-4" />
          </Button>
          {isCoach && !isClosed && (
            <Button variant="outline" size="sm" onClick={handleClose}>
              <Lock className="ml-2 h-4 w-4" />
              סגור משחק
            </Button>
          )}
          {isClosed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              סגור
            </span>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">
            {player?.display_name ?? 'שחקן'} <span className="text-muted-foreground">נגד</span> {game.opponent}
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date(game.date).toLocaleDateString('he-IL')}
            {videoId ? ' · עם וידאו' : ' · ללא וידאו'}
          </p>
        </div>

        {/* Video */}
        {videoId && (
          <div className="mb-4">
            <YouTubePlayer ref={playerRef} videoId={videoId} />
          </div>
        )}

        {/* Score banner */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="gradient-card rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-accent">{totalScore > 0 ? `+${totalScore}` : totalScore}</p>
            <p className="text-xs text-muted-foreground">ציון משחק</p>
          </div>
          <div className="gradient-card rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{tags.length}</p>
            <p className="text-xs text-muted-foreground">תיוגים</p>
          </div>
          <div className="gradient-card rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{tags.filter(t => t.score > 0).length}</p>
            <p className="text-xs text-muted-foreground">חיוביים</p>
          </div>
        </div>

        {/* Quarter / clock selectors */}
        {isCoach && !isClosed && (
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">רבע</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    onClick={() => setQuarter(q)}
                    className={`flex-1 rounded-lg py-2 text-sm font-bold ${
                      quarter === q ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {q === 5 ? 'OT' : q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">שעון רבע (MM:SS)</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="minute"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={15}
                  value={minute}
                  onChange={(e) => setMinute(Math.max(0, Math.min(15, Number(e.target.value) || 0)))}
                  className="text-center"
                  aria-label="דקה ברבע"
                />
                <span className="font-bold text-muted-foreground">:</span>
                <Input
                  id="second"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={String(second).padStart(2, '0')}
                  onChange={(e) => setSecond(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                  className="text-center"
                  aria-label="שניות ברבע"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tag buttons — grouped by category */}
        {isCoach && !isClosed && (
          <div className="mb-4 space-y-3">
            {(['offense', 'general', 'defense'] as TagGroup[]).map(group => {
              const meta = GROUP_META[group];
              const items = TAG_TYPES_BY_GROUP[group];
              return (
                <div key={group} className="rounded-xl bg-card p-3">
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${meta.chipClass}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {items.map(t => (
                      <button
                        key={t.value}
                        onClick={() => handleTag(t.value)}
                        onContextMenu={(e) => { e.preventDefault(); setPendingType(t.value); }}
                        className={`rounded-xl ${meta.buttonClass} px-2 py-3 text-white text-center active:scale-95 transition-transform`}
                        title={t.description}
                      >
                        <div className="text-base font-black leading-tight">{t.code}</div>
                        <div className="mt-1 text-[10px] leading-tight opacity-85 line-clamp-2 min-h-[2.2em]">
                          {t.description.split(' — ')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {pendingType && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary p-2">
                <span className="text-xs text-muted-foreground">
                  ציון ל"{TAG_TYPES_BY_VALUE[pendingType]?.code}":
                </span>
                {[-2, -1, 0, 1, 2].map(s => (
                  <Button key={s} size="sm" variant="outline" onClick={() => handleTag(pendingType, s)}>
                    {s > 0 ? `+${s}` : s}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setPendingType(null)}>בטל</Button>
              </div>
            )}
            {tags.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleUndo} className="w-full">
                בטל תיוג אחרון
              </Button>
            )}
          </div>
        )}

        {/* Tag list */}
        <div className="rounded-xl bg-card p-3">
          <h3 className="mb-2 text-right font-semibold">תיוגי משחק ({tags.length})</h3>
          {sortedTags.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">אין תיוגים עדיין</p>
          ) : (
            <ul className="divide-y divide-border">
              {sortedTags.map(tag => {
                const def = TAG_TYPES_BY_VALUE[tag.type];
                const meta = def ? GROUP_META[def.group] : null;
                const seekable = videoId && tag.video_timestamp_seconds != null;
                return (
                  <li key={tag.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="flex items-center gap-2">
                      {isCoach && !isClosed && (
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          title="מחק"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <span className={`inline-block w-2 h-2 rounded-full ${meta?.dotClass ?? 'bg-muted'}`} />
                      <span className={`font-bold ${tag.score > 0 ? 'text-emerald-500' : tag.score < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {tag.score > 0 ? `+${tag.score}` : tag.score}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSeek(tag.video_timestamp_seconds)}
                      disabled={!seekable}
                      className={`flex-1 text-right ${seekable ? 'cursor-pointer hover:bg-muted rounded-lg px-2 py-1' : 'cursor-default'}`}
                    >
                      <div className="text-sm font-medium flex items-center gap-2 justify-end">
                        <span>{def?.description ?? tag.type}</span>
                        {def && (
                          <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${meta?.chipClass}`}>
                            {def.code}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        רבע {tag.quarter} · {formatGameClock(tag.minute, tag.second ?? 0)}
                        {tag.video_timestamp_seconds != null && ` · וידאו ${formatTimestamp(tag.video_timestamp_seconds)}`}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTaggingPage;
