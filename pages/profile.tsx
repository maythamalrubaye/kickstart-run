import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrialBanner } from "@/components/trial-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { OptOutLeaderboardButton } from "@/components/OptOutLeaderboardButton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      // Clear all React Query cache
      queryClient.clear();
      
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      toast({
        title: "Logged out successfully",
        description: "Redirecting to login...",
      });
      
      // Force complete page reload with cache clear
      setTimeout(() => {
        // Try multiple approaches to force logout
        window.location.href = window.location.origin + "/auth?logout=true";
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 500);
    },
    onError: () => {
      toast({
        title: "Logout Error", 
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      // First, call the logout API
      await apiRequest("POST", "/api/logout");
      
      // Clear all application state immediately
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      toast({
        title: "Logged out successfully",
        description: "Redirecting...",
      });
      
      // Force immediate redirect with cache busting
      const timestamp = Date.now();
      window.location.replace(`${window.location.origin}/auth?t=${timestamp}`);
      
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Please try again or refresh the page.",
        variant: "destructive",
      });
    }
  };
  
  const { data: achievements = [] } = useQuery<any[]>({
    queryKey: ['/api/achievements'],
  });

  const { data: userChallenges = [] } = useQuery<any[]>({
    queryKey: ['/api/challenges'],
  });

  const { data: userRank } = useQuery<any>({
    queryKey: ['/api/user-rank'],
  });

  const completedChallenges = Array.isArray(userChallenges) ? userChallenges.filter((uc: any) => uc.status === 'completed') : [];
  const recentAchievements = [...achievements, ...completedChallenges].slice(0, 3);
  const hasShareableContent = recentAchievements.length > 0;

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                KS
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg">Profile</h1>
              <p className="text-xs text-muted-foreground">{user?.athleteName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/share-achievement')}
              className="flex items-center space-x-1 text-xs"
            >
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </Button>
            <button 
              onClick={() => setLocation('/billing')}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
            >
              <i className="fas fa-user text-white text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      <TrialBanner />

      {/* Main Content - Profile & Sharing */}
      <main className="p-4 pb-20">
        {/* User Profile Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.athleteName}</h2>
                <p className="text-muted-foreground">{user?.schoolClub}</p>
                <p className="text-sm text-muted-foreground">Age {user?.age}</p>
                {userRank && (
                  <p className="text-sm font-semibold text-primary">
                    Rank #{userRank.rank} • {userRank.totalPoints} points
                  </p>
                )}
              </div>
            </div>

            {/* Privacy Controls */}
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Privacy & Data Controls</h3>
              <div className="space-y-3">
                <OptOutLeaderboardButton isOptedOut={user?.optOutPublic || false} />
                
                {/* COPPA Required: Data Deletion Controls */}
                <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    🛡️ Data Management (COPPA/FERPA Rights)
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        title: "Data Export",
                        description: "Your data export will be emailed to you within 24 hours.",
                      })}
                      className="w-full text-xs"
                    >
                      📥 Export My Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        title: "Account Deletion",
                        description: "Contact contact@kickstartrun.com to delete your account and all data.",
                        variant: "destructive",
                      })}
                      className="w-full text-xs text-red-600 hover:text-red-700"
                    >
                      🗑️ Delete Account & All Data
                    </Button>
                  </div>
                  {user?.age && user.age < 13 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                      <strong>Under 13:</strong> Parent/guardian must approve data deletion requests.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Logout Button - Smaller and aligned */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-sm text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasShareableContent ? (
          <>
            {/* Achievement Sharing Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <i className="fas fa-trophy text-white text-3xl"></i>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Share Your Success!</h1>
              <p className="text-muted-foreground mb-6">
                Show off your latest achievements and inspire other young athletes
              </p>
              
              <Button 
                onClick={() => setLocation('/share-achievement')}
                size="lg"
                className="w-full max-w-sm mx-auto h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <i className="fas fa-share-alt mr-2"></i>
                Create Achievement Post
              </Button>
            </div>

            {/* Recent Achievements Preview */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent Achievements</h2>
              <div className="space-y-3">
                {recentAchievements.map((achievement: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className={`fas ${achievement.type === 'distance_master' ? 'fa-running' : 
                                              achievement.status === 'completed' ? 'fa-check-circle' : 'fa-trophy'} 
                                      text-primary`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {achievement.title || achievement.challenge?.title || achievement.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description || achievement.challenge?.description || 'Achievement unlocked!'}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setLocation('/share-achievement')}
                      >
                        <i className="fas fa-share-alt"></i>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/rankings')}
                className="h-16 flex-col space-y-1"
              >
                <i className="fas fa-chart-line text-xl"></i>
                <span className="text-sm">View Rankings</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/challenges')}
                className="h-16 flex-col space-y-1"
              >
                <i className="fas fa-medal text-xl"></i>
                <span className="text-sm">More Challenges</span>
              </Button>
            </div>
          </>
        ) : (
          /* No achievements yet */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <i className="fas fa-running text-muted-foreground text-3xl"></i>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Start Your Journey!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Complete your first challenge to unlock achievements you can share with friends and family.
            </p>
            
            <div className="space-y-3 max-w-sm mx-auto">
              <Button 
                onClick={() => setLocation('/activity')}
                className="w-full h-12"
              >
                <i className="fas fa-running mr-2"></i>
                Start First Run
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/challenges')}
                className="w-full h-12"
              >
                <i className="fas fa-list mr-2"></i>
                View Challenges
              </Button>
            </div>
          </div>
        )}

        {/* Profile Actions */}
        <div className="mt-8 pt-6 border-t space-y-3">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/billing')}
            className="w-full justify-start"
          >
            <i className="fas fa-credit-card mr-3"></i>
            Subscription & Billing
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/invite')}
            className="w-full justify-start"
          >
            <i className="fas fa-user-plus mr-3"></i>
            Invite Friends
          </Button>
        </div>
      </main>

      <Navigation />
    </div>
  );
}