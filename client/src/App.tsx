import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Quiz from "@/pages/Quiz";
import Notes from "@/pages/Notes";
import Pricing from "@/pages/Pricing";
import StudyGuide from "@/pages/StudyGuide";
import Performance from "@/pages/Performance";
import AiTools from "@/pages/AiTools";
import NotFound from "@/pages/not-found";

function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-docdot-blue"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/home" />;
  }

  return <AuthForm />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthForm} />
      <Route path="/home">
        <ProtectedRoute>
          <Navigation />
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/quiz">
        <ProtectedRoute>
          <Navigation />
          <Quiz />
        </ProtectedRoute>
      </Route>
      <Route path="/notes">
        <ProtectedRoute>
          <Navigation />
          <Notes />
        </ProtectedRoute>
      </Route>
      <Route path="/pricing">
        <ProtectedRoute>
          <Navigation />
          <Pricing />
        </ProtectedRoute>
      </Route>
      <Route path="/study-guide">
        <ProtectedRoute>
          <Navigation />
          <StudyGuide />
        </ProtectedRoute>
      </Route>
      <Route path="/performance">
        <ProtectedRoute>
          <Navigation />
          <Performance />
        </ProtectedRoute>
      </Route>
      <Route path="/ai-tools">
        <ProtectedRoute>
          <Navigation />
          <AiTools />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
