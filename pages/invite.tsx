import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { Logo } from "@/components/Logo";

interface InviteData {
  emails: string;
  message?: string;
}

export default function Invite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emails, setEmails] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const inviteMutation = useMutation({
    mutationFn: (data: InviteData) => apiRequest("POST", "/api/invite-friends", data),
    onSuccess: (data: any) => {
      toast({
        title: "Invitations Sent!",
        description: `Successfully sent ${data.count} invitations.`,
      });
      setEmails("");
      setCustomMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Invitations",
        description: error.message || "Failed to send invitations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendInvites = () => {
    if (!emails.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate({
      emails: emails.trim(),
      message: customMessage.trim() || undefined,
    });
  };

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = user?.athleteName?.replace(/\s+/g, '') || user?.id;
    return `${baseUrl}?ref=${referralCode}`;
  };

  const shareOnSocialMedia = (platform: string) => {
    const shareText = `🏃‍♂️ Join me on KickStart Run! Track your runs with GPS, compete on leaderboards, and improve your performance. Perfect for young athletes ages 6-18! 🏆`;
    const shareUrl = generateShareableLink();
    
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct sharing links, so we'll copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        toast({
          title: "Copied to Clipboard!",
          description: "Share text copied. You can now paste it on Instagram.",
        });
        return;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
    }
    
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const copyShareLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent pb-20">
      <main className="container mx-auto px-4 py-8 max-w-2xl pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Logo size="large" variant="icon" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Invite Friends</h1>
          <p className="text-white/80">Share KickStart Run with your running buddies</p>
        </div>

        {/* Email Invitations */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-envelope mr-3 text-primary"></i>
              Email Invitations
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea
                  id="emails"
                  placeholder="Enter email addresses separated by commas or new lines"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: friend1@email.com, friend2@email.com
                </p>
              </div>

              <div>
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Hey! I've been using KickStart Run to track my runs and compete with friends. Want to join me?"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleSendInvites}
                disabled={inviteMutation.isPending}
                className="w-full"
              >
                {inviteMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Invitations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Sharing */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-share-alt mr-3 text-primary"></i>
              Share on Social Media
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => shareOnSocialMedia("facebook")}
                className="flex items-center justify-center space-x-2"
              >
                <i className="fab fa-facebook text-blue-600"></i>
                <span>Facebook</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => shareOnSocialMedia("twitter")}
                className="flex items-center justify-center space-x-2"
              >
                <i className="fab fa-twitter text-blue-400"></i>
                <span>Twitter</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => shareOnSocialMedia("instagram")}
                className="flex items-center justify-center space-x-2"
              >
                <i className="fab fa-instagram text-pink-600"></i>
                <span>Instagram</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => shareOnSocialMedia("whatsapp")}
                className="flex items-center justify-center space-x-2"
              >
                <i className="fab fa-whatsapp text-green-500"></i>
                <span>WhatsApp</span>
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">Your referral link:</p>
              <div className="flex items-center space-x-2">
                <Input
                  value={generateShareableLink()}
                  readOnly
                  className="text-xs"
                />
                <Button
                  size="sm"
                  onClick={copyShareLink}
                  variant="outline"
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-gift mr-3 text-primary"></i>
              Referral Rewards
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <i className="fas fa-users text-green-600"></i>
                <div>
                  <p className="font-medium text-sm">Build Your Community</p>
                  <p className="text-xs text-muted-foreground">
                    Get your school/club to 10+ athletes to unlock leaderboards
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <i className="fas fa-trophy text-blue-600"></i>
                <div>
                  <p className="font-medium text-sm">Compete Together</p>
                  <p className="text-xs text-muted-foreground">
                    More friends means more competition and motivation
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <i className="fas fa-heart text-purple-600"></i>
                <div>
                  <p className="font-medium text-sm">Share the Journey</p>
                  <p className="text-xs text-muted-foreground">
                    Help friends discover the joy of running and fitness
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Navigation />
    </div>
  );
}