import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Save, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/hooks/useSupabaseData';
import { createGame } from '@/hooks/useGames';
import { toast } from 'sonner';

const NewGamePage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { player, loading } = usePlayer(playerId);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [opponent, setOpponent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (role !== 'coach') return <div className="p-8 text-center">רק מאמן יכול ליצור משחק</div>;
  if (loading) return <div className="p-8 text-center text-muted-foreground">טוען...</div>;
  if (!player) return <div className="p-8 text-center">שחקן לא נמצא</div>;

  const onSubmit = async () => {
    if (!user || !playerId) return;
    if (!opponent.trim()) {
      toast.error('יש להזין יריב');
      return;
    }
    setSubmitting(true);
    const res = await createGame({
      player_id: playerId,
      coach_id: user.id,
      date,
      opponent: opponent.trim(),
      video_url: videoUrl.trim() || null,
    });
    setSubmitting(false);
    if ('error' in res) {
      toast.error(`שגיאה: ${res.error}`);
      return;
    }
    toast.success('משחק נוצר');
    navigate(`/game/${res.id}`);
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8" dir="rtl">
      <div className="mx-auto max-w-xl">
        <Button variant="ghost" onClick={() => navigate(`/player/${playerId}`)} className="mb-4 text-muted-foreground">
          חזרה לפרופיל
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>

        <div className="gradient-card rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-1">משחק חדש</h1>
          <p className="text-sm text-muted-foreground mb-6">{player.display_name}</p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="date">תאריך</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="opponent">יריב</Label>
              <Input
                id="opponent"
                placeholder="לדוגמה: מכבי תל אביב"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="video" className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                קישור וידאו (YouTube/Vimeo) — אופציונלי
              </Label>
              <Textarea
                id="video"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                rows={2}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                השאר ריק לתיוג חי בזמן המשחק. ניתן להוסיף וידאו מאוחר יותר.
              </p>
            </div>

            <Button onClick={onSubmit} disabled={submitting} className="w-full gradient-accent text-accent-foreground">
              <Save className="ml-2 h-4 w-4" />
              {submitting ? 'יוצר...' : 'צור והתחל לתייג'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGamePage;
