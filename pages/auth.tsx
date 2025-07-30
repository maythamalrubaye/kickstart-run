import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LegalAgreementBanner } from "@/components/legal-agreement-banner";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";


const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(true);
  // Parent-only signup - parents create accounts for their children
  const signupType = 'parent';
  const [showCustomSchool, setShowCustomSchool] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<{email: string, password: string, athleteName: string, parentEmail: string} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Listen for payment completion via postMessage from Stripe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Stripe checkout
      if (event.origin !== 'https://checkout.stripe.com') return;
      
      if (event.data?.type === 'stripe_checkout_session_complete') {

        handlePaymentSuccess();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [newUserCredentials]);

  const handlePaymentSuccess = async () => {
    if (newUserCredentials) {
      try {
        // Send login credentials email after payment completion
        await apiRequest("POST", "/api/send-credentials-email", {
          email: newUserCredentials.email,
          password: newUserCredentials.password,
          athleteName: newUserCredentials.athleteName,
          parentEmail: newUserCredentials.parentEmail
        });

        // Login the user
        const response: any = await apiRequest("POST", "/api/login", {
          email: newUserCredentials.email,
          password: newUserCredentials.password
        });
        
        // Clear credentials
        setNewUserCredentials(null);
        
        toast({
          title: "Welcome to KickStart Run!",
          description: "Your 30-day free trial has started! Login credentials sent to parent email.",
        });
        
        // Navigate to dashboard
        window.location.href = '/dashboard';
      } catch (error) {
        // Handle payment success error silently
        toast({
          title: "Payment Successful",
          description: "Please check your email for login credentials, then sign in.",
        });
        setIsSignup(false); // Switch to login form
      }
    } else {
      // Direct payment success without new user credentials
      toast({
        title: "Payment Successful!",
        description: "Welcome to KickStart Run!",
      });
      // Navigate to dashboard
      window.location.href = '/dashboard';
    }
  };

  // International schools from around the world
  const schools = [
    "American International School of Bucharest",
    "American International School of Budapest", 
    "American International School of Zagreb",
    "American International School Vienna",
    "American School of Warsaw",
    "American International School of Vilnius",
    "Anglo-American School of Sofia",
    "Baku International School",
    "Bishkek International School",
    "International School of Prague",
    "International School of Helsinki",
    "International School of Krakow", 
    "International School of Latvia",
    "International School of Estonia",
    "International School of Belgrade",
    "Istanbul International Community School",
    "NOVA International School Skopje",
    "Pechersk School International",
    "Tashkent International School",
    "The International School of Azerbaijan",
    "Vienna International School"
  ];

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(insertUserSchema),  
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      athleteName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      schoolClub: "",
      parentEmail: "",
      // Simplified: Only set required fields, legal consents handled automatically  
      optOutPublic: false,
      parentalConsentGiven: false,
      termsAccepted: false, // Required checkbox
    },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupForm) => apiRequest("POST", "/api/signup", { ...data, signupType }),
    onSuccess: (response: any) => {
      // Store credentials for post-payment email sending
      setNewUserCredentials({
        email: response.credentials.email,
        password: response.credentials.password,
        athleteName: response.credentials.athleteName,
        parentEmail: response.credentials.parentEmail
      });
      
      setAccountCreated(true);
      
      toast({
        title: "Account Created Successfully!",
        description: "Complete your subscription below to unlock all features.",
      });
      
      // Show payment section and create Stripe buy button
      setTimeout(() => {
        const paymentContainer = document.getElementById('stripe-payment-container');
        if (paymentContainer) {
          paymentContainer.style.display = 'block';
        }
        
        const mountPoint = document.getElementById('stripe-buy-button-mount');
        if (mountPoint) {
          // Clear existing content first
          mountPoint.innerHTML = '';
          
          // Create Stripe buy button
          const buyButton = document.createElement('stripe-buy-button');
          buyButton.setAttribute('buy-button-id', 'buy_btn_1RnQDlFxSZkvIeIKEQxOQfun');
          buyButton.setAttribute('publishable-key', 'pk_live_51RksfdFxSZkvIeIKA2yTLjmeRqGVlAUt9ov8Gck3ZqpYwAhDzoeLkBnmYuAh94QqpSzpmbDUXmPalPUsfCLJ8LNy00aozATRpL');
          
          mountPoint.appendChild(buyButton);
          
          // If Stripe doesn't load within 3 seconds, show payment method required message
          setTimeout(() => {
            if (!mountPoint.querySelector('iframe')) {
              mountPoint.innerHTML = `
                <div class="text-center p-4 bg-amber-50 border border-amber-200 rounded">
                  <div class="text-amber-600 mb-2">⚠️ Payment Method Required</div>
                  <p class="text-sm text-gray-700 mb-3">A valid payment method is required to start your 30-day free trial</p>
                  <p class="text-xs text-gray-600 mb-3">• No charge for 30 days<br>• $4.99/month after trial<br>• Cancel anytime</p>
                  <button data-testid="retry-stripe" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 mr-2">
                    Retry Payment Setup
                  </button>
                  <a href="mailto:contact@kickstartrun.com" class="text-blue-600 text-xs hover:underline">Need Help?</a>
                </div>
              `;
              // Add retry handler
              const retryBtn = mountPoint.querySelector('[data-testid="retry-stripe"]');
              retryBtn?.addEventListener('click', () => {
                window.location.reload(); // Reload to retry Stripe
              });
            }
          }, 5000); // Increased timeout to 5 seconds for better Stripe loading
        }
        
        // Scroll to payment section
        setTimeout(() => {
          paymentContainer?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => apiRequest("POST", "/api/login", data),
    onSuccess: async (response: any) => {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const watchDateOfBirth = signupForm.watch("dateOfBirth");
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  const currentAge = calculateAge(watchDateOfBirth);
  const showParentalConsent = currentAge < 13 && currentAge > 0;

  const onSignupSubmit = (data: SignupForm) => {
    // Validate legal agreement checkbox
    if (!data.termsAccepted) {
      toast({
        title: "Legal Agreement Required",
        description: "You must agree to the terms and conditions to create an account.",
        variant: "destructive",
      });
      return;
    }

    if (showParentalConsent && !data.parentEmail) {
      toast({
        title: "Parental Email Required", 
        description: "Please provide a parent or guardian email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit directly with all required legal consents
    const finalData = {
      ...data,
      parentalConsentGiven: showParentalConsent,
      coppaCompliantConsent: showParentalConsent,
      liabilityWaiverAccepted: true,
    };
    
    signupMutation.mutate(finalData);
  };

  // Remove unused legal agreement handler since we're using direct checkbox approach



  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Logo and App Name */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <Logo size="large" variant="full" className="justify-center" />
            </div>
            <p className="text-muted-foreground text-sm text-center">GPS-verified youth running performance</p>
          </div>

          {isSignup ? (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">Create Your Account</h2>
              
              {/* Parent-Only Account Creation */}
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-primary mb-2 text-center">
                  Parent Account Creation
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Parents create accounts for their young athletes (ages 6-18). 
                  You'll receive login credentials to share with your child.
                </p>
              </div>
              
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="athleteName">Your Child's Name</Label>
                  <Input 
                    id="athleteName"
                    placeholder="e.g., Emma Smith"
                    {...signupForm.register("athleteName", {
                      required: "Child's name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                      pattern: {
                        value: /^[a-zA-Z0-9\s\.\-_]+$/,
                        message: "Invalid characters in name"
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your child's name for the running account
                  </p>
                  {signupForm.formState.errors.athleteName && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.athleteName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="schoolClub">School/Club (Optional)</Label>
                  {!showCustomSchool ? (
                    <div className="space-y-2">
                      <Select 
                        value={signupForm.watch("schoolClub") || ""}
                        onValueChange={(value) => {

                          if (value === "custom") {
                            setShowCustomSchool(true);
                            signupForm.setValue("schoolClub", "");
                          } else {

                            signupForm.setValue("schoolClub", value);

                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your school/club or add new" />
                        </SelectTrigger>
                        <SelectContent>
                          {(schools as string[]).map((school: string) => (
                            <SelectItem key={school} value={school}>
                              {school}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">
                            <div className="flex items-center">
                              <i className="fas fa-plus mr-2 text-primary"></i>
                              Add New School/Club
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input 
                        id="schoolClub"
                        placeholder="Enter full school/club name (no abbreviations)"
                        {...signupForm.register("schoolClub")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCustomSchool(false);
                          signupForm.setValue("schoolClub", "");
                        }}
                        className="text-xs"
                      >
                        <i className="fas fa-arrow-left mr-1"></i>
                        Choose from existing schools
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {showCustomSchool 
                      ? "Please enter the full name (e.g., 'Lincoln High School' not 'LHS')"
                      : "School leaderboards show your school's ranking • All students contribute points"
                    }
                  </p>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth"
                    type="date"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 6)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    {...signupForm.register("dateOfBirth")}
                  />
                  {currentAge > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Age: {currentAge} years old</p>
                  )}
                  {signupForm.formState.errors.dateOfBirth && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Parent/Guardian Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    {...signupForm.register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address"
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Account management and COPPA compliance
                  </p>
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    {...signupForm.register("password")}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...signupForm.register("confirmPassword")}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Required Legal Agreement Checkbox */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="legalAgreement"
                      checked={signupForm.watch("termsAccepted") || false}
                      onCheckedChange={(checked) => {
                        signupForm.setValue("termsAccepted", checked as boolean);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="legalAgreement" className="text-sm font-medium text-blue-800 dark:text-blue-200 cursor-pointer">
                        <strong>I agree to the complete legal terms and safety requirements</strong>
                      </label>
                      <div className="mt-2">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          By checking this box, I acknowledge and agree to:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-3">
                          <li>• <strong>Terms of Service & Privacy Policy</strong> - Complete legal agreement</li>
                          <li>• <strong>Liability Waiver</strong> - Assumption of risk for all physical activities</li>
                          <li>• <strong>COPPA & FERPA Compliance</strong> - Data collection & educational records protection</li>
                          <li>• <strong>Parental Responsibility</strong> - Parents are fully responsible for child safety</li>
                          <li>• <strong>GPS Data Collection</strong> - Location tracking during running activities</li>
                        </ul>
                        <div className="mt-3">
                          <a 
                            href="/terms-and-privacy" 
                            target="_blank" 
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            📄 Read Complete Terms & Privacy Policy
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  {signupForm.formState.errors.termsAccepted && (
                    <p className="text-xs text-red-600 mt-2 ml-6">You must agree to the terms to create an account</p>
                  )}
                </div>

                {/* Parental Consent for Under 13 */}
                {showParentalConsent && (
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-sm mb-2 text-amber-600 dark:text-amber-400">Parental Consent Required</h3>
                    <div className="text-xs text-muted-foreground mb-2">
                      Since you're under 13, we need a parent or guardian to approve your account.
                    </div>
                    <Input 
                      placeholder="Parent/Guardian email"
                      {...signupForm.register("parentEmail")}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account & Subscribe"}
                </Button>

                {/* Integrated Payment Section - Always Visible */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mt-4">
                  <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">
                    {accountCreated ? "🎉 Account Created!" : "Complete Your Subscription"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {accountCreated ? 
                      "Your account is ready! Complete your subscription to unlock all features:" :
                      "After creating your account, complete your subscription below:"
                    }
                  </p>
                  
                  {/* Stripe Buy Button Container */}
                  <div id="stripe-buy-button-mount" className="w-full min-h-[60px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                    {!accountCreated ? (
                      <p className="text-xs text-muted-foreground">Complete account creation above first</p>
                    ) : (
                      <div className="w-full">
                        <div className="text-center text-xs text-muted-foreground mb-2">Loading payment options...</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Testing Skip Option */}
                  {accountCreated && (
                    <div className="mt-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {

                          handlePaymentSuccess();
                        }}
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-700"
                      >
                        Start Free Trial → Dashboard
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    onClick={() => setIsSignup(false)} 
                    className="text-primary font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-center">Welcome Back</h2>
              
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    type="button" 
                    onClick={() => setIsSignup(true)} 
                    className="text-primary font-medium hover:underline"
                  >
                    Start Free Trial
                  </button>
                </p>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Agreement Banner - Removed in favor of direct checkbox approach */}
    </div>
  );
}
