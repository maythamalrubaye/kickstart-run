import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { TrialBanner } from "@/components/trial-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: achievements = [] } = useQuery<any[]>({
    queryKey: ['/api/achievements'],
  });

  const { data: userChallenges = [] } = useQuery<any[]>({
    queryKey: ['/api/challenges'],
  });

  const { data: userRank } = useQuery<any>({
    queryKey: ['/api/user-rank'],
  });

  // Calculate stats
  const completedChallenges = userChallenges.filter((uc: any) => uc.status === 'completed');
  const inProgressChallenges = userChallenges.filter((uc: any) => uc.status === 'in_progress');
  const totalPoints = userRank?.totalPoints || 0;
  const currentRank = userRank?.rank || 'Unranked';

  // Get next available challenge
  const nextChallenge = userChallenges.find((uc: any) => uc.status === 'available');

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
              <h1 className="font-bold text-lg">KickStart Run</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user?.athleteName}!</p>
            </div>
          </div>

        </div>
      </header>

      <TrialBanner />

      {/* Main Dashboard Content */}
      <main className="p-4 pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">#{currentRank}</div>
              <div className="text-sm text-muted-foreground">Your Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-600">{completedChallenges.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">{inProgressChallenges.length}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{achievements.length}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Challenge */}
        {nextChallenge && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Up Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{nextChallenge.challenge?.title}</h3>
                  <p className="text-sm text-muted-foreground">{nextChallenge.challenge?.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {nextChallenge.challenge?.targetDistance && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {nextChallenge.challenge.targetDistance}km
                      </span>
                    )}
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {nextChallenge.challenge?.pointsReward} points
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => setLocation('/challenges')}
                  className="ml-4"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => setLocation('/activity')}
            className="h-20 flex-col space-y-2"
            variant="outline"
          >
            <i className="fas fa-running text-2xl text-primary"></i>
            <span>Start Running</span>
          </Button>
          <Button 
            onClick={() => setLocation('/adaptive-difficulty')}
            className="h-20 flex-col space-y-2 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
            variant="outline"
          >
            <i className="fas fa-brain text-2xl text-primary"></i>
            <span>AI Difficulty</span>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => setLocation('/rankings')}
            className="h-16 flex-col space-y-1"
            variant="outline"
          >
            <i className="fas fa-trophy text-xl text-primary"></i>
            <span className="text-sm">View Rankings</span>
          </Button>
          <Button 
            onClick={() => setLocation('/challenges')}
            className="h-16 flex-col space-y-1"
            variant="outline"
          >
            <i className="fas fa-medal text-xl text-primary"></i>
            <span className="text-sm">All Challenges</span>
          </Button>
        </div>
      </main>

      <Navigation />
    </div>
  );
}