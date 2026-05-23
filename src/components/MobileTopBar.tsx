import { LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const MobileTopBar = () => {
  const isMobile = useIsMobile();
  const { logout } = useAuth();

  if (!isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 safe-area-top">
      <div className="h-11 gradient-accent flex items-center justify-center relative">
        <span className="text-[13px] font-black text-accent-foreground tracking-widest">COURT IQ</span>
        <button
          onClick={logout}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg text-accent-foreground/90 hover:bg-accent-foreground/10 transition-colors"
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
