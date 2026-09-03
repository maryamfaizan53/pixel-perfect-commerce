"""Keyword-based categorisation for the HHC import.

The export has no category column, so we derive one from the title/excerpt.
Rules are ordered — first match wins, so put specific before general.
Everything is editable afterwards in the Studio; `source.lockedFields`
should include "categories" once a human has curated a product.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

CURRENCY = "PKR"


@dataclass(frozen=True)
class CategoryDef:
    slug: str
    title: str
    order: int
    featured: bool
    keywords: tuple[str, ...]


# order ~ homepage position; `featured` ~ shown in hero grid / rows
CATEGORIES: list[CategoryDef] = [
    CategoryDef("kitchen", "Kitchen & Dining", 1, True, (
        "kitchen", "cutter", "chopper", "peeler", "grater", "slicer", "knife", "cookware",
        "frying pan", "sauce pan", "spatula", "whisk", "beater", "blender", "juicer",
        "rolling pin", "dough", "samosa", "oil sprayer", "storage jar", "lunch box",
        "water bottle", "mug", "cup", "plate", "cutlery", "strainer", "colander",
        "chopping board", "cutting board", "kadai", "tawa", "food container",
    )),
    CategoryDef("health-wellness", "Health & Wellness", 2, True, (
        "massager", "massage gun", "blood pressure", "thermometer", "nebulizer",
        "posture", "knee", "back pain", "orthopedic", "orthopaedic", "compression",
        "pain relief", "heating pad", "first aid", "supplement", "vitamin", "collagen",
        "tummy trimmer", "waist trainer", "sauna belt", "steamer", "inhaler", "oximeter",
    )),
    CategoryDef("beauty", "Beauty & Personal Care", 3, True, (
        "makeup", "lipstick", "lip tint", "liptint", "lip gloss", "foundation", "concealer",
        "mascara", "eyeliner", "eyeshadow", "blush", "highlighter", "primer", "setting spray",
        "serum", "moisturizer", "moisturiser", "face wash", "cleanser", "toner", "sunscreen",
        "facial", "skincare", "cream", "lotion", "whitening", "acne", "pimple", "nail",
        "manicure", "pedicure", "eyebrow", "eyelash", "beauty blender", "cosmetic",
        "perfume", "fragrance", "body spray", "deodorant", "attar", "roll on",
    )),
    CategoryDef("hair", "Hair Care & Styling", 4, True, (
        "hair straightener", "hair dryer", "blow dry", "curler", "curling", "hair brush",
        "hair oil", "hair growth", "hair mask", "shampoo", "conditioner", "hair serum",
        "hair color", "hair colour", "hair clip", "wig", "hair removal", "epilator",
        "trimmer", "clipper", "shaver", "beard", "razor",
    )),
    CategoryDef("electronics", "Electronics & Gadgets", 5, True, (
        "smartwatch", "smart watch", "earbuds", "earphone", "headphone", "bluetooth speaker",
        "power bank", "charger", "adapter", "usb", "cable", "led strip", "projector",
        "camera", "webcam", "keyboard", "mouse", "hard disk", "flash drive", "gps tracker",
        "gadget", "electronic", "torch", "flashlight", "calculator", "scanner", "printer",
        "hdmi", "converter", "extension", "socket",
    )),
    CategoryDef("mobile-accessories", "Mobile Accessories", 6, False, (
        "phone case", "mobile cover", "screen protector", "tempered glass", "phone holder",
        "car mount", "selfie stick", "ring holder", "popsocket", "mobile stand", "otg",
        "sim", "mobile charger", "type-c", "lightning cable",
    )),
    CategoryDef("lighting", "Lighting & Lamps", 7, False, (
        "night light", "night lamp", "table lamp", "desk lamp", "led bulb", "wall light",
        "fairy lights", "string lights", "chandelier", "lantern", "salt lamp", "galaxy light",
        "star projector", "ring light", "study lamp", "emergency light",
    )),
    CategoryDef("home-living", "Home & Living", 8, True, (
        "wall art", "photo frame", "photo tile", "wall clock", "clock", "vase", "cushion",
        "curtain", "bedsheet", "blanket", "quilt", "pillow", "rug", "mat", "doormat",
        "organizer", "organiser", "rack", "shelf", "hook", "hanger", "basket", "bin",
        "dustbin", "storage box", "drawer", "cabinet", "decor", "decoration", "artificial plant",
        "wall sticker", "mirror", "showpiece", "candle", "diffuser",
    )),
    CategoryDef("cleaning", "Cleaning & Household", 9, False, (
        "mop", "broom", "duster", "vacuum", "cleaning brush", "scrubber", "sponge",
        "glove", "detergent", "stain remover", "lint remover", "cobweb", "squeegee",
        "toilet brush", "drain", "pest", "mosquito", "insect", "air freshener",
    )),
    CategoryDef("baby-kids-toys", "Baby, Kids & Toys", 10, True, (
        "baby", "infant", "toddler", "kids", "children", "toy", "plush", "teether",
        "feeding bottle", "pacifier", "diaper", "stroller", "walker", "educational",
        "learning", "puzzle", "building blocks", "doll", "car toy", "remote control car",
        "prayer mat kids", "school bag",
    )),
    CategoryDef("fashion", "Fashion & Accessories", 11, True, (
        "handbag", "shoulder bag", "tote bag", "backpack", "wallet", "purse", "clutch",
        "belt", "sunglasses", "cap", "hat", "scarf", "gloves", "socks", "tie", "watch strap",
        "travel bag", "duffel", "crossbody", "sling bag", "shopping bag",
    )),
    CategoryDef("jewellery", "Jewellery", 12, False, (
        "necklace", "earring", "bracelet", "bangle", "ring set", "pendant", "anklet",
        "jewelry", "jewellery", "brooch", "nose pin", "chain",
    )),
    CategoryDef("watches", "Watches", 13, False, (
        "wrist watch", "wristwatch", "analog watch", "digital watch", "couple watch",
        "watch for men", "watch for women", "watch color",
    )),
    CategoryDef("fitness", "Fitness & Sports", 14, False, (
        "yoga", "dumbbell", "resistance band", "skipping rope", "jump rope", "gym",
        "exercise", "workout", "treadmill", "ab roller", "push up", "grip", "sports",
        "cycling", "football", "cricket", "badminton",
    )),
    CategoryDef("car-auto", "Car & Auto", 15, False, (
        "car ", "vehicle", "windshield", "car seat", "car vacuum", "car charger",
        "car perfume", "car freshener", "tyre", "tire", "car cover", "bike ", "motorcycle",
        "car organizer", "dashboard", "car light",
    )),
    CategoryDef("tools", "Tools & Hardware", 16, False, (
        "screwdriver", "drill", "hammer", "wrench", "plier", "tool kit", "tool set",
        "tape measure", "glue gun", "soldering", "hardware", "hand tool", "saw", "clamp",
        "door fitter", "lock", "hinge",
    )),
    CategoryDef("stationery", "Stationery & Office", 17, False, (
        "pen", "pencil", "marker", "highlighter pen", "notebook", "diary", "notepad",
        "sticky note", "stapler", "file", "folder", "calculator", "sketch", "art set",
        "stationery", "stationary", "eraser", "sharpener", "glue stick", "clipboard",
    )),
    CategoryDef("pets", "Pet Supplies", 18, False, (
        "pet ", "dog ", "cat ", "aquarium", "fish tank", "bird cage", "leash", "pet bowl",
        "pet bed", "litter", "pet grooming",
    )),
    CategoryDef("seasonal", "Heaters & Seasonal", 19, False, (
        "heater", "geyser", "water heater", "instant heating", "electric blanket",
        "hand warmer", "room heater", "hot water bottle", "air conditioner", "cooler",
        "winter", "thermal",
    )),
]

_FEATURED_ORDER = [c.slug for c in CATEGORIES if c.featured]
UNCATEGORISED = CategoryDef("more", "More Products", 99, False, ())


def _kw_pattern(keywords: tuple[str, ...]) -> re.Pattern[str]:
    # word-boundary match so "otg" doesn't fire inside "cottage", etc.
    alts = "|".join(re.escape(k.strip()) for k in keywords)
    return re.compile(rf"\b(?:{alts})\b", re.I)


_COMPILED = [(c, _kw_pattern(c.keywords)) for c in CATEGORIES if c.keywords]


def categorise(title: str, excerpt: str = "", body: str = "") -> list[str]:
    """Return matching category slugs (0..2), most specific first."""
    hay = f" {title} {excerpt} {body} ".lower()
    hits: list[str] = []
    for cat, rx in _COMPILED:
        if rx.search(hay):
            hits.append(cat.slug)
        if len(hits) == 2:
            break
    return hits or [UNCATEGORISED.slug]


def category_seed_docs() -> list[dict]:
    docs = []
    for c in [*CATEGORIES, UNCATEGORISED]:
        docs.append(
            {
                "_id": f"category.{c.slug}",
                "_type": "category",
                "title": c.title,
                "slug": {"_type": "slug", "current": c.slug},
                "order": c.order,
                "featured": c.featured,
                "source": {"_type": "externalSource", "portal": "manual", "externalId": c.slug},
            }
        )
    return docs
