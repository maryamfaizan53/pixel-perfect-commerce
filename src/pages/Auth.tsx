import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const signUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().trim().max(100, "Name must be less than 100 characters").optional()
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = signUpSchema.parse({
        email,
        password,
        fullName
      });

      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName || validatedData.email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      toast.success("Account created successfully!", {
        description: "You can now log in with your credentials"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error("Validation error", {
          description: error.errors[0].message
        });
      } else {
        toast.error("Sign up failed", {
          description: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = signInSchema.parse({
        email,
        password
      });

      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error("Validation error", {
          description: error.errors[0].message
        });
      } else {
        toast.error("Login failed", {
          description: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in-0 zoom-in-95 duration-300">
              <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
                <CardHeader className="space-y-1 pb-6 pt-8 text-center bg-slate-50/50">
                  <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                  <CardDescription className="text-slate-500">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-8">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10 h-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</Label>
                        <Link to="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff id="eye-off-login" className="w-4 h-4" /> : <Eye id="eye-login" className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all mt-4" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="animate-in fade-in-0 zoom-in-95 duration-300">
              <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
                <CardHeader className="space-y-1 pb-6 pt-8 text-center bg-slate-50/50">
                  <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                  <CardDescription className="text-slate-500">Join ShopHub and start your shopping journey</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-8">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                      <div className="relative group">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 h-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-lg"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10 h-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff id="eye-off-signup" className="w-4 h-4" /> : <Eye id="eye-signup" className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight pt-1">
                        Must be 8+ chars with uppercase, lowercase and a number.
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all mt-4" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-8">
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-primary flex items-center justify-center gap-2 group transition-colors">
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              Back to shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;

export default Auth;
