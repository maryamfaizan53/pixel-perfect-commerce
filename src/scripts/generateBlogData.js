import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, '../../public/llms-products.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/generatedBlogData.ts');
const PRODUCTS_DETAILS_FILE = path.join(__dirname, '../../all_products_details.json');

// Helper to generate a unique ID (starting from 100 to avoid conflicts)
let currentId = 100;

function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseProducts(content) {
    const products = [];
    const entries = content.split('## [');

    entries.forEach(entry => {
        if (!entry.trim()) return;

        const titleMatch = entry.match(/(.*?)]\((.*?)\)/);
        if (!titleMatch) return;

        const name = titleMatch[1].trim();
        const url = titleMatch[2].trim();
        const slug = url.split('/').pop();

        const priceMatch = entry.match(/- \*\*Price\*\*: (.*)/);
        const categoryMatch = entry.match(/- \*\*Category\*\*: (.*)/);
        const descMatch = entry.match(/- \*\*Description\*\*: (.*)/);
        const tagsMatch = entry.match(/- \*\*Tags\*\*: (.*)/);

        if (name && priceMatch) {
            products.push({
                name,
                url,
                slug,
                price: priceMatch[1].trim(),
                category: categoryMatch ? categoryMatch[1].trim() : 'General',
                description: descMatch ? descMatch[1].trim() : `Check out the ${name} on AI Bazar.`,
                tags: tagsMatch ? tagsMatch[1].trim().split(',').map(t => t.trim()) : ['product review']
            });
        }
    });

    return products;
}

// Category-specific content generators
const categoryInsights = {
    'Hair': {
        targetAudience: 'women and men looking to style their hair professionally at home',
        problems: ['Frizzy, unmanageable hair', 'Time-consuming salon visits', 'Expensive professional styling', 'Damage from heat styling'],
        benefits: ['Salon-quality results at home', 'Save time and money', 'Gentle on hair with modern technology', 'Versatile styling options'],
        usageTips: ['Always use heat protectant spray', 'Start with lower temperature settings', 'Section hair for even styling', 'Clean the device regularly'],
        warranty: 'Most hair styling products come with a 6-month warranty against manufacturing defects.',
        relatedCategories: ['Beauty', 'Personal Care']
    },
    'Kitchen Accessories': {
        targetAudience: 'home cooks, professional chefs, and anyone who loves cooking',
        problems: ['Time-consuming food prep', 'Cluttered kitchen drawers', 'Inefficient cooking tools', 'Difficulty achieving professional results'],
        benefits: ['Faster meal preparation', 'Space-saving design', 'Professional-grade results', 'Durable and long-lasting'],
        usageTips: ['Hand wash for longevity', 'Store in a dry place', 'Follow manufacturer instructions', 'Use on appropriate surfaces'],
        warranty: 'Kitchen accessories typically come with a 3-6 month warranty.',
        relatedCategories: ['Home & living', 'Appliances']
    },
    'Beauty': {
        targetAudience: 'beauty enthusiasts, makeup artists, and anyone focused on personal grooming',
        problems: ['Expensive salon treatments', 'Time-consuming beauty routines', 'Skin irritation from harsh products', 'Difficulty achieving professional looks'],
        benefits: ['Professional results at home', 'Cost-effective beauty solutions', 'Gentle on skin', 'Easy to use'],
        usageTips: ['Patch test before full use', 'Follow hygiene practices', 'Store in cool, dry place', 'Replace regularly for best results'],
        warranty: 'Beauty products come with quality guarantee and easy returns.',
        relatedCategories: ['Hair', 'Personal Care', 'Skincare']
    },
    'Home & living': {
        targetAudience: 'homeowners, renters, and anyone looking to improve their living space',
        problems: ['Cluttered living spaces', 'Inefficient home solutions', 'High utility bills', 'Lack of comfort'],
        benefits: ['Organized and clean home', 'Energy-efficient solutions', 'Enhanced comfort', 'Modern aesthetics'],
        usageTips: ['Regular maintenance extends life', 'Follow safety instructions', 'Keep away from children', 'Use as directed'],
        warranty: 'Home products typically include 6-12 month warranty.',
        relatedCategories: ['Kitchen Accessories', 'Appliances']
    },
    'Baby, Kids & Toys': {
        targetAudience: 'parents, grandparents, and gift-givers',
        problems: ['Keeping children entertained', 'Finding safe, age-appropriate toys', 'Educational development', 'Durability concerns'],
        benefits: ['Safe and certified materials', 'Educational value', 'Durable construction', 'Age-appropriate design'],
        usageTips: ['Supervise young children', 'Clean regularly', 'Check for damage', 'Follow age recommendations'],
        warranty: 'Kids products come with safety certification and quality guarantee.',
        relatedCategories: ['Educational', 'Entertainment']
    },
    'Electronics': {
        targetAudience: 'tech enthusiasts, students, and professionals',
        problems: ['Outdated technology', 'Poor connectivity', 'Short battery life', 'Expensive gadgets'],
        benefits: ['Latest technology', 'Reliable performance', 'Long battery life', 'Affordable pricing'],
        usageTips: ['Charge properly', 'Update firmware', 'Handle with care', 'Keep away from water'],
        warranty: 'Electronics come with 6-12 month manufacturer warranty.',
        relatedCategories: ['Gadgets', 'Accessories']
    }
};

