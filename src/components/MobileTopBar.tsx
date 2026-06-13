import { LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const MobileTopBar = () => {
  const isMobile = useIsMobile();
  const { logout } = useAuth();

  if (!isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 safe-area-top">
      <div className="h-12 bg-background/95 backdrop-blur border-b border-border flex items-center justify-center relative">
        <img src="/logo.png" alt="I2 Analytics" className="h-9 w-9 rounded-lg object-cover" />
        <button
          onClick={logout}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="התנתק"
          title="התנתק"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
