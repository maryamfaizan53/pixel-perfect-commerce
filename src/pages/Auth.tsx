import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
          const [mousePosition, setMousePosition] = useState({x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          setMousePosition({x, y});
  };

          return (
          <div className="min-h-screen flex flex-col bg-slate-900 relative overflow-hidden selection:bg-primary/30">
            <Header />

            {/* Extreme Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/10 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/10 blur-[180px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <main
              className="flex-1 flex items-center justify-center px-4 py-32 relative z-10 perspective-1000"
              onMouseMove={handleMouseMove}
            >
              <motion.div
                className="w-full max-w-[520px]"
                style={{
                  rotateY: mousePosition.x * 10,
                  rotateX: -mousePosition.y * 10,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-16 space-y-6"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Secure Protocol
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    The <span className="text-primary text-glow italic">Vault</span>
                  </h1>
                  <p className="text-white/40 font-medium text-xl max-w-sm mx-auto">Access your curated personal collection and orders.</p>
                </motion.div>

                <Card className="glass-noise glass border-white/5 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-3xl">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-24 p-3 bg-white/5 border-b border-white/5">
                      {["login", "signup"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="rounded-[2rem] data-[state=active]:bg-white data-[state=active]:text-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all h-full"
                        >
                          {tab === "login" ? "Identity" : "Genesis"}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <div className="p-10 md:p-16">
                      <TabsContent value="login" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <form onSubmit={handleSignIn} className="space-y-8">
                          <div className="space-y-3">
                            <Label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Username / Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="pioneer@nexus.com"
                                className="h-16 pl-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10 focus:ring-4 focus:ring-primary/20 hover:border-white/20 transition-all font-bold placeholder:text-white/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between ml-2">
                              <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Alpha-Key</Label>
                              <Link to="#" className="text-[10px] text-primary/60 hover:text-primary transition-colors font-black uppercase tracking-[0.3em]">Lost Key?</Link>
                            </div>
                            <div className="relative group">
                              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-16 pl-14 pr-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10 focus:ring-4 focus:ring-primary/20 hover:border-white/20 transition-all font-bold placeholder:text-white/10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl btn-premium text-white text-lg font-black tracking-widest group mt-6">
                            {loading ? (
                              <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                              <>
                                Authorize
                                <Sparkles className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform" />
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="signup" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <form onSubmit={handleSignUp} className="space-y-8">
                          <div className="space-y-3">
                            <Label htmlFor="signup-name" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Full Designation</Label>
                            <div className="relative group">
                              <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-name"
                                type="text"
                                placeholder="Neo Anderson"
                                className="h-16 pl-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10 focus:ring-4 focus:ring-primary/20 hover:border-white/20 transition-all font-bold placeholder:text-white/10"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="signup-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Email Identity</Label>
                            <div className="relative group">
                              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="user@network.com"
                                className="h-16 pl-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10 focus:ring-4 focus:ring-primary/20 hover:border-white/20 transition-all font-bold placeholder:text-white/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="signup-password" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Create Key</Label>
                            <div className="relative group">
                              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-16 pl-14 pr-14 rounded-2xl bg-white/5 border-white/10 text-white focus:bg-white/10 focus:ring-4 focus:ring-primary/20 hover:border-white/20 transition-all font-bold placeholder:text-white/10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl btn-premium text-white text-lg font-black tracking-widest group mt-6">
                            {loading ? (
                              <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                              <>
                                Initialize Genesis
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>

                <div className="flex flex-col space-y-10 mt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-slate-900 px-6 text-white/20 tracking-[0.4em]">Social Link</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 w-full">
                    <Button variant="outline" className="h-16 rounded-2xl bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10 font-black tracking-widest transition-all hover:-translate-y-1">
                      <Github className="w-5 h-5 mr-3" />
                      GITHUB
                    </Button>
                    <Button variant="outline" className="h-16 rounded-2xl bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10 font-black tracking-widest transition-all hover:-translate-y-1">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      GOOGLE
                    </Button>
                  </div>

                  <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[0.3em] leading-relaxed max-w-[320px] mx-auto">
                    By entering, you confirm acceptance of our <Link to="#" className="text-primary hover:underline">Nexus Terms</Link> & <Link to="#" className="text-primary hover:underline">Privacy Code</Link>.
                  </p>
                </div>
              </motion.div>
            </main>

            <Footer />
          </div>
          );
};

          export default Auth;
        </CardFooter>
    </div>
      </main >

  <Footer />
    </div >
  );
};

export default Auth;
