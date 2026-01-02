import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookUser, Mail, Lock, User, Loader2, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AuthStep = "credentials" | "verify-otp";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSignUp = async () => {
    setIsSubmitting(true);
    try {
      // Send OTP to email for verification
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            display_name: displayName,
            password: password, // We'll set this after verification
          },
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code.",
      });
      setAuthStep("verify-otp");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    try {
      // Verify the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Update the user's password after successful OTP verification
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          toast({
            title: "Error",
            description: "Account created but failed to set password. Please reset your password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Your email has been verified and account is ready.",
          });
        }
        navigate("/", { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate("/", { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await handleLogin();
    } else {
      if (authStep === "credentials") {
        await handleSignUp();
      } else {
        await handleVerifyOtp();
      }
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "OTP Resent!",
        description: "Please check your email for the new verification code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCredentials = () => {
    setAuthStep("credentials");
    setOtp("");
  };

  // Fill test credentials
  const fillTestCredentials = () => {
    setEmail("thevirajdeveloper@gmail.com");
    setPassword("test123");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Sign In" : "Sign Up"} - Contact Manager</title>
        <meta name="description" content="Sign in or create an account to manage your contacts." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-md">
                <BookUser className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Contact Manager</h1>
                <p className="text-xs text-muted-foreground">Organize your contacts with ease</p>
              </div>
            </div>
          </div>
        </header>

        {/* Auth Form */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl border border-border/50 p-8 shadow-lg animate-slide-up">
              {/* OTP Verification Step */}
              {!isLogin && authStep === "verify-otp" ? (
                <>
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-accent" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Verify Your Email
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      We sent a 6-digit code to <strong>{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || otp.length !== 6}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify & Create Account"
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the code?{" "}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isSubmitting}
                          className="text-accent hover:underline font-medium"
                        >
                          Resend
                        </button>
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Credentials Step */}
                  <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      {isLogin
                        ? "Sign in to access your contacts"
                        : "Sign up to start managing your contacts"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Display Name
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isLogin ? "Signing in..." : "Sending OTP..."}
                        </span>
                      ) : (
                        isLogin ? "Sign In" : "Continue"
                      )}
                    </Button>
                  </form>

                  {/* Test Credentials */}
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      {isLogin ? "Use test credentials:" : "Create with test credentials:"}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fillTestCredentials}
                      className="w-full text-xs"
                    >
                      thevirajdeveloper@gmail.com / test123
                    </Button>
                    {isLogin && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        First time? Sign up first to create the account.
                      </p>
                    )}
                  </div>

                  {/* Toggle */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-1 text-accent hover:underline font-medium"
                      >
                        {isLogin ? "Sign up" : "Sign in"}
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* Privacy Policy Link */}
              <div className="mt-6 pt-4 border-t border-border/50 text-center">
                <Link
                  to="/privacy-policy"
                  className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Auth;
