import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Clock, Zap } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Active!",
        description: "Your 30-day free trial has started. Welcome to KickStart Run!",
      });
      onSuccess();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: "tabs"
        }}
      />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        {isLoading ? "Setting up..." : "Start Free Trial"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Create subscription setup intent
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      })
      .catch((error) => {

      });
  }, []);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to KickStart Run!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your subscription is active and your 30-day free trial has started.
            </p>
            <Button 
              onClick={() => window.location.href = "/dashboard"} 
              className="w-full"
            >
              Start Your Running Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <span className="ml-2">Setting up your subscription...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Complete Your Registration</CardTitle>
          <p className="text-muted-foreground">
            Start your 30-day free trial to unlock all features
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm">GPS-verified activity tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm">Age-appropriate challenges & badges</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm">School leaderboards & competitions</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">$4.99/month</div>
              <div className="text-sm text-green-700 dark:text-green-300">after 30-day free trial</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Cancel anytime</div>
            </div>
          </div>

          {/* Payment Form */}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SubscribeForm onSuccess={() => setIsComplete(true)} />
          </Elements>

          <p className="text-xs text-muted-foreground text-center">
            By subscribing, you agree to our Terms of Service. 
            Your subscription will automatically renew unless cancelled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}