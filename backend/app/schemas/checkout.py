from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class CartLineIn(BaseModel):
    productId: str
    slug: str
    variantKey: str | None = None
    quantity: int = Field(ge=1, le=99)


class QuoteLine(BaseModel):
    productId: str
    slug: str
    variantKey: str | None
    title: str
    variantTitle: str | None
    unitPrice: float
    quantity: int
    lineTotal: float
    inStock: bool
    imageUrl: str | None


class QuoteOut(BaseModel):
    lines: list[QuoteLine]
    subtotal: float
    shippingFee: float
    total: float
    currency: str = "PKR"
    freeShippingThreshold: float
    valid: bool
    issues: list[str] = []


class ShippingAddress(BaseModel):
    fullName: str
    phone: str
    line1: str
    line2: str | None = None
    city: str
    province: str
    postalCode: str | None = None
    country: str = "Pakistan"


class CreateOrderIn(BaseModel):
    email: EmailStr
    paymentMethod: str = "cod"  # 'cod' | 'online'
    address: ShippingAddress
    lines: list[CartLineIn]
    notes: str | None = None


class CreateOrderOut(BaseModel):
    orderId: str
    orderNumber: str
    status: str
    paymentMethod: str
    total: float
    # present only when paymentMethod == 'online'
    redirectUrl: str | None = None
