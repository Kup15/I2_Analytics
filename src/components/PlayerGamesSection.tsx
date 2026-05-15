import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Plus, Trophy, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGamesForPlayer } from '@/hooks/useGames';

interface Props {
  playerId: string;
  canCreate: boolean;
}

const PlayerGamesSection = ({ playerId, canCreate }: Props) => {
  const navigate = useNavigate();
  const { games, loading } = useGamesForPlayer(playerId);

  return (
    <div className="mb-6 rounded-xl bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          משחקים מתויגים
        </h3>
        {canCreate && (
          <Button
            size="sm"
            onClick={() => navigate(`/player/${playerId}/new-game`)}
            className="gradient-accent text-accent-foreground"
          >
            <Plus className="ml-1 h-4 w-4" />
            משחק חדש
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-muted-foreground">טוען...</p>
      ) : games.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {canCreate ? 'אין משחקים עדיין — צור משחק חדש כדי להתחיל לתייג' : 'אין משחקים עדיין'}
        </p>
      ) : (
        <ul className="space-y-2">
          {games.map(g => (
            <li key={g.id}>
              <button
                onClick={() => navigate(`/game/${g.id}`)}
                className="w-full flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-3 text-right hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-end gap-2">
                    {g.status === 'open' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="h-3 w-3" />
                        פתוח
                      </span>
                    ) : null}
                    {g.video_url ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        <Video className="h-3 w-3" />
                        וידאו
                      </span>
                    ) : null}
                    <p className="font-medium text-foreground">נגד {g.opponent}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(g.date).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerGamesSection;
