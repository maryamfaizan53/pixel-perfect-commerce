import { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { authState, email, retry } = useAdminAuth();
  const { signOut } = useAuth();
  const location = useLocation();

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (authState === "guest") {
    return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (authState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-1">Couldn't verify your access</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The server didn't respond. This is usually a momentary hiccup — try again.
          </p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={() => retry()}>Retry</Button>
            <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  if (authState === "forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-1">Not authorised</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {email} isn't an admin account. Sign in with an authorised email.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
            <Button asChild size="sm">
              <Link to="/">Back to store</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
