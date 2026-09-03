import {defineField, defineType} from 'sanity'

/**
 * Covers the two video kinds the old storefront supported:
 *  - hosted MP4 (Shopify `Video` → sources[].url)
 *  - external / YouTube (Shopify `ExternalVideo` → embeddedUrl)
 */
export default defineType({
  name: 'productVideo',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {list: [{title: 'Hosted file (MP4)', value: 'file'}, {title: 'YouTube / external URL', value: 'external'}], layout: 'radio'},
      initialValue: 'external',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'file',
      title: 'Video file',
      type: 'file',
      options: {accept: 'video/*'},
      hidden: ({parent}) => parent?.kind !== 'file',
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      hidden: ({parent}) => parent?.kind !== 'external',
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {kind: 'kind', url: 'url'},
    prepare: ({kind, url}) => ({title: kind === 'file' ? 'Hosted video' : 'External video', subtitle: url}),
  },
})
