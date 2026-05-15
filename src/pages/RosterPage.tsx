import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayers } from '@/hooks/useSupabaseData';
import AddPlayerDialog from '@/components/AddPlayerDialog';
import { useState } from 'react';

const RosterPage = () => {
  const navigate = useNavigate();
  const { players, loading, refetch } = usePlayers();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">השחקנים שלי</h1>
              <p className="text-xs text-muted-foreground">{players.length} שחקנים</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            הוסף שחקן
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">טוען...</div>
        ) : players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">אין שחקנים עדיין</p>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              הוסף את השחקן הראשון
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {players.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => navigate(`/player/${p.user_id}`)}
                  className="w-full flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-right hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{p.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[p.team, p.position].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddPlayerDialog open={addOpen} onOpenChange={setAddOpen} onSaved={refetch} />
    </div>
  );
};

export default RosterPage;
