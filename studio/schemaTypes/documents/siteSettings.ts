import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons'

/**
 * Singleton — storefront-wide config that is currently scattered as magic
 * numbers/strings in the React code (delivery charge, free-shipping
 * threshold, announcement bar text, WhatsApp number, homepage category order).
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'commerce', title: 'Commerce'},
    {name: 'announcement', title: 'Announcement Bar'},
    {name: 'homepage', title: 'Homepage'},
  ],
  fields: [
    defineField({name: 'storeName', title: 'Store name', type: 'string', group: 'general', initialValue: 'AI Bazar'}),
    defineField({name: 'currency', title: 'Currency code', type: 'string', group: 'commerce', initialValue: 'PKR', readOnly: true}),
    defineField({name: 'whatsappNumber', title: 'WhatsApp number (E.164)', type: 'string', group: 'general', initialValue: '+923328222026'}),
    defineField({name: 'supportEmail', title: 'Support email', type: 'string', group: 'general'}),

    defineField({name: 'deliveryCharge', title: 'Delivery charge (PKR)', type: 'number', group: 'commerce', initialValue: 200}),
    defineField({name: 'freeShippingThreshold', title: 'Free shipping over (PKR)', type: 'number', group: 'commerce', initialValue: 5000}),
    defineField({name: 'codEnabled', title: 'Cash on Delivery enabled', type: 'boolean', group: 'commerce', initialValue: true}),
    defineField({name: 'onlinePaymentEnabled', title: 'Online payment enabled', type: 'boolean', group: 'commerce', initialValue: false}),

    defineField({
      name: 'announcements',
      title: 'Announcement messages',
      type: 'array',
      of: [{type: 'string'}],
      group: 'announcement',
    }),

    defineField({
      name: 'featuredCategories',
      title: 'Homepage category order',
      description: 'Categories shown in the hero grid + product rows, in this order.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      group: 'homepage',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'object',
      group: 'general',
      fields: [
        {name: 'facebook', type: 'url'},
        {name: 'instagram', type: 'url'},
        {name: 'tiktok', type: 'url'},
        {name: 'youtube', type: 'url'},
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Site Settings'})},
})
