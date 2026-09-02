import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'productVariant',
  title: 'Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'e.g. "Black / Large". Auto-derivable from selected options.',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'selectedOptions',
      title: 'Selected options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'Option'},
            {name: 'value', type: 'string', title: 'Value'},
          ],
          preview: {select: {title: 'name', subtitle: 'value'}},
        },
      ],
    }),
    defineField({name: 'sku', title: 'SKU', type: 'string'}),
    defineField({name: 'price', title: 'Price (PKR)', type: 'number', validation: (r) => r.min(0)}),
    defineField({name: 'compareAtPrice', title: 'Compare-at price (PKR)', type: 'number', validation: (r) => r.min(0)}),
    defineField({name: 'inStock', title: 'In stock', type: 'boolean', initialValue: true}),
    defineField({name: 'stockQuantity', title: 'Stock quantity', type: 'number', validation: (r) => r.min(0).integer()}),
    defineField({
      name: 'image',
      title: 'Variant image',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'title', price: 'price', stock: 'inStock'},
    prepare: ({title, price, stock}) => ({
      title,
      subtitle: `${stock === false ? '⛔ ' : ''}${price ? `PKR ${price}` : 'base price'}`,
    }),
  },
})