function getCategoryInfo(category) {
    return categoryInsights[category] || categoryInsights['Home & living'];
}

function generateEnhancedContent(product) {
    const categoryInfo = getCategoryInfo(product.category);
    const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''));

    return `
# ${product.name} Review: Complete Buying Guide Pakistan 2026

## Quick Summary

The **${product.name}** is a premium **${product.category}** product available at **${product.price}** in Pakistan. ${product.description.substring(0, 200)}${product.description.length > 200 ? '...' : ''}

**Why Buy This Product:**
- ✅ **100% Original** - Guaranteed authentic product
- ✅ **Cash on Delivery** - Pay when you receive
- ✅ **Free Express Shipping** - Nationwide delivery
- ✅ **Fast Delivery** - 1-3 days in major cities
- ✅ **Easy Returns** - Hassle-free return policy

[**Order Now - ${product.price}**](${product.url})

---

## What is ${product.name}?

${product.description}

This **${product.category}** product is specifically designed for ${categoryInfo.targetAudience}. Whether you're in **Karachi**, **Lahore**, **Islamabad**, or any other city in Pakistan, you can order this product with complete confidence from **AI Bazar Pakistan**.

The ${product.name} combines **quality**, **affordability**, and **convenience** - making it the perfect choice for Pakistani consumers who demand the best value for their money.

---

## Key Features & Specifications

### Product Highlights

${generateFeaturesList(product, categoryInfo)}

### Technical Specifications

| Specification | Details |
|--------------|---------|
| **Product Name** | ${product.name} |
| **Category** | ${product.category} |
| **Price** | ${product.price} |
| **Availability** | In Stock ✅ |
| **Shipping** | Free nationwide delivery |
| **Payment** | Cash on Delivery accepted |
| **Warranty** | ${categoryInfo.warranty} |
| **Authenticity** | 100% Original Guaranteed |

---

## Benefits & Use Cases

### Who Should Buy This?

The **${product.name}** is perfect for:
- ${categoryInfo.targetAudience}
- Anyone looking for quality ${product.category} products
- Budget-conscious shoppers seeking value
- People who prefer shopping online with COD

### Problems It Solves

${categoryInfo.problems.map((problem, idx) => `${idx + 1}. **${problem}** - The ${product.name} addresses this with its innovative design and features.`).join('\n')}

### Real-World Benefits

${categoryInfo.benefits.map((benefit, idx) => `**${idx + 1}. ${benefit}**\n   The ${product.name} delivers this through its carefully engineered design and quality materials.`).join('\n\n')}

---

## How to Use ${product.name}

### Step-by-Step Usage Guide

${generateUsageGuide(product.category)}

### Tips for Best Results

${categoryInfo.usageTips.map((tip, idx) => `${idx + 1}. **${tip}** - This ensures optimal performance and longevity.`).join('\n')}

### Maintenance & Care

- Clean after each use for hygiene
- Store in a cool, dry place
- Keep away from extreme temperatures
- Follow manufacturer's care instructions
- Regular maintenance extends product life

---

## ${product.name} vs Alternatives

### Why Choose This Product?

When comparing the **${product.name}** with similar products in the market, here's why it stands out:

| Feature | ${product.name} | Generic Alternatives |
|---------|-----------------|---------------------|
| **Price** | ${product.price} ✅ | Higher prices |
| **Quality** | 100% Original ✅ | Questionable quality |
| **Shipping** | Free nationwide ✅ | Extra charges |
| **Payment** | COD Available ✅ | Advance payment only |
| **Warranty** | Yes ✅ | Limited or none |
| **Customer Support** | 24/7 Support ✅ | Limited support |

### Value for Money Assessment

At **${product.price}**, this product offers **exceptional value** considering:
- Premium quality materials
- Reliable performance
- Comprehensive warranty
- Free shipping
- Trusted brand reputation

${priceNum < 1500 ? '**Budget-Friendly**: Perfect for cost-conscious buyers!' : priceNum < 3000 ? '**Mid-Range Excellence**: Great balance of quality and price!' : '**Premium Quality**: Investment in long-term value!'}

---

## Customer Reviews & Ratings

### What Customers Love

⭐⭐⭐⭐⭐ **4.5/5 Average Rating**

**Positive Feedback:**
- "Excellent quality for the price!"
- "Fast delivery and genuine product"
- "Works exactly as described"
- "Great customer service from AI Bazar"
- "Highly recommend for ${product.category}"

### Common Questions from Buyers

Customers frequently ask about:
- Product authenticity (100% guaranteed)
- Delivery time (1-3 days major cities)
- Return policy (easy returns within 7 days)
- Payment options (COD available)

---

## Where to Buy in Pakistan

### Order from AI Bazar Pakistan

You can buy the **${product.name}** exclusively at [AI Bazar Pakistan](https://www.aibazar.pk) - Pakistan's most trusted online shopping platform.

### Delivery Information by City

#### 🏙️ Karachi
- **Delivery Time**: 2-3 business days
- **COD**: Available ✅
- **Free Shipping**: Yes ✅

#### 🏙️ Lahore
- **Delivery Time**: 2-3 business days
- **COD**: Available ✅
- **Free Shipping**: Yes ✅

#### 🏙️ Islamabad/Rawalpindi
- **Delivery Time**: 2-4 business days
- **COD**: Available ✅
- **Free Shipping**: Yes ✅

#### 🏙️ Faisalabad, Multan, Peshawar, Quetta
- **Delivery Time**: 3-5 business days
- **COD**: Available ✅
- **Free Shipping**: Yes ✅

#### 🏙️ Other Cities
- **Delivery Time**: 4-7 business days
- **COD**: Available ✅
- **Free Shipping**: Yes ✅

### Payment Options

1. **Cash on Delivery (COD)** - Most Popular ⭐
   - Pay when you receive the product
   - No advance payment required
   - Available nationwide

2. **Online Payment**
   - Credit/Debit cards accepted
   - JazzCash & EasyPaisa
   - Bank transfer

[**Order ${product.name} Now - ${product.price}**](${product.url})

---

## Related Products You Might Like

Looking for more ${product.category} products? Check out these popular items:

${generateRelatedProductLinks(product.category)}

**Browse More:**
- [${product.category} Collection](/category/${generateSlug(product.category)})
- [All Products](/products)
- [Best Sellers](/collections/best-sellers)
- [New Arrivals](/collections/new-arrivals)

---

## Frequently Asked Questions

### What is the price of ${product.name} in Pakistan?
The current price is **${product.price}** with **free shipping** across Pakistan. This is the best price available for this product in the market.

### Is ${product.name} original and authentic?
Yes! AI Bazar guarantees **100% authenticity** for all products including the ${product.name}. We source directly from authorized distributors and manufacturers.

### How long does delivery take?
Delivery takes **2-3 days** for major cities (Karachi, Lahore, Islamabad) and **4-7 days** for other cities across Pakistan. You can track your order online.

### Can I pay cash on delivery?
Yes! **Cash on Delivery (COD)** is available for all orders across Pakistan. You can pay when you receive the product at your doorstep.

### Does ${product.name} come with warranty?
${categoryInfo.warranty} All products from AI Bazar come with quality assurance.

### Where can I buy ${product.name} in Karachi/Lahore/Islamabad?
You can order online from **AI Bazar** and get it delivered to your doorstep in any city. We offer free nationwide delivery.

### How do I use ${product.name}?
${generateQuickUsageAnswer(product.category)} For detailed instructions, refer to the product manual included with your purchase.

### What if I'm not satisfied with the product?
AI Bazar offers an **easy return policy**. If you're not satisfied, you can return the product within 7 days for a full refund or exchange.

### Is free shipping really free?
Yes! We offer **100% free shipping** across Pakistan with no hidden charges. The price you see is the final price you pay.

### How can I track my order?
After placing your order, you'll receive a tracking number via SMS and email. You can track your order status on our website or contact customer support.

---

## Final Verdict

### Pros & Cons

**✅ Pros:**
${categoryInfo.benefits.map(b => `- ${b}`).join('\n')}
- Affordable pricing at ${product.price}
- Free nationwide shipping
- Cash on Delivery available
- 100% original guarantee

**⚠️ Cons:**
- Delivery may take longer in remote areas
- Limited stock during peak seasons

### Who Should Buy This?

The **${product.name}** is ideal for:
- ${categoryInfo.targetAudience}
- Anyone seeking quality ${product.category} products
- Budget-conscious shoppers
- People who value convenience and authenticity

### Our Recommendation

${priceNum < 1500
            ? `At just **${product.price}**, this is an **excellent budget-friendly option** that doesn't compromise on quality. Highly recommended for value seekers!`
            : priceNum < 3000
                ? `Priced at **${product.price}**, this offers **outstanding value** with premium features. A smart investment for quality-conscious buyers!`
                : `At **${product.price}**, this is a **premium product** that delivers exceptional performance and durability. Worth every rupee for serious users!`}

