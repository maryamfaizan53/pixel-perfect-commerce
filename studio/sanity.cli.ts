import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'c9sl2l96',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  /* Studio is deployed at https://<name>.sanity.studio via `sanity deploy` */
  studioHost: 'aibazar',
  autoUpdates: true,
})
