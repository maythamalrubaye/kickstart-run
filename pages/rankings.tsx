import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Logo } from "@/components/Logo";
import { TrackDesign, TrackCard } from "@/components/TrackDesign";

type TabType = 'individual' | 'schools' | 'age-groups';
type RankingType = 'all-time' | 'annual';

export default function RankingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  const [rankingType, setRankingType] = useState<RankingType>('annual');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const { data: userRank, isLoading: userRankLoading } = useQuery({
    queryKey: ['/api/user-rank'],
    enabled: !!user,
  });

  // Global rankings for all athletes
  const { data: globalRankings = [], isLoading: globalRankingsLoading } = useQuery({
    queryKey: ['/api/global-rankings'],
    enabled: activeTab === 'individual',
    refetchInterval: 30000,
  });

  const { data: schoolRankings = [], isLoading: schoolRankingsLoading } = useQuery({
    queryKey: ['/api/complete-school-rankings'],
    enabled: activeTab === 'schools',
    refetchInterval: 30000,
  });

  const { data: ageGroupRankings = [], isLoading: ageGroupRankingsLoading } = useQuery({
    queryKey: ['/api/age-group-rankings'],
    enabled: activeTab === 'age-groups',
    refetchInterval: 30000,
  });

  // Age group categories
  const getAgeGroup = (age: number) => {
    if (age >= 6 && age <= 8) return 'Elementary (6-8)';
    if (age >= 9 && age <= 12) return 'Middle School (9-12)';
    if (age >= 13 && age <= 18) return 'High School (13-18)';
    return 'Other';
  };

  const currentUserAgeGroup = user?.age ? getAgeGroup(user.age) : 'Other';

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2023; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    if (rank <= 10) return 'bg-blue-500 text-white';
    if (rank <= 25) return 'bg-green-500 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return 'fas fa-trophy text-yellow-500';
    if (rank === 2) return 'fas fa-medal text-gray-400';
    if (rank === 3) return 'fas fa-medal text-amber-600';
    return 'fas fa-award text-gray-400';
  };

  const renderUserRankCard = () => {
    if (!userRank || userRankLoading) return null;

    return (
      <TrackCard className="mb-6 bg-gradient-to-r from-primary to-accent text-white">
        <CardContent className="p-4">
          {/* Mobile-First Layout */}
          <div className="flex items-start space-x-3">
            {/* Trophy Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <i className={`${getTrophyIcon((userRank as any)?.rank || 99)} text-lg sm:text-xl text-white`}></i>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top Row: Name and Age Group */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-base sm:text-lg font-bold truncate">{user?.athleteName}</h3>
                  <p className="opacity-90 text-xs sm:text-sm truncate">{user?.schoolClub}</p>
                </div>
                <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold flex-shrink-0">
                  {currentUserAgeGroup}
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg sm:text-xl font-bold">#{(userRank as any)?.rank || '99'}</span>
                    <span className="text-xs opacity-75">Rank</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg sm:text-xl font-bold">{(userRank as any)?.totalPoints || 0}</span>
                    <span className="text-xs opacity-75">Points</span>
                  </div>
                </div>
                
                {/* Share Button */}
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                  onClick={() => window.location.href = '/share-achievement'}
                >
                  <i className="fas fa-share mr-1"></i>
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </TrackCard>
    );
  };

  const renderRankingsList = (rankings: any[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const filteredRankings = Array.isArray(rankings) ? rankings.filter((athlete: any) => {
      if (!searchTerm) return true;
      const athleteName = athlete.athlete_name || athlete.athleteName || '';
      const schoolClub = athlete.school_club || athlete.schoolClub || '';
      return athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             schoolClub.toLowerCase().includes(searchTerm.toLowerCase());
    }) : [];

    return (
      <div className="space-y-3">
        {filteredRankings.map((athlete: any, index: number) => {
          const isCurrentUser = user && athlete.id === user.id;
          return (
            <div 
              key={athlete.id || index}
              className={`p-3 sm:p-4 rounded-lg border transition-all ${
                isCurrentUser 
                  ? 'bg-primary/5 border-primary shadow-md' 
                  : 'bg-white dark:bg-card border-border hover:shadow-sm'
              }`}
            >
              {/* Mobile-First Responsive Layout */}
              <div className="flex items-start space-x-3">
                {/* Rank Badge - Fixed Size */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${getRankBadgeColor(athlete.overall_rank || athlete.rank || index + 1)}`}>
                  {athlete.overall_rank || athlete.rank || index + 1}
                </div>
                
                {/* Main Content - Flexible */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Name, Badges, and Points */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      {/* Name and Badges Row */}
                      <div className="flex items-center space-x-1 mb-1">
                        <h4 className="font-bold text-sm sm:text-base text-foreground truncate flex-shrink">
                          {athlete.athlete_name || athlete.athleteName}
                        </h4>
                        {isCurrentUser && (
                          <span className="bg-primary text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                            YOU
                          </span>
                        )}
                        {athlete.yearJoined === new Date().getFullYear() && (
                          <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      
                      {/* School/Organization */}
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {athlete.school_club || athlete.schoolClub}
                      </p>
                    </div>
                    
                    {/* Points Column - Always Visible */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-bold text-primary leading-tight">
                        {athlete.total_points || athlete.totalPoints || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>
                  
                  {/* Bottom Row: Activities and Point System */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>GPS Activities: {athlete.activities_completed || 0}</span>
                    <span className="hidden sm:inline text-xs">1 km = 1 point</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (userRankLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20 relative">
      {/* Track background pattern */}
      <TrackDesign variant="background" />
      
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40 relative">
        <TrackDesign variant="header" className="absolute inset-0" />
        <div className="flex items-center justify-between p-4 relative z-10">
          <div className="flex items-center space-x-3">
            <Logo size="small" variant="icon" />
            <h1 className="font-bold text-lg">Rankings</h1>
          </div>

        </div>
      </header>

      <main className="p-4">
        {/* User Rank Card */}
        {renderUserRankCard()}

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-white dark:bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'schools'
                  ? 'bg-white dark:bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              School/Club
            </button>
            <button
              onClick={() => setActiveTab('age-groups')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'age-groups'
                  ? 'bg-white dark:bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Age Groups
            </button>
          </div>

          {/* Time Period Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={rankingType} onValueChange={(value) => setRankingType(value as RankingType)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual ({selectedYear})</SelectItem>
                  <SelectItem value="all-time">All-Time</SelectItem>
                </SelectContent>
              </Select>
              
              {rankingType === 'annual' && (
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Input
              placeholder="Search athletes or schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Rankings Content */}
          {activeTab === 'individual' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Individual Athletes Leaderboard
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Rankings based on GPS-verified running activities. 1 meter = 1 point
                </p>
              </CardHeader>
              <CardContent>
                {renderRankingsList(globalRankings as any[], globalRankingsLoading)}
              </CardContent>
            </Card>
          )}

          {activeTab === 'schools' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  School & Club Rankings ({rankingType === 'annual' ? selectedYear : 'All-Time'})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Schools and clubs ranked by student points - every athlete contributes to their organization's success!
                  {rankingType === 'annual' && ` Rankings for ${selectedYear}.`}
                </p>
              </CardHeader>
              <CardContent>
                {renderRankingsList(schoolRankings as any[], schoolRankingsLoading)}
              </CardContent>
            </Card>
          )}

          {activeTab === 'age-groups' && (
            <div className="space-y-4">
              {[
                { key: 'elementary', label: 'Elementary (6-8)', icon: '🌱' },
                { key: 'middle', label: 'Middle School (9-12)', icon: '🎯' },
                { key: 'high', label: 'High School (13-18)', icon: '🏃‍♂️' }
              ].map((ageGroup) => {
                const groupData = (ageGroupRankings as any)?.[ageGroup.key] || { rankings: [], isActive: false, totalParticipants: 0, needsMoreParticipants: 5 };
                const { rankings, isActive, totalParticipants, needsMoreParticipants } = groupData;
                
                return (
                  <Card key={ageGroup.key}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ageGroup.icon} {ageGroup.label} Rankings
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ACTIVE
                          </span>
                        </div>
                        <span className="text-sm font-normal text-muted-foreground">
                          {totalParticipants} participants
                        </span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Age group competition with {totalParticipants} participants
                      </p>
                    </CardHeader>
                    <CardContent>
                      {ageGroupRankingsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="w-16 h-6 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : rankings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <i className="fas fa-trophy text-3xl mb-4"></i>
                          <p>No rankings data available yet!</p>
                        </div>
                      ) : (
                        renderRankingsList(rankings, false)
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}