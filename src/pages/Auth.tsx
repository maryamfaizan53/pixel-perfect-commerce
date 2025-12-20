import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, Github } from "lucide-react";
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = signUpSchema.parse({ email, password, fullName });
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: validatedData.fullName || validatedData.email.split('@')[0] }
        }
      });
      if (error) throw error;
      toast.success("Account created successfully!", { description: "Explore the collection now." });
    } catch (error: any) {
      toast.error(error instanceof z.ZodError ? error.errors[0].message : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = signInSchema.parse({ email, password });
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });
      if (error) throw error;
      toast.success("Welcome back to ShopHub!");
    } catch (error: any) {
      toast.error(error instanceof z.ZodError ? error.errors[0].message : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      <Header />

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <div className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Gateway
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Experience ShopHub</h1>
            <p className="text-slate-500 font-medium text-lg">Elevate your shopping journey with our premium collection.</p>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-2xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-20 p-2 bg-slate-100/50 rounded-none border-b border-slate-100">
                <TabsTrigger
                  value="login"
                  className="rounded-3xl data-[state=active]:bg-white data-[state=active]:shadow-xl text-xs font-black uppercase tracking-widest transition-all h-full"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-3xl data-[state=active]:bg-white data-[state=active]:shadow-xl text-xs font-black uppercase tracking-widest transition-all h-full"
                >
                  Join Now
                </TabsTrigger>
              </TabsList>

              <div className="p-8 md:p-12">
                <TabsContent value="login" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity (Email)</Label>
                      <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@example.com"
                          className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all font-bold"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Key</Label>
                        <Link to="#" className="text-[10px] text-primary hover:underline font-black uppercase tracking-widest">Reset?</Link>
                      </div>
                      <div className="relative group/input">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all font-bold"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-hover text-white text-lg font-black shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group mt-4">
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          Enter ShopHub
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</Label>
                      <div className="relative group/input">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all font-bold"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity (Email)</Label>
                      <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all font-bold"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Security Key</Label>
                      <div className="relative group/input">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 hover:border-slate-300 transition-all font-bold"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-hover text-white text-lg font-black shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group mt-4">
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          <CardFooter className="flex flex-col space-y-8 mt-10">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-50 px-4 font-black text-slate-400 tracking-[0.2em]">Social Integration</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" className="h-14 rounded-2xl border-slate-200 hover:bg-white hover:border-slate-300 font-bold transition-all hover:scale-105 active:scale-95">
                <Github className="w-5 h-5 mr-3" />
                Github
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl border-slate-200 hover:bg-white hover:border-slate-300 font-bold transition-all hover:scale-105 active:scale-95">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[300px] mx-auto">
              By entering, you confirm acceptance of our <Link to="#" className="text-primary hover:underline">Terms</Link> & <Link to="#" className="text-primary hover:underline">Privacy</Link>.
            </p>
          </CardFooter>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;

export default Auth;
