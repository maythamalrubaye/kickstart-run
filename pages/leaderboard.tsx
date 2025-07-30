import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['/api/leaderboard', user?.schoolClub],
    queryFn: () => user?.schoolClub ? 
      fetch(`/api/leaderboard/${encodeURIComponent(user.schoolClub)}`).then(res => res.json()) : 
      Promise.resolve([]),
    enabled: !!user?.schoolClub,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-bold text-lg">Leaderboard</h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <Logo size="small" variant="icon" />
          </div>
        </div>
      </header>

      <main className="p-4">
        {user?.schoolClub ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">{user.schoolClub}</h2>
              <p className="text-muted-foreground">School/Club Rankings</p>
            </div>

            <Card>
              <CardContent className="p-6">
                {leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.map((entry: any, index: number) => (
                      <div 
                        key={entry.userId}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          entry.userId === user.id ? 'bg-primary/10 border-primary border' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-muted-foreground text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{entry.athleteName}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.totalPoints} points
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{entry.challengesCompleted}</p>
                          <p className="text-xs text-muted-foreground">challenges</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-trophy text-muted-foreground text-2xl"></i>
                    </div>
                    <h3 className="font-semibold mb-2">No Rankings Yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      School leaderboards show your school's ranking and total points
                    </p>
                    <Button onClick={() => setLocation('/invite')}>
                      <i className="fas fa-user-plus mr-2"></i>
                      Invite Friends
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-school text-muted-foreground text-2xl"></i>
            </div>
            <h3 className="font-semibold mb-2">No School/Club Set</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your school or club to compete on leaderboards
            </p>
            <Button onClick={() => setLocation('/billing')}>
              <i className="fas fa-edit mr-2"></i>
              Update Profile
            </Button>
          </div>
        )}

        {/* Global Stats */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Global Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">2,847</p>
                <p className="text-xs text-muted-foreground">Total Athletes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">15,392</p>
                <p className="text-xs text-muted-foreground">Runs Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">234</p>
                <p className="text-xs text-muted-foreground">Schools/Clubs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">12.4K</p>
                <p className="text-xs text-muted-foreground">Miles Run</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Navigation />
    </div>
  );
}