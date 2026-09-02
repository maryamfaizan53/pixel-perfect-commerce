import {defineCliConfig} from 'sanity/cli'

/**
 * Fill these in after `sanity init` (or set SANITY_STUDIO_PROJECT_ID / _DATASET env vars).
 */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  /* Studio is deployed at https://<name>.sanity.studio via `sanity deploy` */
  studioHost: 'aibazar',
  autoUpdates: true,
})
