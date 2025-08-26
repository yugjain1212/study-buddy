
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "password") {
      checkPasswordRequirements(value as string);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.name
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup failed",
          description: error.message || "Failed to create account",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to Study Buddy AI. Let's start learning!",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary ambient-glow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary))_0%,transparent_50%)] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(var(--accent))_0%,transparent_50%)] opacity-15"></div>
      
      <div className="w-full max-w-md relative z-10 animate-slide-in-up">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8 animate-fade-in">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center ambient-glow">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Study Buddy AI
          </span>
        </div>

        <Card className="glass-effect border-border/50 shadow-2xl hover-lift">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join thousands of students learning smarter
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 animate-stagger-1">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all"
                />
              </div>
              
              <div className="space-y-2 animate-stagger-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all"
                />
              </div>
              
              <div className="space-y-2 animate-stagger-3">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all"
                />
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="text-xs space-y-1 mt-2 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      {passwordRequirements.length ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span className={passwordRequirements.length ? "text-green-400" : "text-red-400"}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordRequirements.uppercase ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span className={passwordRequirements.uppercase ? "text-green-400" : "text-red-400"}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordRequirements.lowercase ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span className={passwordRequirements.lowercase ? "text-green-400" : "text-red-400"}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordRequirements.number ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span className={passwordRequirements.number ? "text-green-400" : "text-red-400"}>
                        One number
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 animate-stagger-4">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex items-center space-x-2 animate-stagger-4">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  className="border-border/50"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground hover-lift ambient-glow animate-stagger-4"
                disabled={isLoading || !allRequirementsMet || !formData.agreeToTerms}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm animate-fade-in">
              <span className="text-muted-foreground">Already have an account?{" "}</span>
              <Link to="/login" className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;