import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, '../../public/llms-products.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/generatedBlogData.ts');

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

        // Extract Name and URL
        const titleMatch = entry.match(/(.*?)]\((.*?)\)/);
        if (!titleMatch) return;

        const name = titleMatch[1].trim();
        const url = titleMatch[2].trim();
        const slug = url.split('/').pop();

        // Extract Metadata
        const priceMatch = entry.match(/- \*\*Price\*\*: (.*)/);
        const categoryMatch = entry.match(/- \*\*Category\*\*: (.*)/);
        const descMatch = entry.match(/- \*\*Description\*\*: (.*)/);

        // Extract Tags (handle multiline or end of string)
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

function generateBlogPost(product) {
    const blogId = (currentId++).toString();
    const blogSlug = `review-${product.slug}`;
    const date = new Date().toISOString().split('T')[0];

    const content = `
# Why ${product.name} is a Must-Have in 2026

If you're looking for the best **${product.category}** solutions, the **${product.name}** stands out as a top contender. In this spotlight review, we explore why this product is trending in Pakistan.

## Product Overview

${product.description}

## Key Features

- **Price**: ${product.price}
- **Category**: ${product.category}
- **Availability**: In Stock at AI Bazar

## Why We Recommend It

1.  **Value for Money**: At ${product.price}, it offers exceptional utility.
2.  **Quality Assurance**: 100% Original Guaranteed.
3.  **Convenience**: Delivered to your doorstep with Cash on Delivery.

## Frequently Asked Questions

### What is the price of ${product.name}?
The current price is **${product.price}**.

### Is this product original?
Yes, AI Bazar guarantees 100% authenticity for the ${product.name}.

### How can I buy it?
You can order it directly: [Buy ${product.name} Here](${product.url})
`;

    return {
        id: blogId,
        slug: blogSlug,
        title: `Review: Why ${product.name} is a Must-Have (2026)`,
        excerpt: `Discover why the ${product.name} is trending in Pakistan. Full review of features, price, and quality.`,
        content: content,
        author: "AI Bazar Team",
        authorRole: "Product Specialist",
        publishDate: date,
        readTime: "3 min read",
        category: "Product Review",
        tags: [...product.tags, "review", "spotlight"],
        image: "/api/placeholder/800/500", // Placeholder for now
        featured: false,
        keyTakeaways: [
            `${product.name} is a top pick for ${product.category}.`,
            `Best price available: ${product.price}.`,
            "100% Original with Cash on Delivery."
        ]
    };
}

function main() {
    try {
        const rawContent = fs.readFileSync(INPUT_FILE, 'utf8');
        const products = parseProducts(rawContent);

        console.log(`Found ${products.length} products. Generating blog posts...`);

        const blogPosts = products.map(generateBlogPost);

        const fileContent = `
import { BlogPost } from './blogData';

export const generatedBlogPosts: BlogPost[] = ${JSON.stringify(blogPosts, null, 4)};
`;

        fs.writeFileSync(OUTPUT_FILE, fileContent);
        console.log(`Successfully generated ${blogPosts.length} blog posts in ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("Error generating blog data:", error);
    }
}

main();
