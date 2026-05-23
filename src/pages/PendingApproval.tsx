import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, Lock, LogOut } from 'lucide-react';

const PendingApproval = () => {
  const { logout, profile, role } = useAuth();

  // Approved by the system but not granted access to courtiq specifically
  // (e.g. an account created in the sibling shooting-coach app).
  const blockedByCourtiq =
    role === 'player' && profile?.is_approved === true && profile?.courtiq_enabled === false;

  const Icon = blockedByCourtiq ? Lock : Clock;
  const title = blockedByCourtiq ? 'אין גישה ל-I2 Analytics' : 'ממתין לאישור';
  const body = blockedByCourtiq
    ? 'החשבון שלך לא רשום לאפליקציית I2 Analytics. כדי לקבל גישה, פנה למאמן שלך כדי שיוסיף אותך מהאזור הניהולי.'
    : 'המאמן הראשי צריך לאשר את הגישה שלך למערכת. תוכל להתחבר ברגע שתאושר.';
  const hint = blockedByCourtiq
    ? '💡 המאמן צריך להוסיף אותך דרך לוח השחקנים ב-I2 Analytics'
    : '💡 פנה למאמן הראשי כדי שיאשר את ההרשמה שלך';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <Icon className="h-10 w-10 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground mb-2">
          שלום {profile?.display_name}
          {!blockedByCourtiq && `, ההרשמה שלך כ${role === 'coach' ? 'מאמן' : 'שחקן'} התקבלה.`}
        </p>
        <p className="text-muted-foreground mb-6">{body}</p>
        <div className="gradient-card rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>

        <Button variant="ghost" onClick={logout} className="text-muted-foreground">
          <LogOut className="ml-2 h-4 w-4" />
          יציאה
        </Button>
      </div>
    </div>
  );
};

export default PendingApproval;
