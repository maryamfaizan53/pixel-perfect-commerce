"""DTOs for the /api/admin dashboard."""
from __future__ import annotations

from pydantic import BaseModel


class StatWindow(BaseModel):
    revenue: float = 0
    orderCount: int = 0
    liveOrderCount: int = 0
    aov: float = 0
    newCustomers: int = 0
    pendingCount: int = 0
    cancelledCount: int = 0
    paidCount: int = 0
    unpaidCount: int = 0
    codCount: int = 0
    onlineCount: int = 0
    byStatus: dict[str, int] = {}


class StatsOut(BaseModel):
    range: str
    current: StatWindow
    previous: StatWindow


class RevenuePoint(BaseModel):
    date: str
    revenue: float
    orders: int


class OrderRow(BaseModel):
    id: str
    orderNumber: str
    email: str
    customerName: str | None = None
    itemCount: int
    total: float
    currency: str = "PKR"
    paymentMethod: str
    paymentStatus: str
    status: str
    createdAt: str


class OrderListOut(BaseModel):
    items: list[OrderRow]
    total: int
    page: int
    pages: int


class OrderPatchIn(BaseModel):
    status: str | None = None
    paymentStatus: str | None = None
    trackingNumber: str | None = None
    note: str | None = None
    adminNotes: str | None = None


# ---- products ----
class ProductSummary(BaseModel):
    total: int = 0
    inStock: int = 0
    outOfStock: int = 0
    featured: int = 0
    withVideo: int = 0
    categories: int = 0


class TopProduct(BaseModel):
    id: str
    slug: str | None = None
    title: str
    qtySold: int
    revenue: float
    price: float | None = None
    inStock: bool | None = None
    imageUrl: str | None = None


class ProductRow(BaseModel):
    id: str
    slug: str | None = None
    title: str
    price: float | None = None
    compareAtPrice: float | None = None
    inStock: bool
    featured: bool
    imageUrl: str | None = None
    categories: list[str] = []


class ProductListOut(BaseModel):
    items: list[ProductRow]
    total: int
    page: int
    pages: int


# ---- customers ----
class CustomerRow(BaseModel):
    email: str
    name: str | None = None
    phone: str | None = None
    orders: int
    spent: float
    firstOrder: str
    lastOrder: str
    lastStatus: str


class CustomerListOut(BaseModel):
    items: list[CustomerRow]
    total: int
    page: int
    pages: int


# ---- settings ----
class SettingsOut(BaseModel):
    storeName: str = "AI Bazar"
    whatsappNumber: str = ""
    supportEmail: str | None = None
    deliveryCharge: float = 200
    freeShippingThreshold: float = 5000
    codEnabled: bool = True
    onlinePaymentEnabled: bool = False
    announcements: list[str] = []
    socialLinks: dict[str, str | None] = {}


class SettingsPatchIn(BaseModel):
    storeName: str | None = None
    whatsappNumber: str | None = None
    supportEmail: str | None = None
    deliveryCharge: float | None = None
    freeShippingThreshold: float | None = None
    codEnabled: bool | None = None
    onlinePaymentEnabled: bool | None = None
    announcements: list[str] | None = None
    socialLinks: dict[str, str | None] | None = None
