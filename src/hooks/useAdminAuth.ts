import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { adminMe } from "@/lib/adminApi";

const statusOf = (e: unknown): number | undefined =>
  e && typeof e === "object" && "status" in e ? (e as { status?: number }).status : undefined;

/**
 * `authState`:
 *   "loading"   — still resolving the session / admin check
 *   "guest"     — not signed in
 *   "forbidden" — signed in, but the backend says this email isn't an admin (a real 403)
 *   "error"     — signed in, but the check failed for another reason (network / 401 race / 500)
 *   "admin"     — good to go
 */
export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();

  const q = useQuery({
    queryKey: ["admin-me", user?.id],
    queryFn: adminMe,
    enabled: !!user,
    staleTime: 5 * 60_000,
    // A 403 is a definitive "not an admin" — don't retry. Anything else
    // (401 session-token race, transient network) gets a few attempts.
    retry: (count, err) => statusOf(err) !== 403 && count < 3,
    retryDelay: (count) => Math.min(1000 * 2 ** count, 4000),
  });

  let authState: "loading" | "guest" | "forbidden" | "error" | "admin" = "loading";
  if (!authLoading && !user) authState = "guest";
  else if (user && (q.isLoading || q.isFetching) && !q.data) authState = "loading";
  else if (user && q.data?.isAdmin) authState = "admin";
  else if (user && statusOf(q.error) === 403) authState = "forbidden";
  else if (user && q.isError) authState = "error";
  else if (user && q.data && !q.data.isAdmin) authState = "forbidden";

  return { authState, email: q.data?.email ?? user?.email ?? null, retry: q.refetch };
}
