import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, LogOut, Brain, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import RoleSwitcher from './RoleSwitcher';

const BasicPlayerNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const tabs = [
    { path: '/courtiq', icon: Brain, label: 'CourtIQ' },
    { path: '/courtiq/leaderboard', icon: Trophy, label: 'דירוג' },
    { path: '/courtiq/profile', icon: User, label: 'פרופיל' },
  ];

  const currentPath = location.pathname;

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-foreground tracking-tight">COURT IQ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg gradient-accent">
              <span className="text-[10px] font-black text-accent-foreground">IQ</span>
            </div>
            <RoleSwitcher inline className="shrink-0" />
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground h-8 w-8 shrink-0 rounded-xl">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="bg-background/80 backdrop-blur-xl border-t border-border/50">
          <div className="flex items-center justify-around py-1 px-1 max-w-md mx-auto">
            {tabs.map((tab) => {
              const isActive =
                currentPath === tab.path ||
                (tab.path === '/courtiq' && currentPath === '/');

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center gap-0.5 min-w-[48px] min-h-[44px] justify-center px-1.5 py-1 rounded-xl transition-all active:scale-95 ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_8px_hsl(24,100%,50%,0.5)]' : ''}`} />
                  <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
                  {isActive && <div className="h-0.5 w-5 rounded-full gradient-accent mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicPlayerNav;
