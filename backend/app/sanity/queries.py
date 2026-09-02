"""GROQ query strings. Kept in one place so the shape stays in sync with mapper.py."""

# Fields needed to render a product card / grid tile.
PRODUCT_CARD_PROJECTION = """
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  productType,
  vendor,
  tags,
  price,
  compareAtPrice,
  inStock,
  featured,
  "categories": categories[]->{ "slug": slug.current, title },
  "images": images[]{ "url": asset->url, "alt": coalesce(alt, ^.title), "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height },
  "hasVideo": count(videos) > 0
"""

# Everything a PDP needs.
PRODUCT_FULL_PROJECTION = PRODUCT_CARD_PROJECTION + """,
  "bodyRaw": body,
  sku,
  barcode,
  weightGrams,
  "videos": videos[]{ kind, url, "fileUrl": file.asset->url, "poster": poster.asset->url },
  options[]{ name, values },
  variants[]{
    title, sku, price, compareAtPrice, inStock, stockQuantity,
    selectedOptions[]{ name, value },
    "image": image.asset->url
  },
  seo{ metaTitle, metaDescription, "ogImage": ogImage.asset->url, noIndex }
"""

CATEGORY_PROJECTION = """
  "id": _id,
  "slug": slug.current,
  title,
  description,
  featured,
  order,
  "image": image{ "url": asset->url, "alt": coalesce(alt, ^.title) },
  "bodyRaw": body,
  seo{ metaTitle, metaDescription, "ogImage": ogImage.asset->url, noIndex }
"""

LIST_PRODUCTS = f"""
*[_type == "product" && !(_id in path("drafts.**"))]
  | order(featured desc, _createdAt desc)
  [$offset...$end] {{ {PRODUCT_CARD_PROJECTION} }}
"""

COUNT_PRODUCTS = '*[_type == "product" && !(_id in path("drafts.**"))]{_id} | length(@)'

PRODUCT_BY_SLUG = f"""
*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0]
  {{ {PRODUCT_FULL_PROJECTION} }}
"""

RELATED_PRODUCTS = f"""
*[_type == "product" && slug.current != $slug && !(_id in path("drafts.**"))
  && (productType == $productType || count((tags[])[@ in $tags]) > 0)]
  | order(featured desc)[0...12] {{ {PRODUCT_CARD_PROJECTION} }}
"""

LIST_CATEGORIES = f"""
*[_type == "category" && !(_id in path("drafts.**"))]
  | order(order asc, title asc) {{ {CATEGORY_PROJECTION} }}
"""

CATEGORY_BY_SLUG = f"""
*[_type == "category" && slug.current == $slug && !(_id in path("drafts.**"))][0]
  {{ {CATEGORY_PROJECTION} }}
"""

PRODUCTS_IN_CATEGORY = f"""
*[_type == "product" && !(_id in path("drafts.**"))
  && $slug in categories[]->slug.current]
  | order(featured desc, _createdAt desc)[0...$limit] {{ {PRODUCT_CARD_PROJECTION} }}
"""

SEARCH_PRODUCTS = f"""
*[_type == "product" && !(_id in path("drafts.**")) && (
    title match $term || excerpt match $term ||
    productType match $term || $term in tags[]
)] | order(_score desc, featured desc)[0...$limit] {{ {PRODUCT_CARD_PROJECTION} }}
"""

SITE_SETTINGS = """
*[_type == "siteSettings"][0]{
  storeName, currency, whatsappNumber, supportEmail,
  deliveryCharge, freeShippingThreshold, codEnabled, onlinePaymentEnabled,
  announcements,
  "featuredCategories": featuredCategories[]->{ "slug": slug.current, title,
    "image": image{ "url": asset->url } },
  socialLinks
}
"""

# For the import job: fetch existing products keyed by external id.
PRODUCTS_BY_EXTERNAL_IDS = """
*[_type == "product" && source.portal == $portal && source.externalId in $ids]{
  _id, "externalId": source.externalId, "lockedFields": source.lockedFields, source
}
"""

ALL_SLUGS = """
{
  "products": *[_type == "product" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt },
  "categories": *[_type == "category" && !(_id in path("drafts.**"))]{ "slug": slug.current, _updatedAt }
}
"""
