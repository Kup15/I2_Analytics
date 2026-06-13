import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import PendingApproval from "./pages/PendingApproval";
import PlayerProfile from "./pages/PlayerProfile";
import RosterPage from "./pages/RosterPage";
import NewGamePage from "./pages/NewGamePage";
import GameTaggingPage from "./pages/GameTaggingPage";
import NotFound from "./pages/NotFound";
import BasicPlayerNav from "./components/BasicPlayerNav";
import RoleSwitcher from "./components/RoleSwitcher";
import FloatingLogo from "./components/FloatingLogo";
import MobileTopBar from "./components/MobileTopBar";
import AccessibilityWidget from "./components/AccessibilityWidget";
import AccessibilityPage from "./pages/AccessibilityPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { role, loading, isApproved } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="I2 Analytics"
            className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover animate-pulse shadow-lg"
          />
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <BrowserRouter>
        <AccessibilityWidget />
        <Routes>
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (!isApproved) {
    return <PendingApproval />;
  }

  const isCoach = role === 'coach';
  const playerPageSpacingClass = "pt-[calc(env(safe-area-inset-top,0px)+4.25rem)] pb-[calc(env(safe-area-inset-bottom,0px)+5.25rem)]";
  const coachPageSpacingClass = "pt-[calc(env(safe-area-inset-top,0px)+3.5rem)]";

  const PlayerNavWrap = ({ children }: { children: React.ReactNode }) => (
    <>
      <BasicPlayerNav />
      <div className={playerPageSpacingClass}>{children}</div>
    </>
  );

  const CoachWrap = ({ children }: { children: React.ReactNode }) => (
    <div className={coachPageSpacingClass}>{children}</div>
  );

  return (
    <BrowserRouter>
      {isCoach ? <MobileTopBar /> : null}
      <FloatingLogo />
      <AccessibilityWidget />
      {isCoach ? <RoleSwitcher /> : null}
      <Routes>
        {isCoach ? (
          <>
            <Route path="/" element={<CoachWrap><RosterPage /></CoachWrap>} />
            <Route path="/player/:playerId" element={<CoachWrap><PlayerProfile /></CoachWrap>} />
            <Route path="/player/:playerId/new-game" element={<CoachWrap><NewGamePage /></CoachWrap>} />
            <Route path="/game/:gameId" element={<CoachWrap><GameTaggingPage /></CoachWrap>} />
            <Route path="/accessibility" element={<CoachWrap><AccessibilityPage /></CoachWrap>} />
            <Route path="*" element={<CoachWrap><NotFound /></CoachWrap>} />
          </>
        ) : (
          <>
            <Route path="/" element={<PlayerNavWrap><PlayerProfile /></PlayerNavWrap>} />
            <Route path="/game/:gameId" element={<PlayerNavWrap><GameTaggingPage /></PlayerNavWrap>} />
            <Route path="/accessibility" element={<PlayerNavWrap><AccessibilityPage /></PlayerNavWrap>} />
            <Route path="*" element={<PlayerNavWrap><PlayerProfile /></PlayerNavWrap>} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