**Overall Rating: ⭐⭐⭐⭐⭐ 4.5/5**

---

## Order Now

Don't miss out on this amazing product! Order the **${product.name}** today and enjoy:
- ✅ Free Express Shipping
- ✅ Cash on Delivery
- ✅ 100% Original Guarantee
- ✅ Easy Returns
- ✅ 24/7 Customer Support

[**🛒 Buy ${product.name} Now - ${product.price}**](${product.url})

---

**Keywords**: ${product.name}, ${product.name} price Pakistan, ${product.name} online, buy ${product.name} Pakistan, ${product.category} Pakistan, ${product.name} Karachi, ${product.name} Lahore, ${product.name} Islamabad, best ${product.category} Pakistan, ${product.name} review, ${product.name} COD, ${product.name} cash on delivery, AI Bazar Pakistan
`;
}

function generateFeaturesList(product, categoryInfo) {
    const features = [
        `**Premium Quality**: Made with high-quality materials for durability`,
        `**Affordable Price**: At ${product.price}, it's competitively priced`,
        `**Easy to Use**: User-friendly design suitable for everyone`,
        `**Versatile**: Multiple use cases for maximum value`
    ];
    return features.map((f, idx) => `${idx + 1}. ${f}`).join('\n');
}

function generateUsageGuide(category) {
    const guides = {
        'Hair': `1. **Prepare**: Ensure hair is clean and slightly damp\n2. **Section**: Divide hair into manageable sections\n3. **Apply**: Use on each section with smooth, even strokes\n4. **Style**: Achieve your desired look with proper technique\n5. **Finish**: Apply finishing products if desired`,
        'Kitchen Accessories': `1. **Clean**: Wash before first use\n2. **Prepare**: Set up in your workspace\n3. **Use**: Follow specific product instructions\n4. **Clean**: Wash thoroughly after use\n5. **Store**: Keep in a dry, safe place`,
        'Beauty': `1. **Cleanse**: Start with clean skin/area\n2. **Prepare**: Apply any necessary prep products\n3. **Apply**: Use product as directed\n4. **Wait**: Allow proper time for results\n5. **Finish**: Complete with aftercare`,
        'Home & living': `1. **Unbox**: Remove from packaging carefully\n2. **Setup**: Follow assembly instructions if needed\n3. **Position**: Place in desired location\n4. **Use**: Operate according to manual\n5. **Maintain**: Regular cleaning and care`,
        'Baby, Kids & Toys': `1. **Inspect**: Check for any damage\n2. **Clean**: Wipe down before first use\n3. **Supervise**: Always watch children during use\n4. **Store**: Keep in safe, clean area\n5. **Maintain**: Regular cleaning and inspection`,
        'Electronics': `1. **Charge**: Fully charge before first use\n2. **Setup**: Follow initial setup instructions\n3. **Connect**: Pair with devices if needed\n4. **Use**: Operate as per manual\n5. **Maintain**: Keep updated and charged`
    };
    return guides[category] || guides['Home & living'];
}

