"""Response DTOs for the storefront. Stable shape the React app depends on."""
from __future__ import annotations

from pydantic import BaseModel


class ImageDTO(BaseModel):
    url: str
    alt: str = ""
    width: int | None = None
    height: int | None = None


class VideoDTO(BaseModel):
    kind: str  # "file" | "external"
    url: str
    poster: str | None = None


class CategoryRefDTO(BaseModel):
    slug: str
    title: str


class OptionDTO(BaseModel):
    name: str
    values: list[str]


class VariantDTO(BaseModel):
    key: str
    title: str
    price: float
    compareAtPrice: float | None = None
    inStock: bool = True
    selectedOptions: list[dict[str, str]] = []
    image: str | None = None


class RatingDTO(BaseModel):
    average: float
    count: int


class SeoDTO(BaseModel):
    title: str | None = None
    description: str | None = None
    ogImage: str | None = None
    noIndex: bool = False


class ProductCardDTO(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str = ""
    productType: str = ""
    vendor: str = ""
    tags: list[str] = []
    categories: list[CategoryRefDTO] = []
    price: float
    compareAtPrice: float | None = None
    currency: str = "PKR"
    inStock: bool = True
    featured: bool = False
    hasVideo: bool = False
    images: list[ImageDTO] = []
    rating: RatingDTO | None = None


class ProductDTO(ProductCardDTO):
    bodyHtml: str | None = None
    sku: str | None = None
    barcode: str | None = None
    weightGrams: float | None = None
    videos: list[VideoDTO] = []
    options: list[OptionDTO] = []
    variants: list[VariantDTO] = []
    seo: SeoDTO = SeoDTO()


class CategoryDTO(BaseModel):
    id: str
    slug: str
    title: str
    description: str = ""
    bodyHtml: str | None = None
    featured: bool = False
    order: int = 100
    image: ImageDTO | None = None
    seo: SeoDTO = SeoDTO()


class ProductListDTO(BaseModel):
    items: list[ProductCardDTO]
    total: int
    offset: int
    limit: int


class CategoryWithProductsDTO(BaseModel):
    category: CategoryDTO
    products: list[ProductCardDTO]


class HomeRowDTO(BaseModel):
    category: CategoryDTO
    products: list[ProductCardDTO]


class HomeDTO(BaseModel):
    featuredCategories: list[CategoryDTO]
    rows: list[HomeRowDTO]


class SiteSettingsDTO(BaseModel):
    storeName: str = "AI Bazar"
    currency: str = "PKR"
    whatsappNumber: str = ""
    supportEmail: str | None = None
    deliveryCharge: float = 200
    freeShippingThreshold: float = 5000
    codEnabled: bool = True
    onlinePaymentEnabled: bool = False
    announcements: list[str] = []
    socialLinks: dict[str, str | None] = {}
