import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { useSEO } from "@/hooks/useSEO";
import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[a-z]/, "One lowercase letter")
  .regex(/[0-9]/, "One number");

type Mode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useSEO({ title: "Sign in | AI Bazar", description: "Access your AI Bazar account and orders." });

  // Recovery links land here with a session + type=recovery in the URL hash.
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setMode("reset");
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(next, { replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { setMode("reset"); return; }
      if (session && mode !== "reset") navigate(next, { replace: true });
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, next]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      toast.error(e instanceof z.ZodError ? e.errors[0].message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      emailSchema.parse(email);
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      localStorage.setItem("user-email", email.trim());
      trackMetaEvent("Login", { method: "email" });
      toast.success("Welcome back");
    });
  };

  const signUp = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName.trim() || email.split("@")[0] },
        },
      });
      if (error) throw error;
      localStorage.setItem("user-email", email.trim());
      trackMetaEvent("CompleteRegistration", { status: "success" });
      toast.success("Account created", {
        description: "If asked, confirm via the email we just sent, then sign in.",
      });
      setMode("login");
    });
  };

  const forgot = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      emailSchema.parse(email);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Check your email", { description: "We've sent a link to reset your password." });
      setMode("login");
    });
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      passwordSchema.parse(password);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate(next, { replace: true });
    });
  };

  const pwField = (id: string, label: string) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const emailField = (id: string) => (
    <div>
      <Label htmlFor={id}>Email address</Label>
      <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground tracking-tight text-center mb-1">
            {mode === "forgot" ? "Reset your password" : mode === "reset" ? "Set a new password" : "AI Bazar account"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {mode === "forgot"
              ? "We'll email you a reset link."
              : mode === "reset"
              ? "Enter a new password for your account."
              : "Sign in to see your orders and wishlist."}
          </p>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            {mode === "forgot" && (
              <form onSubmit={forgot} className="space-y-4">
                {emailField("f-email")}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
                </Button>
                <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={reset} className="space-y-4">
                {pwField("r-pass", "New password")}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update password"}
                </Button>
              </form>
            )}

            {(mode === "login" || mode === "signup") && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="w-full grid grid-cols-2 mb-5">
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <form onSubmit={signIn} className="space-y-4">
                    {emailField("l-email")}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="l-pass">Password</Label>
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:text-primary-hover">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative mt-1.5">
                        <Input
                          id="l-pass"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={signUp} className="space-y-4">
                    <div>
                      <Label htmlFor="s-name">Name</Label>
                      <Input id="s-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
                    </div>
                    {emailField("s-email")}
                    {pwField("s-pass", "Password")}
                    <p className="text-xs text-muted-foreground">8+ characters, with an uppercase letter and a number.</p>
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
