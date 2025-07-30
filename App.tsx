import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionErrorHandler } from "@/components/session-error-handler";
import { lazy } from "react";
import AuthPage from "@/pages/auth";
import Home from "@/pages/home";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Challenges from "@/pages/challenges";
import ActivityTracker from "@/pages/activity-tracker";
import Billing from "@/pages/billing";
import Subscribe from "@/pages/subscribe";
import Invite from "@/pages/invite";
import Leaderboard from "@/pages/leaderboard";
import Rankings from "@/pages/rankings";
import ShareAchievement from "@/pages/share-achievement";
import PaymentSuccess from "@/pages/payment-success";
import Admin from "@/pages/admin";
import PrivacyPolicy from "@/pages/privacy-policy";
import PrivacyPage from "@/pages/privacy";
import SafetyPage from "@/pages/safety";
import SupportPage from "@/pages/support";
import TermsOfService from "@/pages/terms-of-service";
import TermsAndPrivacy from "@/pages/terms-and-privacy";
import AdaptiveDifficultyDemo from "@/pages/adaptive-difficulty";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Check for payment success parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isPaymentSuccess = urlParams.get('payment') === 'success';
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading YouthRunningTracker...</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/test'} 
              className="text-sm text-blue-600 hover:underline"
            >
              Test Server Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show payment success page regardless of auth status
  if (isPaymentSuccess) {
    return <PaymentSuccess />;
  }

  return (
    <Switch>
      {/* Public routes accessible without authentication */}
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/safety" component={SafetyPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Landing page for non-authenticated users */}
      <Route path="/">
        {() => user ? <Home /> : <LandingPage />}
      </Route>
      
      {/* Protected routes - require authentication */}
      <Route path="/dashboard">
        {() => user ? <Dashboard /> : <AuthPage />}
      </Route>
      <Route path="/home">
        {() => user ? <Home /> : <AuthPage />}
      </Route>
      <Route path="/profile">
        {() => user ? <Profile /> : <AuthPage />}
      </Route>
      <Route path="/challenges">
        {() => user ? <Challenges /> : <AuthPage />}
      </Route>
      <Route path="/activity">
        {() => user ? <ActivityTracker /> : <AuthPage />}
      </Route>
      <Route path="/billing">
        {() => user ? <Billing /> : <AuthPage />}
      </Route>
      <Route path="/subscribe">
        {() => user ? <Subscribe /> : <AuthPage />}
      </Route>
      <Route path="/invite">
        {() => user ? <Invite /> : <AuthPage />}
      </Route>
      <Route path="/leaderboard">
        {() => user ? <Leaderboard /> : <AuthPage />}
      </Route>
      <Route path="/rankings">
        {() => user ? <Rankings /> : <AuthPage />}
      </Route>
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/share-achievement">
        {() => user ? <ShareAchievement /> : <AuthPage />}
      </Route>
      <Route path="/admin">
        {() => user ? <Admin /> : <AuthPage />}
      </Route>
      <Route path="/terms" component={TermsOfService} />
      <Route path="/terms-and-privacy" component={TermsAndPrivacy} />
      <Route path="/adaptive-difficulty" component={AdaptiveDifficultyDemo} />
      <Route path="/parent-consent/:userId/:token" component={lazy(() => import("./pages/parent-consent"))} />
      
      {/* Default route */}
      <Route>
        {() => user ? <Home /> : <LandingPage />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionErrorHandler />
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
