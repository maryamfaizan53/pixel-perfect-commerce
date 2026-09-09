export interface StatWindow {
  revenue: number;
  orderCount: number;
  liveOrderCount: number;
  aov: number;
  newCustomers: number;
  pendingCount: number;
  cancelledCount: number;
  paidCount: number;
  unpaidCount: number;
  codCount: number;
  onlineCount: number;
  byStatus: Record<string, number>;
}

export interface AdminStats {
  range: string;
  current: StatWindow;
  previous: StatWindow;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  email: string;
  customerName: string | null;
  itemCount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export interface AdminOrderList {
  items: AdminOrderRow[];
  total: number;
  page: number;
  pages: number;
}

export interface OrderStatusEvent {
  status: string;
  note: string | null;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  email: string;
  phone: string | null;
  customerName: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    province?: string;
    postalCode?: string | null;
    country?: string;
  } | null;
  notes: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: {
    productTitle: string;
    variantTitle: string | null;
    productSlug: string | null;
    quantity: number;
    price: number;
    total: number;
    imageUrl: string | null;
  }[];
  statusHistory: OrderStatusEvent[];
}

export interface OrderPatch {
  status?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  note?: string;
  adminNotes?: string;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"] as const;
