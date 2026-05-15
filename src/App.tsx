import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import PendingApproval from "./pages/PendingApproval";
import PlayerProfile from "./pages/PlayerProfile";
import NotFound from "./pages/NotFound";
import BasicPlayerNav from "./components/BasicPlayerNav";
import CourtIQPage from "./pages/CourtIQPage";
import CourtIQLeaderboardPage from "./pages/CourtIQLeaderboardPage";
import CourtIQProfilePage from "./pages/CourtIQProfilePage";
import CourtIQAdminPage from "./pages/CourtIQAdminPage";
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent animate-pulse">
            <span className="text-2xl font-black text-accent-foreground">IQ</span>
          </div>
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
            <Route path="/" element={<CoachWrap><CourtIQPage /></CoachWrap>} />
            <Route path="/courtiq" element={<CoachWrap><CourtIQPage /></CoachWrap>} />
            <Route path="/courtiq/leaderboard" element={<CoachWrap><CourtIQLeaderboardPage /></CoachWrap>} />
            <Route path="/courtiq/profile" element={<CoachWrap><CourtIQProfilePage /></CoachWrap>} />
            <Route path="/courtiq/admin" element={<CoachWrap><CourtIQAdminPage /></CoachWrap>} />
            <Route path="/player/:playerId" element={<CoachWrap><PlayerProfile /></CoachWrap>} />
            <Route path="/accessibility" element={<CoachWrap><AccessibilityPage /></CoachWrap>} />
            <Route path="*" element={<CoachWrap><NotFound /></CoachWrap>} />
          </>
        ) : (
          <>
            <Route path="/" element={<PlayerNavWrap><CourtIQPage /></PlayerNavWrap>} />
            <Route path="/courtiq" element={<PlayerNavWrap><CourtIQPage /></PlayerNavWrap>} />
            <Route path="/courtiq/leaderboard" element={<PlayerNavWrap><CourtIQLeaderboardPage /></PlayerNavWrap>} />
            <Route path="/courtiq/profile" element={<PlayerNavWrap><CourtIQProfilePage /></PlayerNavWrap>} />
            <Route path="/accessibility" element={<PlayerNavWrap><AccessibilityPage /></PlayerNavWrap>} />
            <Route path="*" element={<PlayerNavWrap><CourtIQPage /></PlayerNavWrap>} />
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
