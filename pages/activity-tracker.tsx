import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";

export default function ActivityTracker() {
  const [location, setLocation] = useLocation();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState("");
  const [gpsDistance, setGpsDistance] = useState(0);
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const [gpsSupported, setGpsSupported] = useState(false);
  const [useGPS, setUseGPS] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get challenge ID from URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const challengeId = urlParams.get('challengeId');

  const { data: challenges = [] } = useQuery<any[]>({
    queryKey: ['/api/challenges'],
  });

  const currentChallenge = challengeId 
    ? challenges.find((c: any) => c.challengeId === parseInt(challengeId))
    : challenges.find((c: any) => c.status === 'available' || c.status === 'in_progress');

  // Check GPS support and request permission
  useEffect(() => {
    if ("geolocation" in navigator) {
      setGpsSupported(true);
      
      // Request GPS permission on component mount for compliance
      navigator.geolocation.getCurrentPosition(
        () => {
          toast({
            title: "GPS Permission Granted",
            description: "Location tracking enabled for accurate run measurement.",
          });
        },
        () => {
          toast({
            title: "GPS Permission Required",
            description: "Please enable location access for GPS-verified runs.",
            variant: "destructive",
          });
        }
      );
    }
  }, []);

  // GPS tracking effect - Fixed dependency loop causing crashes
  useEffect(() => {
    let watchId: number;
    if (isTracking && useGPS && gpsSupported) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLastPosition(prevPosition => {
            if (prevPosition) {
              const newDistance = calculateDistanceBetweenPoints(
                prevPosition.coords.latitude,
                prevPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
              );
              // Only update distance if movement is significant (reduces GPS noise)
              if (newDistance > 0.001) { // 1 meter minimum
                setGpsDistance(prev => prev + newDistance);
              }
            }
            return position;
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          setUseGPS(false);
          toast({
            title: "GPS Error",
            description: "GPS tracking disabled. Using manual distance entry.",
            variant: "destructive",
          });
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 30000, // Increased for stability
          timeout: 15000 // Increased timeout
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, useGPS, gpsSupported]); // Removed lastPosition dependency to prevent loops

  // Calculate distance between two GPS coordinates
  const calculateDistanceBetweenPoints = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePace = () => {
    const dist = useGPS ? gpsDistance : parseFloat(distance);
    if (dist > 0 && elapsedTime > 0) {
      const paceMinPerKm = elapsedTime / 60 / dist;
      return paceMinPerKm.toFixed(2);
    }
    return "0.00";
  };

  const startActivity = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedTime(0);
    if (useGPS) {
      setGpsDistance(0);
      setLastPosition(null);
    }
  };

  const stopActivity = () => {
    setIsTracking(false);
    // Auto-save GPS tracked activities
    if (useGPS && gpsDistance > 0 && elapsedTime > 0) {
      saveActivityMutation.mutate();
    }
  };

  const saveActivityMutation = useMutation({
    mutationFn: async () => {
      const dist = useGPS ? gpsDistance : parseFloat(distance);
      if (!dist || dist <= 0 || !elapsedTime || elapsedTime <= 0) {
        throw new Error("Invalid activity data: distance and time must be greater than 0");
      }

      const pace = parseFloat(calculatePace());
      const calories = Math.round(dist * 65); // Rough estimation

      // Add retry logic and error handling for server stability
      const requestData = {
        challengeId: currentChallenge?.challenge?.id || null,
        distance: Math.round(dist * 1000) / 1000, // Round to 3 decimal places
        duration: elapsedTime,
        pace: Math.round(pace * 100) / 100, // Round to 2 decimal places
        calories: calories,
        startedAt: startTime?.toISOString(),
        aiAnalysis: {
          suggestions: [
            "Great pace consistency!",
            "Focus on maintaining steady breathing",
            "Try to increase your distance gradually"
          ]
        }
      };

      try {
        return await apiRequest("POST", "/api/activities", requestData);
      } catch (error) {
        console.error("Activity save error:", error);
        // Retry once after a brief delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await apiRequest("POST", "/api/activities", requestData);
      }
    },
    onSuccess: (data: any) => {
      const dist = useGPS ? gpsDistance : parseFloat(distance);
      const pointsEarned = Math.floor(dist * 1000);
      
      let message = `${dist.toFixed(2)}km run saved! Earned ${pointsEarned} points`;
      
      if (data.challengesCompleted && data.challengesCompleted.length > 0) {
        const badges = data.challengesCompleted.map((c: any) => c.title).join(", ");
        message += ` • Badges unlocked: ${badges}`;
      }
      
      toast({
        title: "Run Complete!",
        description: message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      
      // Reset tracking data
      setElapsedTime(0);
      setGpsDistance(0);
      setStartTime(null);
      setLastPosition(null);
      
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setLocation('/')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <i className="fas fa-arrow-left text-muted-foreground"></i>
          </button>
          <h1 className="font-semibold">Start Running</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="p-4 pb-20">
        {/* Challenge Info */}
        {currentChallenge ? (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className={`fas ${currentChallenge.challenge.type === 'distance' ? 'fa-running' : 
                                      currentChallenge.challenge.type === 'drill' ? 'fa-repeat' : 
                                      currentChallenge.challenge.type === 'form' ? 'fa-balance-scale' : 'fa-heart'} text-primary`}></i>
                </div>
                <div>
                  <h2 className="font-semibold">{currentChallenge.challenge.title}</h2>
                  <Badge variant="outline" className="text-xs">
                    {currentChallenge.challenge.type} challenge
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentChallenge.challenge.description}
              </p>
              {currentChallenge.challenge.targetDistance && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Target:</span> {currentChallenge.challenge.targetDistance} km
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">GPS Run</h2>
              <p className="text-sm text-muted-foreground">
                Your run distance automatically unlocks distance badges as you hit targets
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timer Display */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-semibold">
                  {useGPS ? gpsDistance.toFixed(2) : (distance || "0.00")} km
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pace</p>
                <p className="font-semibold">{calculatePace()} min/km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPS Controls */}
        {gpsSupported && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">GPS Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Distance badges automatically unlock when you hit targets during your run
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span className="text-sm font-medium">GPS Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="space-y-4">
          {!isTracking ? (
            <>

              <Button 
                onClick={startActivity}
                className="w-full"
                size="lg"
              >
                <i className="fas fa-play mr-2"></i>
                Start Running
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={stopActivity}
                variant="destructive" 
                className="w-full"
                size="lg"
              >
                <i className="fas fa-stop mr-2"></i>
                {useGPS ? 'Stop & Save Run' : 'Stop Running'}
              </Button>
              

            </div>
          )}
        </div>



        {/* Coaching Tips */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <i className="fas fa-lightbulb text-secondary mr-2"></i>
              Coach Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep a steady pace throughout your run</li>
              <li>• Focus on your breathing rhythm</li>
              <li>• Land midfoot to reduce impact</li>
              <li>• Stay hydrated before and after running</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      
      <Navigation />
    </div>
  );
}