import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle, PlayCircle, Trophy, Target, Zap, Timer, Repeat, MapPin, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { TrackDesign, TrackCard } from "@/components/TrackDesign";
import { Logo } from "@/components/Logo";
import { AdaptiveDifficultyIndicator } from "@/components/AdaptiveDifficultyIndicator";

export default function Challenges() {
  const { data: userChallenges, isLoading, error } = useQuery({
    queryKey: ["/api/challenges"],
    queryFn: async () => {

      const res = await fetch("/api/challenges", {
        credentials: "include",
      });

      
      if (res.status === 401) {
        // Don't throw on 401, let the backend handle it with default user
      }
      
      if (!res.ok && res.status !== 401) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0
  });


  
  // Helper function to determine if a challenge should have manual completion
  const isManualCompletionChallenge = (challenge: any) => {
    return challenge.type === 'form' || challenge.type === 'drill';
  };

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const markDoneMutation = useMutation({
    mutationFn: (challengeId: number) => 
      apiRequest("POST", `/api/challenges/${challengeId}/mark-done`),
    onSuccess: async (data) => {
      const responseData = await data.json();
      toast({
        title: "Challenge Completed!",
        description: responseData.message || "Great work! Badge earned.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to mark challenge as done",
        variant: "destructive",
      });
    },
  });

  const markChallengeAsDone = (challengeId: number) => {
    markDoneMutation.mutate(challengeId);
  };

  const startChallenge = (challengeId: number, challengeType: string) => {
    if (challengeType === 'distance' || challengeType === 'endurance') {
      // For distance/endurance challenges, go to GPS tracker for measurement
      setLocation(`/activity?challengeId=${challengeId}`);
    } else if (challengeType === 'form' || challengeType === 'drill') {
      // For form/drill challenges, immediately complete since they're technique-based
      toast({
        title: "Form Challenge Started!",
        description: "Focus on proper technique during your practice. Mark as done when complete.",
      });
      // Mark as in progress to show the "Mark Done" button
      // This would require a new API endpoint, but for now we'll go to activity tracker
      setLocation(`/activity?challengeId=${challengeId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userChallenges || !Array.isArray(userChallenges) || userChallenges.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Challenges & Badges</h1>
            <p className="text-muted-foreground">
              Earn badges by completing age-appropriate running challenges
            </p>
          </div>
          <Card className="text-center p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Challenges Available</h3>
            <p className="text-muted-foreground mb-4">
              Challenges are being set up for your age group. Check back soon!
            </p>
          </Card>
        </div>
        <Navigation />
      </div>
    );
  }

  const getChallengesByType = (type: string) => {
    return Array.isArray(userChallenges) ? userChallenges.filter((uc: any) => uc.challenge && uc.challenge.type === type) : [];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-100';
      case 'medium': return 'bg-blue-200 text-blue-900 border-blue-300 dark:bg-blue-800 dark:text-blue-100';
      case 'hard': return 'bg-purple-200 text-purple-900 border-purple-300 dark:bg-purple-800 dark:text-purple-100';
      default: return 'bg-gray-200 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'available': return <PlayCircle className="w-4 h-4" />;
      case 'in_progress': return <Zap className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'distance': return <MapPin className="w-5 h-5" />;
      case 'drill': return <Repeat className="w-5 h-5" />;
      case 'form': return <Trophy className="w-5 h-5" />;
      case 'endurance': return <Timer className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const renderChallengeCard = (userChallenge: any) => {
    const challenge = userChallenge.challenge;
    if (!challenge) return null;
    const isLocked = userChallenge.status === 'locked';
    
    return (
      <TrackCard key={userChallenge.id} className={`relative transition-all duration-200 ${
        isLocked ? 'opacity-60' : 
        userChallenge.status === 'completed' ? 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-100/80 to-green-50/40 shadow-lg ring-1 ring-green-200' : 
        userChallenge.status === 'in_progress' ? 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent shadow-md' : 
        userChallenge.status === 'available' ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/40 to-transparent hover:shadow-lg hover:from-blue-50/60' :
        'border-l-4 border-l-gray-300 bg-gradient-to-r from-gray-50/30 to-transparent'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full transition-colors ${
                isLocked ? 'bg-muted' : 
                userChallenge.status === 'completed' ? 'bg-green-200 text-green-800' : 
                userChallenge.status === 'in_progress' ? 'bg-orange-200 text-orange-800' : 
                userChallenge.status === 'available' ? 'bg-blue-200 text-blue-800' : 'bg-primary/10'
              }`}>
                {getStatusIcon(userChallenge.status)}
              </div>
              <div>
                <CardTitle className={`text-base transition-colors ${
                  userChallenge.status === 'completed' ? 'text-green-900' : 
                  userChallenge.status === 'in_progress' ? 'text-orange-900' : 
                  userChallenge.status === 'available' ? 'text-blue-900' : 'text-foreground'
                }`}>{challenge.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="secondary" className={`text-xs font-medium ${
                    userChallenge.status === 'available' ? 'bg-blue-100 text-blue-800' :
                    userChallenge.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    userChallenge.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {challenge.pointsReward} pts
                  </Badge>
                </div>
              </div>
            </div>
            <div className={`transition-colors ${
              userChallenge.status === 'available' ? 'text-blue-600' :
              userChallenge.status === 'in_progress' ? 'text-orange-600' :
              userChallenge.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {getCategoryIcon(challenge.type)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {challenge.description}
          </p>

          {/* Adaptive Difficulty Indicator */}
          {userChallenge.status !== 'locked' && (
            <AdaptiveDifficultyIndicator 
              challengeId={challenge.id}
              originalDistance={challenge.targetDistance ? parseFloat(challenge.targetDistance) : undefined}
              originalTime={challenge.targetTime}
              showDetails={false}
            />
          )}
          
          {/* Show original targets for reference */}
          {challenge.targetDistance && (
            <div className="text-sm mb-2">
              <span className="font-medium">Distance:</span> {challenge.targetDistance} km
            </div>
          )}
          
          {challenge.targetTime && (
            <div className="text-sm mb-2">
              <span className="font-medium">Duration:</span> {Math.floor(challenge.targetTime / 60)} minutes
            </div>
          )}
          
          {userChallenge.status === 'in_progress' && (
            <div className="mt-3">
              <Progress value={30} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">In progress...</p>
            </div>
          )}
          
          {userChallenge.status === 'completed' && (
            <div className="mt-3">
              <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-semibold">Challenge Completed!</span>
                </div>
                <div className="text-xs text-green-700">
                  Earned {challenge.pointsReward} points • Badge unlocked
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setLocation(`/share-achievement?challenge=${challenge.id}&title=${encodeURIComponent(challenge.title)}`)}
              >
                <i className="fas fa-share-alt mr-2"></i>
                Share Badge
              </Button>
            </div>
          )}
          
          {userChallenge.status === 'available' && (
            <div className="flex flex-col gap-2 mt-3">
              {/* Form and drill challenges use simple mark done approach */}
              {(challenge.type === 'form' || challenge.type === 'drill') && (
                <div className="space-y-2">
                  <div className="text-sm text-blue-800 bg-blue-100 border border-blue-200 px-3 py-2 rounded-md flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    Practice this technique, then mark as done when complete
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    onClick={() => markChallengeAsDone(userChallenge.challengeId)}
                    disabled={markDoneMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Done
                  </Button>
                </div>
              )}
              {/* Distance and Endurance challenges auto-update via GPS runs */}
              {(challenge.type === 'distance' || challenge.type === 'endurance') && (
                <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Auto-completes when you reach the target during GPS runs
                </div>
              )}
            </div>
          )}
          
          {userChallenge.status === 'in_progress' && (
            <div className="mt-3">
              {/* Form and drill challenges in progress */}
              {(challenge.type === 'form' || challenge.type === 'drill') && (
                <div className="space-y-2">
                  <div className="text-sm text-orange-800 bg-orange-100 border border-orange-200 px-3 py-2 rounded-md flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-orange-600" />
                    Complete your technique practice, then mark as done
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    onClick={() => markChallengeAsDone(userChallenge.challengeId)}
                    disabled={markDoneMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                </div>
              )}
              {/* Distance and Endurance challenges auto-update via GPS runs */}
              {(challenge.type === 'distance' || challenge.type === 'endurance') && (
                <div className="text-sm text-muted-foreground bg-orange-50 px-3 py-2 rounded-md flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-orange-500" />
                  In progress - will complete automatically during your next GPS run
                </div>
              )}
            </div>
          )}
        </CardContent>
      </TrackCard>
    );
  };

  const getFormChallengeDescription = (title: string) => {
    const descriptions = {
      'Posture Pro': 'Focus on keeping your head up, shoulders relaxed, and body upright while running. Practice good posture for the entire duration.',
      'Breathing Buddy': 'Learn rhythmic breathing patterns - try breathing in for 2 steps, out for 2 steps. Focus on steady, controlled breathing.',
      'Stride Master': 'Work on taking consistent, efficient steps. Avoid overstriding - land with your foot under your body, not far ahead.',
      'Cadence Captain': 'Practice taking about 180 steps per minute (3 steps per second). Count your steps to maintain this rhythm.',
      'Running Efficiency': 'Combine all techniques - good posture, efficient stride, proper breathing, and smooth arm movement.',
      'Breathing Expert': 'Master advanced breathing techniques like 3:2 pattern (3 steps inhale, 2 steps exhale) for sustained efforts.'
    };
    return descriptions[title as keyof typeof descriptions] || 'Focus on proper running technique and form.';
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Track background pattern */}
      <TrackDesign variant="background" />
      
      {/* Header with Logo */}
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40 relative">
        <TrackDesign variant="header" className="absolute inset-0" />
        <div className="flex items-center justify-between p-4 relative z-10">
          <div className="flex items-center space-x-3">
            <Logo size="small" variant="icon" />
            <h1 className="font-bold text-lg">Challenges & Badges</h1>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Earn badges by completing age-appropriate running challenges
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1 bg-muted">
            <TabsTrigger value="all" className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">All</TabsTrigger>
            <TabsTrigger value="distance" className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">Distance</TabsTrigger>
            <TabsTrigger value="drill" className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">Drills</TabsTrigger>
            <TabsTrigger value="form" className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">Form</TabsTrigger>
            <TabsTrigger value="endurance" className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground">Endurance</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {Array.isArray(userChallenges) && userChallenges.map((uc: any) => renderChallengeCard(uc))}
            </div>
          </TabsContent>

          <TabsContent value="distance" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Distance Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Run these distances and badges are automatically earned! Multiple badges can be unlocked in one run.
              </p>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mt-3">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">GPS Auto-Complete Only:</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Distance challenges ONLY complete automatically when your GPS run reaches the target distance. 
                  No manual completion to ensure authentic, verified achievements.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {getChallengesByType('distance').map((uc: any) => renderChallengeCard(uc))}
            </div>
          </TabsContent>

          <TabsContent value="drill" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Drill Challenges</h3>
              <p className="text-sm text-muted-foreground">
                These challenges earn badges but don't count toward distance rankings. Focus on specific skills like hill running and speed work.
              </p>

            </div>
            <div className="grid gap-4">
              {getChallengesByType('drill').map((uc: any) => renderChallengeCard(uc))}
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Form & Technique Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Learn proper running form through focused practice sessions. These challenges help you run more efficiently and safely.
              </p>

            </div>
            <div className="grid gap-4">
              {getChallengesByType('form').map((uc: any) => {
                const modifiedChallenge = {
                  ...uc,
                  challenge: {
                    ...uc.challenge,
                    description: getFormChallengeDescription(uc.challenge.title)
                  }
                };
                return renderChallengeCard(modifiedChallenge);
              })}
            </div>
          </TabsContent>

          <TabsContent value="endurance" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Endurance Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Build consistency with frequency-based challenges. These focus on developing regular running habits.
              </p>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mt-3">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">GPS Auto-Complete:</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Endurance challenges automatically track your consistency through GPS runs over time. 
                  Multiple runs count toward completing these challenges.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {getChallengesByType('endurance').map((uc: any) => renderChallengeCard(uc))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </div>
  );
}