/**
 * Storefront API client — the single data source for the app.
 * Talks to the FastAPI backend (`VITE_API_URL`). Replaces `src/lib/shopify.ts`.
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  CategoryWithProducts,
  CreateOrderInput,
  CreateOrderResult,
  HomePayload,
  OrderDetail,
  Product,
  ProductCard,
  ProductList,
  Quote,
  SiteSettings,
  CartLineInput,
} from "@/types/catalog";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export async function req<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (init?.auth) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, json?.detail?.message || json?.detail || res.statusText, json);
  return json as T;
}

/* ---------------- catalog ---------------- */

export const getSiteSettings = () => req<SiteSettings>("/api/site-settings");

export const getHome = () => req<HomePayload>("/api/home");

export const getProducts = (offset = 0, limit = 24) =>
  req<ProductList>(`/api/products?offset=${offset}&limit=${limit}`);

export const getProduct = (slug: string) => req<Product>(`/api/products/${encodeURIComponent(slug)}`);

export const getRelatedProducts = (slug: string) =>
  req<ProductCard[]>(`/api/products/${encodeURIComponent(slug)}/related`);

export const searchProducts = (q: string, limit = 24) =>
  req<ProductCard[]>(`/api/products/search?q=${encodeURIComponent(q)}&limit=${limit}`);

export const getCategories = () => req<Category[]>("/api/categories");

export const getCategory = (slug: string, limit = 48) =>
  req<CategoryWithProducts>(`/api/categories/${encodeURIComponent(slug)}?limit=${limit}`);

/* ---------------- checkout ---------------- */

export const getQuote = (lines: CartLineInput[]) =>
  req<Quote>("/api/checkout/quote", { method: "POST", body: JSON.stringify({ lines }) });

export const createOrder = (input: CreateOrderInput) =>
  req<CreateOrderResult>("/api/checkout/orders", {
    method: "POST",
    body: JSON.stringify(input),
    auth: true, // attaches the user session if signed in; guest checkout still allowed
  });

export const getOrder = (id: string) =>
  req<OrderDetail>(`/api/checkout/orders/${encodeURIComponent(id)}`);

export const lookupOrder = (number: string, email: string) =>
  req<OrderDetail>(
    `/api/checkout/orders/lookup?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email)}`,
  );

export { ApiError };
