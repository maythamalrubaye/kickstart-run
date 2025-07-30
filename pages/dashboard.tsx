import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrialBanner } from "@/components/trial-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { ParentEmailModal } from "@/components/ParentEmailModal";
import { Logo } from "@/components/Logo";
import { TrackDesign, TrackCard } from "@/components/TrackDesign";
import { Shield, AlertTriangle } from "lucide-react";
import React from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showParentEmailModal, setShowParentEmailModal] = useState(false);

  // Check COPPA compliance for under-13 users
  const needsParentEmail = user && user.age < 13 && (!user.parentEmail || user.parentEmail === '');
  
  // Show modal automatically if user needs parent email
  React.useEffect(() => {
    if (needsParentEmail) {
      setShowParentEmailModal(true);
    }
  }, [needsParentEmail]);
  
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
    <div className="min-h-screen bg-surface relative">
      {/* Track background pattern */}
      <TrackDesign variant="background" />
      
      {/* Mobile Header */}
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40 relative">
        <TrackDesign variant="header" className="absolute inset-0" />
        <div className="flex items-center justify-between p-4 relative z-10">
          <div className="flex items-center space-x-3">
            <Logo size="medium" variant="icon" />
            <div>
              <h1 className="font-bold text-lg">KickStart Run</h1>
              <p className="text-xs text-muted-foreground">{user?.athleteName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/share-achievement')}
              className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary"
            >
              <i className="fas fa-share-alt text-sm"></i>
              <span>Share</span>
            </Button>
            <button 
              onClick={() => setLocation('/profile')}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
              title="Profile & Logout"
            >
              <i className="fas fa-user text-white text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      <TrialBanner />
      
      {/* COPPA Compliance Alert */}
      {needsParentEmail && (
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-4 mx-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                COPPA Compliance Required
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                A parent or guardian email is required for users under 13. Please provide parental consent to continue using all features.
              </p>
              <Button
                size="sm"
                onClick={() => setShowParentEmailModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Add Parent Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Dedicated Sharing Page */}
      <main className="p-4 pb-20">
        {hasShareableContent ? (
          <>
            {/* Header Section */}
            <section className="mb-8 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-share-alt text-3xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold mb-2">Share Your Success!</h1>
              <p className="text-muted-foreground">
                Show off your achievements and inspire others in the youth running community
              </p>
            </section>

            {/* Recent Achievements to Share */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Latest Achievements</h2>
              <div className="space-y-4">
                {recentAchievements.map((item: any, index: number) => (
                  <TrackCard key={index} className="hover:shadow-lg transition-shadow cursor-pointer" 
                        onClick={() => setLocation(`/share-achievement?${item.challenge ? 'challenge' : 'achievement'}=${item.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                          <i className="fas fa-trophy text-white text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title || item.challenge?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.description || item.challenge?.description}
                          </p>
                          {item.challenge && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Challenge Complete
                              </span>
                              <span className="text-xs text-muted-foreground">
                                +{item.challenge.points} points
                              </span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          <i className="fas fa-share text-primary"></i>
                        </Button>
                      </div>
                    </CardContent>
                  </TrackCard>
                ))}
              </div>
            </section>

            {/* Quick Share Actions */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Quick Share</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="h-24 flex flex-col space-y-2"
                  onClick={() => setLocation('/share-achievement')}
                >
                  <i className="fas fa-camera text-2xl"></i>
                  <span>Create Achievement Post</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col space-y-2"
                  onClick={() => setLocation('/share-achievement?type=ranking')}
                >
                  <i className="fas fa-medal text-2xl"></i>
                  <span>Share Your Ranking</span>
                </Button>
              </div>
            </section>

            {/* Your Stats Preview */}
            <section>
              <TrackCard>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Performance</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{completedChallenges.length}</div>
                      <p className="text-sm text-muted-foreground">Challenges</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{userRank?.totalPoints || 0}</div>
                      <p className="text-sm text-muted-foreground">Points</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">#{userRank?.rank || 'N/A'}</div>
                      <p className="text-sm text-muted-foreground">Rank</p>
                    </div>
                  </div>
                </CardContent>
              </TrackCard>
            </section>
          </>
        ) : (
          /* Motivational Section for No Achievements */
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-running text-4xl text-gray-500 dark:text-gray-400"></i>
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ready to Run?
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Start your first GPS-tracked run to unlock achievements and compete with runners in your area!
            </p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => setLocation('/challenges')}
              >
                <i className="fas fa-trophy mr-2"></i>
                Start Your First Challenge
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => setLocation('/rankings')}
              >
                <i className="fas fa-medal mr-2"></i>
                View Rankings
              </Button>
            </div>

            {/* Motivational Tips */}
            <div className="mt-12 grid gap-4 max-w-md mx-auto">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-lightbulb text-blue-500"></i>
                  <p className="text-sm font-medium">Complete any challenge to unlock sharing!</p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-users text-green-500"></i>
                  <p className="text-sm font-medium">Join your school's leaderboard and compete!</p>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-star text-purple-500"></i>
                  <p className="text-sm font-medium">Earn achievements and show your progress!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Navigation />
      
      {/* COPPA Compliance Modal */}
      {user && (
        <ParentEmailModal 
          isOpen={showParentEmailModal}
          onClose={() => setShowParentEmailModal(false)}
          childName={user.athleteName || 'User'}
          childAge={user.age || 0}
        />
      )}
    </div>
  );
}