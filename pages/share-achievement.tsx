import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import SharingStreakCounter from "@/components/SharingStreakCounter";
import html2canvas from "html2canvas";

export default function ShareAchievement() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedTemplate, setSelectedTemplate] = useState('story');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: '#667eea',
    secondary: '#764ba2', 
    accent: '#FFD700',
    text: '#ffffff'
  });
  const [useCustomColors, setUseCustomColors] = useState(false);

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

  // Check for pre-selected achievement/challenge/ranking from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const achievementParam = urlParams.get('achievement');
    const challengeParam = urlParams.get('challenge');
    const shareTypeParam = urlParams.get('type');
    
    if (shareTypeParam === 'ranking' && userRank) {
      // Create a virtual ranking achievement for sharing
      setSelectedAchievement({
        id: 'ranking',
        type: 'ranking',
        title: `#${userRank.rank} Athlete`,
        description: `Ranked #${userRank.rank} with ${userRank.totalPoints} points at ${userRank.schoolClub}`,
        points: userRank.totalPoints,
        rank: userRank.rank,
        isRanking: true
      });
    } else if (achievementParam && Array.isArray(achievements)) {
      const achievement = achievements.find(a => a.id.toString() === achievementParam);
      if (achievement) {
        setSelectedAchievement(achievement);
      }
    } else if (challengeParam && Array.isArray(userChallenges)) {
      const challenge = userChallenges.find(uc => uc.challenge?.id.toString() === challengeParam);
      if (challenge) {
        setSelectedAchievement(challenge);
      }
    }
  }, [achievements, userChallenges, userRank]);

  // Platform-specific templates with dynamic customization
  const platformTemplates = {
    facebook: {
      name: "Facebook",
      aspectRatio: "16:9",
      width: 1200,
      height: 675,
      templates: {
        celebration: {
          name: "Celebration",
          bg: "linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)",
          textColor: "white",
          accent: "#FFD700",
          layout: "centered"
        },
        achievement: {
          name: "Achievement",
          bg: "linear-gradient(135deg, #4267B2 0%, #898989 100%)",
          textColor: "white",
          accent: "#FFF176",
          layout: "split"
        },
        community: {
          name: "Community",
          bg: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
          textColor: "white",
          accent: "#FFEB3B",
          layout: "banner"
        }
      }
    },
    instagram: {
      name: "Instagram",
      aspectRatio: "1:1",
      width: 1080,
      height: 1080,
      templates: {
        story: {
          name: "Story Style",
          bg: "linear-gradient(135deg, #E1306C 0%, #FCAF45 100%)",
          textColor: "white",
          accent: "#FFD700",
          layout: "vertical"
        },
        feed: {
          name: "Feed Post",
          bg: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 100%)",
          textColor: "white",
          accent: "#FFF176",
          layout: "centered"
        },
        minimal: {
          name: "Clean & Minimal",
          bg: "linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)",
          textColor: "#212529",
          accent: "#E1306C",
          layout: "minimal"
        }
      }
    },
    twitter: {
      name: "Twitter/X",
      aspectRatio: "16:9",
      width: 1200,
      height: 675,
      templates: {
        trending: {
          name: "Trending",
          bg: "linear-gradient(135deg, #000000 0%, #1DA1F2 100%)",
          textColor: "white",
          accent: "#FFD700",
          layout: "card"
        },
        bold: {
          name: "Bold Statement",
          bg: "linear-gradient(135deg, #14171A 0%, #657786 100%)",
          textColor: "white",
          accent: "#1DA1F2",
          layout: "banner"
        },
        engagement: {
          name: "High Engagement",
          bg: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
          textColor: "white",
          accent: "#FFEB3B",
          layout: "split"
        }
      }
    },
    tiktok: {
      name: "TikTok",
      aspectRatio: "9:16",
      width: 1080,
      height: 1920,
      templates: {
        viral: {
          name: "Viral Style",
          bg: "linear-gradient(135deg, #FF0050 0%, #00F2EA 100%)",
          textColor: "white",
          accent: "#FFD700",
          layout: "vertical"
        },
        trendy: {
          name: "Trendy",
          bg: "linear-gradient(135deg, #000000 0%, #FF0050 100%)",
          textColor: "white",
          accent: "#00F2EA",
          layout: "full"
        },
        youth: {
          name: "Youth Focus",
          bg: "linear-gradient(135deg, #25F4EE 0%, #FE2C55 100%)",
          textColor: "white",
          accent: "#FFD700",
          layout: "dynamic"
        }
      }
    },
    snapchat: {
      name: "Snapchat",
      aspectRatio: "9:16",
      width: 1080,
      height: 1920,
      templates: {
        fun: {
          name: "Fun & Playful",
          bg: "linear-gradient(135deg, #FFFC00 0%, #FF8C00 100%)",
          textColor: "#333",
          accent: "#FF6B35",
          layout: "playful"
        },
        cool: {
          name: "Cool Factor",
          bg: "linear-gradient(135deg, #000000 0%, #FFFC00 100%)",
          textColor: "white",
          accent: "#FF6B35",
          layout: "edgy"
        },
        bright: {
          name: "Bright & Bold",
          bg: "linear-gradient(135deg, #FF6B35 0%, #FFFC00 100%)",
          textColor: "#333",
          accent: "#000000",
          layout: "vibrant"
        }
      }
    },
    whatsapp: {
      name: "WhatsApp",
      aspectRatio: "4:3",
      width: 1200,
      height: 900,
      templates: {
        friendly: {
          name: "Friendly Share",
          bg: "linear-gradient(135deg, #25D366 0%, #075E54 100%)",
          textColor: "white",
          accent: "#FFD700",
          layout: "message"
        },
        family: {
          name: "Family Style",
          bg: "linear-gradient(135deg, #128C7E 0%, #25D366 100%)",
          textColor: "white",
          accent: "#FFF176",
          layout: "warm"
        },
        personal: {
          name: "Personal Touch",
          bg: "linear-gradient(135deg, #ECE5DD 0%, #25D366 100%)",
          textColor: "#333",
          accent: "#075E54",
          layout: "casual"
        }
      }
    }
  };

  const generateShareImage = async () => {
    if (!canvasRef.current || !selectedAchievement) return;
    
    setIsGenerating(true);
    try {
      const platformInfo = platformTemplates[selectedPlatform as keyof typeof platformTemplates];
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2,
        width: platformInfo.width,
        height: platformInfo.height
      });
      
      // Convert to blob and create object URL for preview
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setGeneratedImageUrl(url);
          
          toast({
            title: "Achievement Post Created!",
            description: "Your achievement post is ready to share or download.",
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to create achievement post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `kickstart-${selectedPlatform}-${selectedTemplate}-${Date.now()}.png`;
    a.click();
    
    toast({
      title: "Image Downloaded!",
      description: "Your achievement post has been saved to your device.",
    });
  };

  const copyToClipboard = async () => {
    if (!selectedAchievement) return;
    
    const achievementTitle = selectedAchievement.title || selectedAchievement.challenge?.title;
    const appUrl = 'https://kickstartrun.com';
    const baseMessage = `🏃‍♀️ Just unlocked "${achievementTitle}" on KickStart Run! Join me in this U18 youth running app to track your progress and compete with friends!`;
    const message = customMessage ? `${customMessage} - ${baseMessage}` : baseMessage;
    const fullMessage = `${message}\n\nDownload: ${appUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullMessage);
      toast({
        title: "Copied to Clipboard!",
        description: "Your achievement message is ready to paste anywhere.",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied to Clipboard!",
        description: "Your achievement message is ready to paste anywhere.",
      });
    }
  };

  const recordShareActivity = async (platform: string) => {
    try {
      const shareData = {
        platform,
        shareType: selectedAchievement?.type || 'achievement',
        achievementId: selectedAchievement?.type === 'achievement' ? selectedAchievement?.id : undefined,
        challengeId: selectedAchievement?.type === 'challenge' ? selectedAchievement?.challenge?.id : undefined
      };

      await apiRequest('POST', '/api/record-share', shareData);
      
      // Refresh streak data to show updated streak
      queryClient.invalidateQueries({ queryKey: ['/api/sharing-streak'] });
      
    } catch (error) {
      console.error('Failed to record share activity:', error);
      // Don't show error toast - sharing still succeeded
    }
  };

  const shareToSocial = async (platform: string) => {
    if (!selectedAchievement) return;
    
    setIsSharing(true);
    
    const achievementTitle = selectedAchievement.title || selectedAchievement.challenge?.title;
    const appUrl = 'https://kickstartrun.com';
    const baseMessage = `🏃‍♀️ Just unlocked "${achievementTitle}" on KickStart Run! Join me in this U18 youth running app to track your progress and compete with friends!`;
    const message = customMessage ? `${customMessage} - ${baseMessage}` : baseMessage;
    
    // For visual platforms, generate image first if not already generated
    if (['instagram', 'snapchat', 'tiktok'].includes(platform) && !generatedImageUrl) {
      await generateShareImage();
    }
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(appUrl)}&hashtags=YouthRunning,KickStartRun,U18Only`,
      instagram: `https://www.instagram.com/`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + '\n\nDownload: ' + appUrl)}`,
      snapchat: `https://www.snapchat.com/`,
      tiktok: `https://www.tiktok.com/upload`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent('KickStart Run Achievement')}&summary=${encodeURIComponent(message)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(message)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(appUrl)}&description=${encodeURIComponent(message)}`
    };
    
    try {
      // Handle different sharing methods
      if (navigator.share && platform === 'native') {
        // Native Web Share API for mobile devices
        const shareData: any = {
          title: 'KickStart Run Achievement',
          text: message,
          url: appUrl,
        };
        
        // Include image if available and supported
        if (generatedImageUrl && navigator.canShare) {
          try {
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'achievement.png', { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (error) {
            console.log('Image sharing not supported, sharing text only');
          }
        }
        
        await navigator.share(shareData);
        
        // Record the share activity
        await recordShareActivity(platform);
        
        toast({
          title: "Shared Successfully!",
          description: "Your achievement has been shared!",
        });
      } else if (['instagram', 'snapchat', 'tiktok'].includes(platform)) {
        // Visual platforms - auto-download image and open platform
        if (generatedImageUrl) {
          downloadImage();
        }
        
        setTimeout(async () => {
          window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
          
          // Record the share activity
          await recordShareActivity(platform);
          
          toast({
            title: "Ready to Upload!",
            description: `Image downloaded! Upload it to ${platform.charAt(0).toUpperCase() + platform.slice(1)} to complete sharing.`,
          });
        }, 500);
      } else {
        // Text-based platforms - direct sharing
        window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
        
        // Record the share activity
        await recordShareActivity(platform);
        
        toast({
          title: "Opening Share Dialog",
          description: `Sharing your achievement on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`,
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast({
        title: "Sharing Failed",
        description: "Unable to share. Try copying the message instead.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Get current platform and template with proper type handling
  const currentPlatform = platformTemplates[selectedPlatform as keyof typeof platformTemplates];
  const templateKeys = Object.keys(currentPlatform?.templates || {});
  const defaultTemplate = templateKeys[0] || 'story';
  
  // Safely get the current template with fallback
  const getCurrentTemplate = () => {
    if (!currentPlatform?.templates) return null;
    const selected = (currentPlatform.templates as any)[selectedTemplate];
    const fallback = (currentPlatform.templates as any)[defaultTemplate];
    return selected || fallback || null;
  };
  
  const currentTemplate = getCurrentTemplate();
  
  // Dynamic achievement-based design enhancement
  const getAchievementLevel = (achievement: any) => {
    if (!achievement) return 'basic';
    
    // Determine achievement level based on points, rank, or type
    const points = achievement.challenge?.points || achievement.points || 0;
    const userRankValue = userRank?.rank || 999;
    
    if (userRankValue <= 3 || points >= 50) return 'legendary'; // Top 3 or high points
    if (userRankValue <= 10 || points >= 30) return 'epic';     // Top 10 or medium-high points
    if (userRankValue <= 25 || points >= 15) return 'rare';     // Top 25 or medium points
    return 'common'; // Everyone else
  };
  
  const achievementLevel = getAchievementLevel(selectedAchievement);
  
  // Enhanced visual effects based on achievement level
  const getAchievementEffects = (level: string) => {
    switch (level) {
      case 'legendary':
        return {
          bgOverlay: 'bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20',
          border: 'border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50',
          glow: 'drop-shadow-2xl',
          animation: 'animate-pulse',
          particles: '✨🏆✨',
          badge: 'LEGENDARY'
        };
      case 'epic':
        return {
          bgOverlay: 'bg-gradient-to-br from-purple-400/15 via-pink-400/15 to-blue-400/15',
          border: 'border-3 border-purple-400 shadow-xl shadow-purple-400/40',
          glow: 'drop-shadow-xl',
          animation: 'animate-bounce',
          particles: '⭐🎯⭐',
          badge: 'EPIC'
        };
      case 'rare':
        return {
          bgOverlay: 'bg-gradient-to-br from-blue-400/10 via-green-400/10 to-teal-400/10',
          border: 'border-2 border-blue-400 shadow-lg shadow-blue-400/30',
          glow: 'drop-shadow-lg',
          animation: '',
          particles: '🌟💎🌟',
          badge: 'RARE'
        };
      default:
        return {
          bgOverlay: 'bg-gradient-to-br from-gray-200/5 to-gray-300/5',
          border: 'border border-gray-300',
          glow: 'drop-shadow-md',
          animation: '',
          particles: '🏃‍♀️💪🏃‍♀️',
          badge: 'ACHIEVEMENT'
        };
    }
  };
  
  const achievementEffects = getAchievementEffects(achievementLevel);
  
  // Dynamic template layout rendering
  const renderTemplateLayout = (template: any, platform: any) => {
    const aspectRatioClass = platform.aspectRatio === '1:1' ? 'aspect-square' : 
                            platform.aspectRatio === '9:16' ? 'aspect-[9/16]' :
                            platform.aspectRatio === '16:9' ? 'aspect-[16/9]' :
                            'aspect-[4/3]';
    
    const effectiveColors = useCustomColors ? {
      bg: `linear-gradient(135deg, ${customColors.primary} 0%, ${customColors.secondary} 100%)`,
      textColor: customColors.text,
      accent: customColors.accent
    } : template;

    return { aspectRatioClass, effectiveColors };
  };
  
  const { aspectRatioClass, effectiveColors } = renderTemplateLayout(currentTemplate, currentPlatform);

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-white dark:bg-card shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setLocation('/dashboard')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <i className="fas fa-arrow-left text-muted-foreground"></i>
          </button>
          <h1 className="font-semibold">Share Achievement</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Achievement Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Achievement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Choose from completed challenges or achievements</Label>
              <Select onValueChange={(value) => {
                // Check achievements first
                let achievement = achievements.find((a: any) => a.id.toString() === value);
                
                // If not found in achievements, check completed challenges
                if (!achievement) {
                  const challengeRecord = completedChallenges.find((c: any) => c.challenge.id.toString() === value);
                  if (challengeRecord) {
                    achievement = {
                      ...challengeRecord.challenge,
                      isChallenge: true
                    };
                  }
                }
                
                console.log('Selected achievement:', achievement);
                setSelectedAchievement(achievement);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an achievement to share" />
                </SelectTrigger>
                <SelectContent>
                  {achievements.map((achievement: any) => (
                    <SelectItem key={`achievement-${achievement.id}`} value={achievement.id.toString()}>
                      🏆 {achievement.title}
                    </SelectItem>
                  ))}
                  {completedChallenges.map((challenge: any) => (
                    <SelectItem key={`challenge-${challenge.challenge.id}`} value={challenge.challenge.id.toString()}>
                      ✅ {challenge.challenge.title} Complete
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Streak Counter */}
        <SharingStreakCounter />

        {/* Platform & Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Platform & Design</CardTitle>
            <p className="text-sm text-muted-foreground">Choose your target platform and template style</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div>
              <Label>Target Platform</Label>
              <Select value={selectedPlatform} onValueChange={(value) => {
                setSelectedPlatform(value);
                // Reset template to first available for new platform
                const newPlatform = platformTemplates[value as keyof typeof platformTemplates];
                const firstTemplate = Object.keys(newPlatform.templates)[0];
                setSelectedTemplate(firstTemplate);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(platformTemplates).map(([key, platform]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{platform.name}</span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{platform.aspectRatio}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Resolution: {currentPlatform?.width}x{currentPlatform?.height}px
              </p>
            </div>

            {/* Template Selection */}
            <div>
              <Label>Template Style</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentPlatform && Object.entries(currentPlatform.templates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{template.name}</span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{template.layout}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Colors Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-custom-colors"
                checked={useCustomColors}
                onChange={(e) => setUseCustomColors(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="use-custom-colors">Use Custom Colors</Label>
            </div>

            {/* Custom Color Picker */}
            {useCustomColors && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="primary-color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                      className="w-10 h-8 rounded border"
                    />
                    <Input
                      value={customColors.primary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                      className="w-10 h-8 rounded border"
                    />
                    <Input
                      value={customColors.secondary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="accent-color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                      className="w-10 h-8 rounded border"
                    />
                    <Input
                      value={customColors.accent}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="text-color"
                      value={customColors.text}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, text: e.target.value }))}
                      className="w-10 h-8 rounded border"
                    />
                    <Input
                      value={customColors.text}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, text: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Input
                id="custom-message"
                placeholder="Add a personal message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customMessage.length}/150 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {selectedAchievement && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={canvasRef}
                className={`w-full ${aspectRatioClass} max-w-md mx-auto rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden ${achievementEffects.border} ${achievementEffects.glow} ${achievementEffects.animation}`}
                style={{ 
                  background: effectiveColors.bg,
                  color: effectiveColors.textColor 
                }}
              >
                {/* Achievement Level Overlay */}
                <div className={`absolute inset-0 ${achievementEffects.bgOverlay} rounded-2xl`}></div>
                {/* Achievement Level Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    achievementLevel === 'legendary' ? 'bg-yellow-500 text-white' :
                    achievementLevel === 'epic' ? 'bg-purple-500 text-white' :
                    achievementLevel === 'rare' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {achievementEffects.badge}
                  </div>
                </div>

                {/* Decorative elements with enhanced effects */}
                <div className="absolute top-4 left-4 w-16 h-16 rounded-full opacity-20" 
                     style={{ backgroundColor: effectiveColors.accent }}></div>
                <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full opacity-10" 
                     style={{ backgroundColor: effectiveColors.accent }}></div>
                
                {/* Achievement particles */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-lg opacity-60">
                  {achievementEffects.particles}
                </div>
                
                {/* Main content */}
                <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl"
                       style={{ backgroundColor: effectiveColors.accent, color: '#333' }}>
                    🏃‍♀️
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: effectiveColors.accent }}>
                      {selectedAchievement.isRanking 
                        ? `#${selectedAchievement.rank} Global Rank` 
                        : selectedAchievement.title || `${selectedAchievement.challenge?.title} Complete`}
                    </h3>
                  </div>
                  
                  {user && (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{user.athleteName}</p>
                      <p className="text-sm opacity-90">{user.schoolClub}</p>
                      {userRank?.rank > 0 && (
                        <p className="text-sm" style={{ color: effectiveColors.accent }}>
                          Rank #{userRank.rank} • {userRank.totalPoints} points
                        </p>
                      )}
                    </div>
                  )}
                  
                  {customMessage && (
                    <p className="text-sm italic opacity-90 max-w-xs">
                      "{customMessage}"
                    </p>
                  )}
                  
                  {/* App Logo and U18 Badge */}
                  <div className="flex justify-between items-end pt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        KS
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold" style={{ color: effectiveColors.accent }}>KickStart Run</p>
                        <p className="text-xs opacity-75">kickstartrun.com</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Gallery Preview */}
        {selectedAchievement && (
          <Card>
            <CardHeader>
              <CardTitle>Template Preview Gallery</CardTitle>
              <p className="text-sm text-muted-foreground">Quick preview of available templates for {currentPlatform?.name}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {currentPlatform && Object.entries(currentPlatform.templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === key ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="w-full aspect-square rounded-md mb-2 relative overflow-hidden"
                      style={{ 
                        background: template.bg,
                        color: template.textColor 
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: template.accent }}
                        ></div>
                      </div>
                      <div className="absolute bottom-1 right-1">

                      </div>
                    </div>
                    <p className="text-xs font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.layout}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Generation Section - Always Show When Achievement Selected */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Achievement Post</CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate image optimized for {currentPlatform?.name} ({currentPlatform?.aspectRatio})
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={generateShareImage}
              disabled={isGenerating || !selectedAchievement}
              className="w-full h-12"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating {currentPlatform?.name} Image...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  {selectedAchievement ? `Create Achievement Post (${selectedAchievement.title || 'Selected'})` : 'Select Achievement First'}
                </>
              )}
            </Button>
            
            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                Debug: {selectedAchievement ? `Achievement selected: ${selectedAchievement.title}` : 'No achievement selected'}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground text-center">
              💡 Want to create another post? Update your settings above and click "Create Achievement Post" again.
            </p>
          </CardContent>
        </Card>

        {/* Generated Image Preview */}
        {generatedImageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Your Achievement Post is Ready!</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated {currentPlatform?.name} image ({currentPlatform?.aspectRatio}) ready for sharing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated Achievement Post" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
              
              {/* Download Button */}
              <Button 
                onClick={downloadImage}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <i className="fas fa-download mr-2"></i>
                Download Image
              </Button>
              
              {/* One-Click Social Media Share Buttons */}
              <div className="space-y-3">
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Native Share Button (for mobile devices) */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button 
                      onClick={() => shareToSocial('native')}
                      disabled={isSharing}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <i className="fas fa-share mr-2"></i>
                      Share Instantly
                    </Button>
                  )}
                  
                  {/* Copy to Clipboard */}
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-2 border-purple-300 hover:bg-purple-50"
                  >
                    <i className="fas fa-copy mr-2"></i>
                    Copy Message
                  </Button>
                  
                  {/* Fill remaining space if native share not available */}
                  {(typeof navigator === 'undefined' || !navigator.share) && (
                    <Button 
                      onClick={copyToClipboard}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                    >
                      <i className="fas fa-copy mr-2"></i>
                      Quick Copy
                    </Button>
                  )}
                </div>
                
                {/* Primary Social Platforms */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => shareToSocial('facebook')}
                    disabled={isSharing}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <i className="fab fa-facebook mr-2"></i>}
                    Facebook
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('twitter')}
                    disabled={isSharing}
                    className="flex items-center justify-center bg-black hover:bg-gray-800 text-white disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <i className="fab fa-x-twitter mr-2"></i>}
                    X/Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('instagram')}
                    disabled={isSharing}
                    className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <i className="fab fa-instagram mr-2"></i>}
                    Instagram
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('whatsapp')}
                    disabled={isSharing}
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <i className="fab fa-whatsapp mr-2"></i>}
                    WhatsApp
                  </Button>
                </div>
                
                {/* Secondary Social Platforms */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => shareToSocial('snapchat')}
                    disabled={isSharing}
                    size="sm"
                    className="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-3 h-3 border-2 border-black border-t-transparent rounded-full mr-1"></div> : <i className="fab fa-snapchat-ghost mr-1"></i>}
                    Snapchat
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('tiktok')}
                    disabled={isSharing}
                    size="sm"
                    className="flex items-center justify-center bg-black hover:bg-gray-900 text-white disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div> : <i className="fab fa-tiktok mr-1"></i>}
                    TikTok
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('linkedin')}
                    disabled={isSharing}
                    size="sm"
                    className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white disabled:opacity-50"
                  >
                    {isSharing ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div> : <i className="fab fa-linkedin mr-1"></i>}
                    LinkedIn
                  </Button>
                </div>
                
                {/* Quick Share Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    <i className="fas fa-lightbulb mr-1"></i>
                    One-Click Sharing Tips:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• <strong>Facebook/Twitter:</strong> Opens pre-filled share dialog</li>
                    <li>• <strong>Instagram/TikTok:</strong> Auto-downloads image + opens app</li>
                    <li>• <strong>WhatsApp:</strong> Opens with pre-written message</li>
                    <li>• <strong>Mobile:</strong> Use "Share Instantly" for native sharing</li>
                  </ul>
                </div>
              </div>
              
              {/* Create New Post Button */}
              <Button 
                onClick={() => setGeneratedImageUrl(null)}
                variant="outline"
                className="w-full"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Post
              </Button>
            </CardContent>
          </Card>
        )}


      </main>

      <Navigation />
    </div>
  );
}