import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

/**
 * Product — the catalog unit. Modelled to cover everything the storefront
 * currently reads from Shopify (title/handle/description/media/price/
 * compareAtPrice/variants/options/tags/productType/vendor/availability)
 * plus import-provenance so the HHC sync can dedupe and update in place.
 */
export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'main', title: 'Content', default: true},
    {name: 'pricing', title: 'Pricing & Stock'},
    {name: 'variants', title: 'Options & Variants'},
    {name: 'media', title: 'Media'},
    {name: 'seo', title: 'SEO'},
    {name: 'source', title: 'Import Source'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'main',
      validation: (r) => r.required().min(3).max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL handle)',
      type: 'slug',
      group: 'main',
      options: {source: 'title', maxLength: 96, slugify: (input) =>
        input.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 96),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Short description',
      description: 'One or two sentences. Used on cards and meta descriptions.',
      type: 'text',
      rows: 3,
      group: 'main',
      validation: (r) => r.max(500),
    }),
    defineField({
      name: 'body',
      title: 'Full description',
      type: 'blockContent',
      group: 'main',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'main',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      validation: (r) => r.unique(),
    }),
    defineField({
      name: 'productType',
      title: 'Product type',
      description: 'Single free-text type (e.g. "Kitchen Accessories"). Used for SEO copy and related-product matching.',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'vendor',
      title: 'Vendor / brand',
      type: 'string',
      group: 'main',
      initialValue: 'AI Bazar',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      group: 'main',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      group: 'main',
    }),

    // ---- Pricing & stock -------------------------------------------------
    defineField({
      name: 'price',
      title: 'Price (PKR)',
      description: 'Base / lowest price. Per-variant prices override this on the variant.',
      type: 'number',
      group: 'pricing',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare-at price (PKR)',
      description: 'Original price for the strikethrough. Leave empty if not on sale.',
      type: 'number',
      group: 'pricing',
      validation: (r) =>
        r.min(0).custom((v, ctx) =>
          v && (ctx.document?.price as number) && v <= (ctx.document?.price as number)
            ? 'Compare-at price should be higher than the price'
            : true,
        ),
    }),
    defineField({
      name: 'inStock',
      title: 'In stock',
      type: 'boolean',
      initialValue: true,
      group: 'pricing',
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock quantity',
      description: 'Optional. Leave empty for dropshipped items tracked only by the in-stock flag.',
      type: 'number',
      group: 'pricing',
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'barcode',
      title: 'Barcode / GTIN',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'weightGrams',
      title: 'Weight (grams)',
      description: 'Used for shipping calculations.',
      type: 'number',
      group: 'pricing',
      validation: (r) => r.min(0),
    }),

    // ---- Options & variants -------------------------------------------
    defineField({
      name: 'options',
      title: 'Options',
      description: 'e.g. Colour → [Black, White]. Only needed for products with variants.',
      type: 'array',
      of: [{type: 'productOption'}],
      group: 'variants',
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      description: 'Leave empty for single-variant products (the base price/stock is used).',
      type: 'array',
      of: [{type: 'productVariant'}],
      group: 'variants',
    }),

    // ---- Media -------------------------------------------------------
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [{name: 'alt', title: 'Alt text', type: 'string'}],
        },
      ],
      validation: (r) => r.min(1).error('At least one image is required'),
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{type: 'productVideo'}],
      group: 'media',
    }),

    // ---- SEO -------------------------------------------------------
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),

    // ---- Import provenance ----------------------------------------
    defineField({
      name: 'source',
      title: 'Import source',
      type: 'externalSource',
      group: 'source',
      readOnly: ({currentUser}) => !currentUser?.roles?.some((role) => role.name === 'administrator'),
    }),
  ],

  orderings: [
    {title: 'Newest', name: 'newDesc', by: [{field: '_createdAt', direction: 'desc'}]},
    {title: 'Price, low → high', name: 'priceAsc', by: [{field: 'price', direction: 'asc'}]},
    {title: 'Title A→Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],

  preview: {
    select: {title: 'title', subtitle: 'price', media: 'images.0', stock: 'inStock'},
    prepare: ({title, subtitle, media, stock}) => ({
      title,
      subtitle: `${stock === false ? '⛔ ' : ''}PKR ${subtitle?.toLocaleString?.() ?? subtitle}`,
      media,
    }),
  },
})
