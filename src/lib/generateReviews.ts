export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    product_handle: string;
    rating: number;
    title: string | null;
    content: string | null;
    is_verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    profile?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

const PAKISTANI_NAMES = [
    "Ahmed Hassan", "Maria Khan", "Zeeshan Ali", "Sana Jameel", "Bilal Sheikh",
    "Fatima Zahra", "Hamza Malik", "Ayesha Siddiqui", "Usman Ghani", "Khadija Bibi",
    "Omer Farooq", "Zainab Malik", "Fahad Mustafa", "Amna Sheikh", "Yousuf Khan",
    "Hina Altaf", "Saad Bin Nasir", "Rabia Anum", "Mustafa Kamal", "Nida Yasir",
    "Arsalan Ahmed", "Bushra Ansari", "Kamran Akmal", "Sobia Khan", "Imran Nazir",
    "Mehak Gul", "Asad Shafiq", "Sara Khan", "Tariq Aziz", "Saira Banu",
    "Waqar Younis", "Irum Sheikh", "Babar Azam", "Maliha Khan", "Shoaib Malik",
    "Nadia Hussain", "Rashid Khan", "Zoya Nasir", "Haris Rauf", "Iqra Aziz"
];

const FEEDBACK_TEMPLATES = {
    general: [
        "Very satisfied with the quality. Best price in Pakistan!",
        "Delivery was fast, reached Karachi in 1 day.",
        "Bohot achi quality hai, exactly as shown in pictures.",
        "Recommended! Service is 10/10.",
        "Original product, verified. Shukria AI Bazar.",
        "Lowest price guaranteed truly. Checked other sites too.",
        "Free shipping saved me money. Great experience.",
        "Excellent customer support on WhatsApp.",
        "Good quality for the price. Value for money.",
        "Fastest delivery I've ever experienced in Pakistan."
    ],
    kitchen: [
        "Makes meal prep so much easier! Love this slicer.",
        "Highly functional kitchen gadget. Saves a lot of time.",
        "Sharp blades and sturdy build. Perfect for my kitchen.",
        "Must have for every Pakistani household.",
        "Very easy to clean and use. Great for daily cooking.",
        "Compact and powerful. Smart choice for small kitchens.",
        "Kitchen queen helper! Bohot kaam ka hai.",
        "Original quality kitchen tool. Best in this price."
    ],
    lamp: [
        "Soft glow is perfect for my baby's nursery.",
        "Cute design and safe material. My kids love it.",
        "Aesthetic decor piece! Adds a warm vibe to the room.",
        "Eyes protective light, great for reading at night.",
        "Rechargeable battery lasts a long time. Very convenient.",
        "Beautiful night light. Safe for toddlers too.",
        "Best gift for kids. Adorable and functional.",
        "Lighting is perfect, not too bright but just enough."
    ],
    beauty: [
        "Salon quality results at home. Professional grooming kit.",
        "Skin friendly material. No irritation at all.",
        "Easy to use and maintain. Professional results guaranteed.",
        "Better than expensive brands. Value for money beauty tool.",
        "Compact and rechargeable. Perfect for travel.",
        "Smooth performance. Exactly what I was looking for.",
        "Bohot acha result hai. Fast and painless.",
        "Daily grooming essential now. Highly recommended."
    ],
    hair: [
        "Salon style look in minutes! Anti-frizz is actual feature.",
        "Bohot jaldi heat ho jata hai. Perfect for busy mornings.",
        "Heat protection is good. Doesn't damage hair.",
        "Best hair tool in Pakistan at this price range.",
        "Professional styling made easy. Auto rotating works great.",
        "Sleek design and powerful performance.",
        "Finally found a tool that doesn't burn my skin.",
        "Silky and smooth hair every time. Love it!"
    ]
};

// Deterministic random generator based on string seed
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return function () {
        hash = Math.sin(hash++) * 10000;
        return hash - Math.floor(hash);
    };
}

export function generateDeterministicReviews(
    productId: string,
    productHandle: string,
    category: string = 'general'
): Review[] {
    const random = seededRandom(productId + productHandle);

    // Decide how many reviews (30-50)
    const count = Math.floor(random() * 21) + 30;

    const categoryKey = category.toLowerCase().includes('kitchen') ? 'kitchen' :
        category.toLowerCase().includes('lamp') ? 'lamp' :
            category.toLowerCase().includes('beauty') ? 'beauty' :
                category.toLowerCase().includes('hair') ? 'hair' : 'general';

    const templates = [...FEEDBACK_TEMPLATES.general, ...FEEDBACK_TEMPLATES[categoryKey]];

    const reviews: Review[] = [];
    const baseDate = new Date("2025-01-01").getTime();
    const timeSpread = new Date().getTime() - baseDate;

    for (let i = 0; i < count; i++) {
        const nameIndex = Math.floor(random() * PAKISTANI_NAMES.length);
        const templateIndex = Math.floor(random() * templates.length);
        const rating = random() > 0.8 ? 4 : 5; // Mostly 5 stars, some 4 stars
        const dateOffset = Math.floor(random() * timeSpread);
        const createdAt = new Date(baseDate + dateOffset).toISOString();

        reviews.push({
            id: `sim-${productId}-${i}`,
            user_id: `user-${i}`,
            product_id: productId,
            product_handle: productHandle,
            rating: rating,
            title: rating === 5 ? "Excellent Product" : "Very Good",
            content: templates[templateIndex],
            is_verified_purchase: true,
            helpful_count: Math.floor(random() * 15),
            created_at: createdAt,
            updated_at: createdAt,
            profile: {
                full_name: PAKISTANI_NAMES[nameIndex],
                avatar_url: null
            }
        });
    }

    // Sort by date descending
    return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
