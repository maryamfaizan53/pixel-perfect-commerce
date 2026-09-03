import {defineField, defineType} from 'sanity'

/**
 * Import provenance. The HHC sync job writes/reads this to dedupe and to
 * decide which fields it is allowed to overwrite (so a manual edit in the
 * Studio is not clobbered on the next sync — see `lockedFields`).
 */
export default defineType({
  name: 'externalSource',
  title: 'External source',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'portal',
      title: 'Portal',
      type: 'string',
      options: {list: [{title: 'HHC Wholesaler', value: 'hhc'}, {title: 'Shopify (legacy)', value: 'shopify'}, {title: 'Manual', value: 'manual'}]},
      initialValue: 'manual',
    }),
    defineField({name: 'externalId', title: 'External ID', type: 'string'}),
    defineField({name: 'externalUrl', title: 'Source URL', type: 'url'}),
    defineField({name: 'costPrice', title: 'Wholesale / cost price (PKR)', type: 'number'}),
    defineField({name: 'importedAt', title: 'First imported', type: 'datetime', readOnly: true}),
    defineField({name: 'lastSyncedAt', title: 'Last synced', type: 'datetime', readOnly: true}),
    defineField({
      name: 'lockedFields',
      title: 'Locked fields',
      description: 'Field names the sync must not overwrite (e.g. "price", "title", "body").',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
  ],
})