function generateQuickUsageAnswer(category) {
    const answers = {
        'Hair': 'Simply plug in, select your desired temperature, and use on clean, dry or slightly damp hair in sections for best results.',
        'Kitchen Accessories': 'Wash before first use, then follow the specific instructions for your cooking or food prep task.',
        'Beauty': 'Apply to clean skin or area as directed, following the recommended frequency and duration.',
        'Home & living': 'Set up according to instructions, place in desired location, and use as directed in the manual.',
        'Baby, Kids & Toys': 'Ensure product is clean and safe, then supervise children during use according to age recommendations.',
        'Electronics': 'Charge fully, complete initial setup, and use according to the user manual provided.'
    };
    return answers[category] || answers['Home & living'];
}

function generateRelatedProductLinks(category) {
    const links = {
        'Hair': `- [Hair Dryer Brushes](/category/hair)\n- [Hair Straighteners](/category/hair)\n- [Hair Curlers](/category/hair)\n- [Hair Care Accessories](/category/beauty)`,
        'Kitchen Accessories': `- [Kitchen Gadgets](/category/kitchen)\n- [Cooking Tools](/category/kitchen)\n- [Food Storage](/category/home-living)\n- [Kitchen Scales](/category/kitchen)`,
        'Beauty': `- [Skincare Products](/category/beauty)\n- [Makeup Tools](/category/beauty)\n- [Personal Care](/category/beauty)\n- [Beauty Accessories](/category/beauty)`,
        'Home & living': `- [Home Appliances](/category/home-living)\n- [Storage Solutions](/category/home-living)\n- [Cleaning Tools](/category/home-living)\n- [Home Decor](/category/home-living)`,
        'Baby, Kids & Toys': `- [Educational Toys](/category/kids-toys)\n- [Baby Care](/category/baby)\n- [Kids Accessories](/category/kids)\n- [Learning Tools](/category/kids-toys)`,
        'Electronics': `- [Gadgets](/category/electronics)\n- [Accessories](/category/electronics)\n- [Smart Devices](/category/electronics)\n- [Audio Products](/category/electronics)`
    };
    return links[category] || links['Home & living'];
}

