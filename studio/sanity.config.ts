import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'aibazar',
  title: 'AI Bazar',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    // Singletons must not be creatable/deletable from the "create new" menu.
    templates: (prev) => prev.filter((t) => !['siteSettings'].includes(t.id)),
  },
  document: {
    actions: (prev, {schemaType}) =>
      schemaType === 'siteSettings'
        ? prev.filter(({action}) => action !== 'unpublish' && action !== 'delete' && action !== 'duplicate')
        : prev,
  },
})
