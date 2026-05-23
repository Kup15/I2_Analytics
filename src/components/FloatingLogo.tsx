import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FloatingLogo = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="fixed top-3 right-3 z-40 hidden md:flex items-center gap-2">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl gradient-accent shadow-lg hover:scale-105 transition-transform"
        aria-label="I2 Analytics - חזרה לדף הבית"
      >
        <span className="text-sm font-black text-accent-foreground">I2</span>
      </button>
      <button
        onClick={logout}
        className="flex items-center justify-center h-8 w-8 rounded-xl bg-background/85 border border-border text-muted-foreground shadow-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="התנתק"
        title="התנתק"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FloatingLogo;
