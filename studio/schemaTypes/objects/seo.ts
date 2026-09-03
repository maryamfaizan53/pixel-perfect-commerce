import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (r) => r.max(70).warning('Longer than 70 chars will be truncated by Google'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(170).warning('Longer than 170 chars will be truncated'),
    }),
    defineField({name: 'ogImage', title: 'Social share image', type: 'image'}),
    defineField({name: 'noIndex', title: 'Hide from search engines', type: 'boolean', initialValue: false}),
  ],
})
