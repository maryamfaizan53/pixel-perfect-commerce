import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'c9sl2l96',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  /* Studio is deployed at https://aibazar.sanity.studio via `sanity deploy` */
  studioHost: 'aibazar',
  /* Pin the deployed Studio to the version we build & test here (Sanity v4),
     rather than auto-updating the runtime to a newer major (v6) that the code
     hasn't been validated against. Flip to true after a deliberate upgrade. */
  deployment: {autoUpdates: false},
})
