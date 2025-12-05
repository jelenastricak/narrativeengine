import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import logo from "@/assets/logo.png";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        let message = error.message;
        if (error.message.includes("User already registered")) {
          message = "This email is already registered. Please sign in instead.";
        }
        toast({
          title: isLogin ? "Sign In Failed" : "Sign Up Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        if (!isLogin) {
          toast({
            title: "Account Created",
            description: "You can now sign in with your credentials.",
          });
        }
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Sign In" : "Sign Up"} | The Narrative Engine</title>
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Narrative Engine" className="w-16 h-16 invert mb-4" />
            <h1 className="font-display text-xl tracking-[0.2em] text-foreground">
              THE NARRATIVE ENGINE
            </h1>
            <p className="text-xs text-muted-foreground font-body tracking-wide">
              Strategic Narrative Intelligence System
            </p>
          </div>

          {/* Auth Form */}
          <div className="border border-border p-8">
            <h2 className="font-display text-lg tracking-widest text-foreground mb-6 text-center uppercase">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-display uppercase tracking-widest">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-background border-border font-mono"
                  placeholder="operator@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-display uppercase tracking-widest">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-background border-border font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-hot mt-6"
              >
                {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground font-body underline underline-offset-4 transition-colors"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
