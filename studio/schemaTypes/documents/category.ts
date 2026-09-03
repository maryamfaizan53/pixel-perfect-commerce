import {defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons'

/**
 * Category — the "collection" equivalent. Products reference categories
 * (many-to-many). `order` drives the homepage row / hero ordering that is
 * currently hard-coded in the frontend.
 */
export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL handle)',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Long description / buying guide',
      type: 'blockContent',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alt text', type: 'string'}],
    }),
    defineField({
      name: 'featured',
      title: 'Show on homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      description: 'Lower numbers appear first (homepage hero + rows).',
      type: 'number',
      initialValue: 100,
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({
      name: 'source',
      title: 'Import source',
      type: 'externalSource',
    }),
  ],
  orderings: [{title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'slug.current', media: 'image'},
  },
})
