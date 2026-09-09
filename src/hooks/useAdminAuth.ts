import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { adminMe } from "@/lib/adminApi";

/**
 * `authState`:
 *   "loading"   — still resolving the session / admin check
 *   "guest"     — not signed in
 *   "forbidden" — signed in, but not on the admin allowlist
 *   "admin"     — good to go
 */
export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-me", user?.id],
    queryFn: adminMe,
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60_000,
  });

  let authState: "loading" | "guest" | "forbidden" | "admin" = "loading";
  if (!authLoading && !user) authState = "guest";
  else if (user && isLoading) authState = "loading";
  else if (user && (isError || !data?.isAdmin)) authState = "forbidden";
  else if (user && data?.isAdmin) authState = "admin";

  return { authState, email: data?.email ?? user?.email ?? null };
}
