import * as migration_20260626_211229_initial from './20260626_211229_initial'
import * as migration_20260627_000000_collections_image_upload from './20260627_000000_collections_image_upload'
import * as migration_20260627_200000_email_templates from './20260627_200000_email_templates'

export const migrations = [
  {
    up: migration_20260626_211229_initial.up,
    down: migration_20260626_211229_initial.down,
    name: '20260626_211229_initial',
  },
  {
    up: migration_20260627_000000_collections_image_upload.up,
    down: migration_20260627_000000_collections_image_upload.down,
    name: '20260627_000000_collections_image_upload',
  },
  {
    up: migration_20260627_200000_email_templates.up,
    down: migration_20260627_200000_email_templates.down,
    name: '20260627_200000_email_templates',
  },
]
