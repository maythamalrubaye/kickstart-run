import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ConsentResult {
  success: boolean;
  message: string;
  childName?: string;
  error?: string;
}

export default function ParentConsentPage() {
  const params = useParams();
  const { userId, token } = params;
  const [result, setResult] = useState<ConsentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && token) {
      verifyConsent();
    }
  }, [userId, token]);

  const verifyConsent = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/parent-consent/${userId}/${token}`);
      setResult({
        success: true,
        message: response.message,
        childName: response.childName
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: "Consent verification failed",
        error: error.message || "Invalid or expired consent link"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Clock className="w-12 h-12 text-primary animate-pulse mb-4" />
            <p className="text-lg">Verifying consent...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {result?.success ? (
              <div className="w-full h-full bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-full h-full bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {result?.success ? "Consent Confirmed!" : "Consent Failed"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {result?.success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200">
                  <strong>{result.childName}'s</strong> account has been successfully activated!
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">What happens next?</h4>
                <ul className="text-left text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">✓</span>
                    Your child can now log in to KickStart Run
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">✓</span>
                    All features are now available for use
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">✓</span>
                    You'll receive weekly activity reports via email
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Your Parental Rights
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  You can access, modify, or delete your child's data at any time. 
                  Contact contact@kickstartrun.com for any privacy concerns.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200 mb-2">
                  <strong>Unable to verify consent</strong>
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {result?.error || "The consent link may be invalid or expired."}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">What you can do:</h4>
                <ul className="text-left text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                    Check if the email link was copied correctly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                    Contact support if you continue to have issues
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                    Your child can request a new consent email
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              {result?.success ? "Continue to Login" : "Back to Home"}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Questions? Contact contact@kickstartrun.com
          </div>
        </CardContent>
      </Card>
    </div>
  );
}