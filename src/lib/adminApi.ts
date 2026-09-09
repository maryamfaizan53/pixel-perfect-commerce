/** Admin dashboard API client — every call carries the Supabase session JWT. */
import { req } from "@/lib/api";
import type {
  AdminOrderDetail,
  AdminOrderList,
  AdminStats,
  OrderPatch,
  RevenuePoint,
} from "@/types/admin";

const auth = { auth: true } as const;

export const adminMe = () => req<{ email: string; isAdmin: boolean }>("/api/admin/me", auth);

export const adminStats = (range: string) =>
  req<AdminStats>(`/api/admin/stats?range=${encodeURIComponent(range)}`, auth);

export const adminRevenue = (days: number) =>
  req<RevenuePoint[]>(`/api/admin/revenue?days=${days}`, auth);

export const adminOrders = (params: {
  status?: string;
  paymentStatus?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "all") qs.set(k, String(v));
  });
  return req<AdminOrderList>(`/api/admin/orders?${qs.toString()}`, auth);
};

export const adminOrder = (id: string) =>
  req<AdminOrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`, auth);

export const adminPatchOrder = (id: string, patch: OrderPatch) =>
  req<AdminOrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`, {
    ...auth,
    method: "PATCH",
    body: JSON.stringify(patch),
  });
