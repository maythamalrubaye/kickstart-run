import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdaptiveDifficultyIndicator } from "@/components/AdaptiveDifficultyIndicator";
import { Navigation } from "@/components/navigation";
import { Brain, TrendingUp, Target, Users, Zap, BookOpen } from "lucide-react";

export default function AdaptiveDifficultyDemo() {
  const { user } = useAuth();

  const { data: challenges = [] } = useQuery<any[]>({
    queryKey: ['/api/challenges'],
  });

  const { data: userAnalytics } = useQuery({
    queryKey: ['/api/user-analytics'],
  });

  const { data: userChallenges = [] } = useQuery<any[]>({
    queryKey: ['/api/user-challenges'],
  });

  const availableChallenges = challenges.filter(c => c.isActive);
  const sampleChallenges = availableChallenges.slice(0, 3);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white dark:bg-card shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Adaptive Difficulty</h1>
              <p className="text-xs text-muted-foreground">Personalized Challenge System</p>
            </div>
          </div>

        </div>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {/* Introduction */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              Adaptive Difficulty Challenge Scaling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI system analyzes your performance patterns, age-appropriate scaling, and challenge completion rates 
              to create personalized difficulty adjustments that keep you motivated and progressing safely.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-medium">Personalized</div>
                <div className="text-xs text-muted-foreground">Targets</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs font-medium">Performance</div>
                <div className="text-xs text-muted-foreground">Analytics</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-xs font-medium">Age-Appropriate</div>
                <div className="text-xs text-muted-foreground">Scaling</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-xs font-medium">Real-Time</div>
                <div className="text-xs text-muted-foreground">Adaptation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="live-examples" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live-examples">Live Examples</TabsTrigger>
            <TabsTrigger value="analytics">Your Analytics</TabsTrigger>
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          </TabsList>

          {/* Live Examples Tab */}
          <TabsContent value="live-examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Personalized Challenges</CardTitle>
                <p className="text-sm text-muted-foreground">
                  See how AI adapts each challenge specifically for your performance level and age group.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleChallenges.length > 0 ? (
                  sampleChallenges.map((challenge: any) => (
                    <Card key={challenge.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{challenge.title}</h3>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {challenge.type}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Original Target:</span>
                            <span>
                              {challenge.targetDistance && `${challenge.targetDistance}km`}
                              {challenge.targetTime && ` • ${Math.floor(challenge.targetTime / 60)}:${(challenge.targetTime % 60).toString().padStart(2, '0')}`}
                            </span>
                          </div>
                          
                          <AdaptiveDifficultyIndicator
                            challengeId={challenge.id}
                            originalDistance={challenge.targetDistance ? parseFloat(challenge.targetDistance) : undefined}
                            originalTime={challenge.targetTime}
                            showDetails={true}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No challenges available for demonstration.</p>
                    <p className="text-xs">Complete your profile setup to see personalized examples.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Analytics Dashboard</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your personal performance metrics that drive adaptive difficulty calculations.
                </p>
              </CardHeader>
              <CardContent>
                {userAnalytics ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(userAnalytics as any).avgCompletionRate || 0}%
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          Completion Rate
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(userAnalytics as any).avgAttemptCount || 0}
                        </div>
                        <div className="text-sm text-green-800 dark:text-green-200">
                          Avg Attempts
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {(userAnalytics as any).adaptiveLevel || 1.0}x
                        </div>
                        <div className="text-sm text-purple-800 dark:text-purple-200">
                          Current Level
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 capitalize">
                          {(userAnalytics as any).recentPerformanceTrend || 'stable'}
                        </div>
                        <div className="text-sm text-orange-800 dark:text-orange-200">
                          Trend
                        </div>
                      </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Challenge Completion Progress</span>
                          <span>{(userAnalytics as any).avgCompletionRate || 0}%</span>
                        </div>
                        <Progress value={parseFloat((userAnalytics as any).avgCompletionRate || '0')} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="text-lg font-semibold">{(userAnalytics as any).totalChallengesCompleted || 0}</div>
                          <div className="text-sm text-muted-foreground">Challenges Completed</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="text-lg font-semibold">{(userAnalytics as any).totalChallengesAttempted || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Attempts</div>
                        </div>
                      </div>
                    </div>

                    {/* Adaptive Insights */}
                    <Card className="border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          AI Insights for Your Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <strong>Performance Level:</strong> Based on your {(userAnalytics as any).avgCompletionRate || 0}% completion rate, 
                          you're performing {parseFloat((userAnalytics as any).avgCompletionRate || '0') >= 80 ? 'excellently' : 
                                          parseFloat((userAnalytics as any).avgCompletionRate || '0') >= 60 ? 'well' : 'steadily'} 
                          and challenges will be adjusted accordingly.
                        </div>
                        <div className="text-sm">
                          <strong>Age Group:</strong> As a {user?.age}-year-old athlete, your challenges include 
                          age-appropriate scaling for safe and effective progression.
                        </div>
                        <div className="text-sm">
                          <strong>Current Trend:</strong> Your recent performance is trending {(userAnalytics as any).recentPerformanceTrend || 'stable'}, 
                          so difficulty adjustments will {(userAnalytics as any).recentPerformanceTrend === 'improving' ? 'gradually increase' : 
                                                        (userAnalytics as any).recentPerformanceTrend === 'declining' ? 'provide more support' : 
                                                        'maintain current progression'}.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No performance data available yet.</p>
                    <p className="text-xs">Complete some challenges to see your analytics dashboard.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* How It Works Tab */}
          <TabsContent value="how-it-works" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adaptive Difficulty Algorithm</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Understanding how our AI creates personalized challenges for optimal youth development.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Algorithm Steps */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Performance Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        AI analyzes your completion rates, attempt patterns, and recent performance trends 
                        to understand your current capability level.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Age-Appropriate Scaling</h3>
                      <p className="text-sm text-muted-foreground">
                        Challenges are automatically scaled based on your age group: Elementary (6-8) gets 0.7x scaling, 
                        Middle School (9-12) gets 0.9x, and High School (13-18) gets 1.1x for safe progression.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Challenge Type Optimization</h3>
                      <p className="text-sm text-muted-foreground">
                        Different scaling approaches for distance (standard), drill (technique focus), 
                        form (learning emphasis), and endurance (gradual building) challenges.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-orange-600">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Real-Time Adaptation</h3>
                      <p className="text-sm text-muted-foreground">
                        Difficulty multiplier is calculated (0.5x to 2.0x range) and applied to distance and time targets, 
                        with clear explanations for each adjustment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Difficulty Ranges */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Difficulty Adjustment Ranges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            Challenge+ (1.3x+)
                          </span>
                          <span>High performers</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            Enhanced (1.1x-1.3x)
                          </span>
                          <span>Good progress</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded"></div>
                            Standard (0.9x-1.1x)
                          </span>
                          <span>Average pace</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            Guided (0.7x-0.9x)
                          </span>
                          <span>Building skills</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            Adapted (0.5x-0.7x)
                          </span>
                          <span>Extra support</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Benefits for Young Athletes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span>Prevents frustration and burnout</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span>Maintains optimal challenge level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Age-appropriate progression</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span>Builds confidence and skills</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Navigation />
    </div>
  );
}