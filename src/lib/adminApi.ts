/** Admin dashboard API client — every call carries the Supabase session JWT. */
import { req } from "@/lib/api";
import type {
  AdminOrderDetail,
  AdminOrderList,
  AdminSettings,
  AdminStats,
  CustomerList,
  OrderPatch,
  ProductList,
  ProductSummary,
  RevenuePoint,
  SettingsPatch,
  TopProduct,
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

// ---- products ----
export const adminProductSummary = () =>
  req<ProductSummary>("/api/admin/products/summary", auth);

export const adminTopProducts = (days: number, limit = 10) =>
  req<TopProduct[]>(`/api/admin/products/top?days=${days}&limit=${limit}`, auth);

export const adminOutOfStock = (page = 1, limit = 20) =>
  req<ProductList>(`/api/admin/products/out-of-stock?page=${page}&limit=${limit}`, auth);

// ---- customers ----
export const adminCustomers = (params: {
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  return req<CustomerList>(`/api/admin/customers?${qs.toString()}`, auth);
};

// ---- settings ----
export const adminGetSettings = () => req<AdminSettings>("/api/admin/settings", auth);

export const adminPatchSettings = (patch: SettingsPatch) =>
  req<AdminSettings>("/api/admin/settings", {
    ...auth,
    method: "PATCH",
    body: JSON.stringify(patch),
  });
