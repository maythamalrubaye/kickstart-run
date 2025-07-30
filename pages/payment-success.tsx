import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Try automatic login if credentials are stored
    const email = localStorage.getItem('pendingLoginEmail');
    const password = localStorage.getItem('pendingLoginPassword');
    
    if (email && password && !user && !isLoading) {
      // Attempt automatic login
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(response => {
        if (response.ok) {
          // Clear stored credentials and refresh user data
          localStorage.removeItem('pendingLoginEmail');
          localStorage.removeItem('pendingLoginPassword');
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        }
      }).catch(() => {
        // Silent fail - user can login manually if needed
      });
    }
  }, [user, isLoading, queryClient]);

  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds, regardless of login status
    const timer = setTimeout(() => {
      setLocation('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-full h-full text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">Payment Successful!</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mr-2" />
              <p className="text-muted-foreground">Checking your account status...</p>
            </div>
          ) : user ? (
            <p className="text-muted-foreground mb-6">
              Welcome back, <strong>{user.athleteName}</strong>! Your subscription has been activated and you now have full access to all features.
            </p>
          ) : (
            <p className="text-muted-foreground mb-6">
              Welcome to KickStart Run! Your subscription has been activated. Please sign in to access your account.
            </p>
          )}
          
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
                <li>• Complete your first GPS-tracked run</li>
                <li>• Unlock distance and technique badges</li>
                <li>• Join your school's leaderboard</li>
                <li>• Share your achievements with friends</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => setLocation('/dashboard')} 
              className="w-full"
            >
              {user ? 'Start Running!' : 'Sign In to Continue'}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Redirecting to your dashboard in 3 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}