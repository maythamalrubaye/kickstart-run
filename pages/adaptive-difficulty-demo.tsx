import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, TrendingDown, Target, Clock, User } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { apiRequest } from "@/lib/queryClient";

export default function AdaptiveDifficultyDemo() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);

  const { data: userChallenges = [] } = useQuery({
    queryKey: ['/api/challenges'],
  });

  const { data: adaptiveSettings } = useQuery({
    queryKey: ['/api/challenges', selectedChallengeId, 'adaptive-difficulty'],
    queryFn: () => apiRequest("GET", `/api/challenges/${selectedChallengeId}/adaptive-difficulty`),
    enabled: !!selectedChallengeId,
  });

  const mockUserAnalytics = {
    avgCompletionRate: 85,
    avgAttemptCount: 1.2,
    recentPerformanceTrend: "improving",
    totalChallengesCompleted: 12,
    totalChallengesAttempted: 15,
    adaptiveLevel: 1.15
  };

  const mockPerformanceHistory = [
    { week: "Week 1", completionRate: 60, difficulty: 1.0 },
    { week: "Week 2", completionRate: 75, difficulty: 1.1 },
    { week: "Week 3", completionRate: 80, difficulty: 1.2 },
    { week: "Week 4", completionRate: 85, difficulty: 1.3 },
  ];

  const availableChallenges = userChallenges.filter((uc: any) => 
    uc.status === 'available' || uc.status === 'in_progress'
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Adaptive Difficulty</h1>
              <p className="text-sm text-muted-foreground">Personalized Challenge Progression</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-xl font-bold">{mockUserAnalytics.avgCompletionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance Trend</p>
                  <p className="text-xl font-bold capitalize">{mockUserAnalytics.recentPerformanceTrend}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adaptive Level</p>
                  <p className="text-xl font-bold">{mockUserAnalytics.adaptiveLevel}x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges">Smart Challenges</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="system">How It Works</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Adaptive Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableChallenges.length > 0 ? (
                  availableChallenges.map((uc: any) => (
                    <div 
                      key={uc.challengeId} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedChallengeId === uc.challengeId ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedChallengeId(uc.challengeId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{uc.challenge.title}</h3>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{uc.challenge.difficulty}</Badge>
                          {uc.challenge.adaptiveSettings && (
                            <Badge variant={uc.challenge.adaptiveSettings.difficultyMultiplier > 1.0 ? 'destructive' : 'default'}>
                              {uc.challenge.adaptiveSettings.difficultyMultiplier > 1.0 ? 'Harder' : 'Easier'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{uc.challenge.description}</p>
                      
                      {uc.challenge.adaptiveSettings && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-200">
                            <strong>AI Adaptation:</strong> {uc.challenge.adaptiveSettings.reasoning}
                          </p>
                          
                          {uc.challenge.adaptiveSettings.adaptedTargetDistance && (
                            <div className="flex items-center justify-between mt-2 text-xs">
                              <span>Adapted Distance:</span>
                              <span className="font-medium">
                                {uc.challenge.adaptiveSettings.adaptedTargetDistance} km 
                                <span className="text-muted-foreground ml-1">
                                  (was {uc.challenge.targetDistance} km)
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No adaptive challenges available. Complete some challenges to see AI-powered adaptations!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Challenge Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed</span>
                        <span className="font-medium">{mockUserAnalytics.totalChallengesCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Attempted</span>
                        <span className="font-medium">{mockUserAnalytics.totalChallengesAttempted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Attempts</span>
                        <span className="font-medium">{mockUserAnalytics.avgAttemptCount}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Progress Trend</h4>
                    <div className="space-y-2">
                      {mockPerformanceHistory.map((week, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <span className="text-xs w-16">{week.week}</span>
                          <Progress value={week.completionRate} className="flex-1" />
                          <span className="text-xs w-8">{week.completionRate}%</span>
                          <Badge variant="outline" className="text-xs">
                            {week.difficulty}x
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>How Adaptive Difficulty Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Performance Factors</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span><strong>Completion Rate:</strong> How often you complete challenges successfully</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span><strong>Attempt Pattern:</strong> How many tries it takes to complete challenges</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <span><strong>Performance Trend:</strong> Whether you're improving or struggling recently</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <span><strong>Age Group:</strong> Age-appropriate difficulty scaling for youth athletes</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>AI Adaptations</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                        <span><strong>High Performance:</strong> Increases challenge difficulty for continued growth</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <TrendingDown className="w-4 h-4 text-red-500 mt-0.5" />
                        <span><strong>Struggling:</strong> Reduces difficulty to build confidence and skills</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span><strong>Personalized Targets:</strong> Adjusts distance and time goals based on ability</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Clock className="w-4 h-4 text-purple-500 mt-0.5" />
                        <span><strong>Progressive Loading:</strong> Gradually increases challenge complexity</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Safety & Age Considerations</h5>
                  <p className="text-sm text-muted-foreground">
                    The adaptive system ensures age-appropriate challenges for youth athletes (6-18 years). 
                    Elementary athletes (6-8) receive gentler progressions, while high school athletes (13-18) 
                    can handle more challenging adaptations. All adjustments stay within safe training bounds.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  );
}