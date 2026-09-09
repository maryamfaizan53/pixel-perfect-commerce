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
