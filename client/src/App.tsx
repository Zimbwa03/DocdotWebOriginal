import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TooltipGuideProvider } from "@/contexts/TooltipGuideContext";
import { TooltipGuide } from "@/components/TooltipGuide";
import { AuthForm } from "@/components/AuthForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Quiz from "@/pages/Quiz";
import Notes from "@/pages/Notes";
import Pricing from "@/pages/Pricing";
import StudyGuide from "@/pages/StudyGuide";
import StudyGroups from "@/pages/StudyGroups";
import StudyTimer from "@/pages/StudyTimer";
import StudyPlanner from "@/pages/StudyPlanner";
import Performance from "@/pages/Performance";
import Analytics from "@/pages/Analytics";
import EnhancedAnalytics from "@/pages/EnhancedAnalytics";
import ProfileSetup from "@/pages/ProfileSetup";
import AiTools from "@/pages/AiTools";
import Badges from "@/pages/Badges";
import Leaderboard from "@/pages/Leaderboard";
import Resources from "@/pages/Resources";
import NotFound from "@/pages/not-found";

function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#3399FF' }}></div>
      </div>
    );
  }

  if (user) {
    // Check if profile setup is complete
    const profileSetupComplete = localStorage.getItem('profileSetupComplete');
    if (!profileSetupComplete) {
      return <Redirect to="/profile-setup" />;
    }
    return <Redirect to="/home" />;
  }

  return <Redirect to="/" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthForm} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/home">
        <ProtectedRoute>
          <AppLayout>
            <Home />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/quiz">
        <ProtectedRoute>
          <AppLayout>
            <Quiz />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/notes">
        <ProtectedRoute>
          <AppLayout>
            <Notes />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pricing">
        <ProtectedRoute>
          <AppLayout>
            <Pricing />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study">
        <ProtectedRoute>
          <AppLayout>
            <StudyGuide />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study-guide">
        <ProtectedRoute>
          <AppLayout>
            <StudyGuide />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study-timer">
        <ProtectedRoute>
          <AppLayout>
            <StudyTimer />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study-groups">
        <ProtectedRoute>
          <AppLayout>
            <StudyGroups />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/study-planner">
        <ProtectedRoute>
          <AppLayout>
            <StudyPlanner />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/performance">
        <ProtectedRoute>
          <AppLayout>
            <Performance />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <AppLayout>
            <EnhancedAnalytics />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/badges">
        <ProtectedRoute>
          <AppLayout>
            <Badges />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute>
          <AppLayout>
            <Leaderboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/resources">
        <ProtectedRoute>
          <AppLayout>
            <Resources />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/ai-tools">
        <ProtectedRoute>
          <AppLayout>
            <AiTools />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipGuideProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <TooltipGuide />
            </TooltipProvider>
          </TooltipGuideProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;