import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'productOption',
  title: 'Option',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: {name: 'name', values: 'values'},
    prepare: ({name, values}) => ({title: name, subtitle: (values || []).join(', ')}),
  },
})
