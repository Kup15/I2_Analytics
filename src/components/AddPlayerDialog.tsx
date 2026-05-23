import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Search, UserPlus } from 'lucide-react';

const POSITIONS = ['פלייגארד', 'שוטינג גארד', 'סמול פורוורד', 'פאוור פורוורד', 'סנטר'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

type PoolPlayer = {
  user_id: string;
  display_name: string;
  team: string | null;
  position: string | null;
  age: number | null;
};

const AddPlayerDialog = ({ open, onOpenChange, onSaved }: Props) => {
  const [tab, setTab] = useState<'new' | 'existing'>('new');

  // New player form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Existing player state
  const [pool, setPool] = useState<PoolPlayer[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [enablingId, setEnablingId] = useState<string | null>(null);

  const resetForm = () => {
    setDisplayName(''); setEmail(''); setPassword(''); setAge('');
    setTeam(''); setPosition(''); setError('');
  };

  useEffect(() => {
    if (!open) return;
    if (tab !== 'existing') return;
    setPoolLoading(true);
    supabase
      .from('profiles')
      .select('user_id, display_name, team, position, age')
      .eq('role', 'player')
      .eq('is_approved', true)
      .eq('courtiq_enabled', false)
      .order('display_name')
      .then(({ data, error }) => {
        if (error) {
          toast.error(`שגיאה בטעינת רשימת השחקנים: ${error.message}`);
        } else {
          setPool((data ?? []) as PoolPlayer[]);
        }
        setPoolLoading(false);
      });
  }, [open, tab]);

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(p =>
      p.display_name.toLowerCase().includes(q) ||
      (p.team ?? '').toLowerCase().includes(q)
    );
  }, [pool, search]);

  const handleCreate = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      setError('יש למלא שם, אימייל וסיסמה');
      return;
    }
    if (password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 5 || ageNum > 50) {
      setError('יש למלא גיל (5-50)');
      return;
    }

    setIsLoading(true);
    setError('');

    const { data, error: fnError } = await supabase.functions.invoke('create-player', {
      body: {
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        team: team.trim() || null,
        position: position || null,
        age: age || null,
      },
    });

    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || 'שגיאה ביצירת השחקן');
      setIsLoading(false);
      return;
    }

    toast.success('השחקן נוסף בהצלחה!');
    resetForm();
    onOpenChange(false);
    onSaved();
    setIsLoading(false);
  };

  const handleEnable = async (player: PoolPlayer) => {
    setEnablingId(player.user_id);
    const { data, error: fnError } = await supabase.functions.invoke('enable-player-courtiq', {
      body: { userId: player.user_id },
    });
    setEnablingId(null);

    if (fnError || data?.error) {
      toast.error(data?.error || fnError?.message || 'שגיאה בהוספת השחקן');
      return;
    }

    toast.success(`${player.display_name} נוסף ל-I2 Analytics`);
    setPool(prev => prev.filter(p => p.user_id !== player.user_id));
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">הוספת שחקן</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'new' | 'existing')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              שחקן חדש
            </TabsTrigger>
            <TabsTrigger value="existing" className="gap-1.5">
              <Search className="h-4 w-4" />
              שחקן קיים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={100} placeholder="שם השחקן" />
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="player@email.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>סיסמה</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="לפחות 6 תווים" maxLength={72} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>גיל</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} min={5} max={25} placeholder="16" />
              </div>
              <div className="space-y-2">
                <Label>עמדה</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger><SelectValue placeholder="בחר עמדה" /></SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>קבוצה</Label>
              <Input value={team} onChange={e => setTeam(e.target.value)} maxLength={100} placeholder="שם הקבוצה" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleCreate} disabled={isLoading} className="w-full gradient-accent text-accent-foreground">
              {isLoading ? 'מוסיף...' : 'הוסף שחקן'}
            </Button>
          </TabsContent>

          <TabsContent value="existing" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              שחקנים שכבר רשומים בבסיס הנתונים (למשל מאפליקציית האימון לקליעות) ועדיין אין להם גישה ל-I2 Analytics.
            </p>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם או קבוצה"
                className="pr-9"
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 -mx-1 px-1">
              {poolLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">טוען...</p>
              ) : filteredPool.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {pool.length === 0 ? 'אין שחקנים זמינים להוספה' : 'לא נמצאו תוצאות'}
                </p>
              ) : (
                filteredPool.map(p => {
                  const meta = [p.team, p.position, p.age ? `גיל ${p.age}` : null].filter(Boolean).join(' · ');
                  const busy = enablingId === p.user_id;
                  return (
                    <div
                      key={p.user_id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/50 p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm">{p.display_name}</div>
                        {meta && <div className="truncate text-xs text-muted-foreground">{meta}</div>}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEnable(p)}
                        disabled={busy}
                        className="gap-1 shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {busy ? 'מוסיף...' : 'הוסף'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerDialog;