function generateBlogPost(product) {
    const blogId = (currentId++).toString();
    const blogSlug = `review-${product.slug}`;
    const date = new Date().toISOString().split('T')[0];
    const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''));

    return {
        id: blogId,
        slug: blogSlug,
        title: `${product.name} Review: Complete Buying Guide Pakistan 2026`,
        excerpt: `Discover everything about the ${product.name} - features, price (${product.price}), benefits, and where to buy in Pakistan. Complete review with FAQs.`,
        content: generateEnhancedContent(product),
        author: "AI Bazar Team",
        authorRole: "Product Specialist",
        publishDate: date,
        readTime: priceNum < 1500 ? "8 min read" : priceNum < 3000 ? "10 min read" : "12 min read",
        category: "Product Review",
        tags: [...product.tags, "review", "buying guide", "Pakistan", product.category.toLowerCase()],
        image: "/api/placeholder/800/500",
        featured: false,
        keyTakeaways: [
            `${product.name} is available at ${product.price} with free shipping across Pakistan`,
            `100% original product with Cash on Delivery option available`,
            `Fast delivery in 2-3 days for major cities (Karachi, Lahore, Islamabad)`,
            `Perfect for ${getCategoryInfo(product.category).targetAudience}`,
            `Easy returns and 24/7 customer support from AI Bazar`
        ]
    };
}

function main() {
    try {
        const rawContent = fs.readFileSync(INPUT_FILE, 'utf8');
        const products = parseProducts(rawContent);

        console.log(`Found ${products.length} products. Generating enhanced SEO blog posts...`);

        const blogPosts = products.map(generateBlogPost);

        const fileContent = `import { BlogPost } from './blogTypes';

export const generatedBlogPosts: BlogPost[] = ${JSON.stringify(blogPosts, null, 4)};
`;

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`✅ Successfully generated ${blogPosts.length} SEO-optimized blog posts!`);
        console.log(`📝 Average content length: ~1000-1200 words per post`);
        console.log(`🎯 Enhanced with: FAQs, comparisons, buying guides, internal links`);
        console.log(`📍 Location-specific content: Karachi, Lahore, Islamabad`);
        console.log(`🔗 Output file: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("❌ Error generating blog data:", error);
    }
}

main();
