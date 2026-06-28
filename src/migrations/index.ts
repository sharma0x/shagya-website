import * as migration_20260627_104423_initial from './20260627_104423_initial'
import * as migration_20260628_012231_add_email_logs from './20260628_012231_add_email_logs'
import * as migration_20260628_021500_add_newsletter_subscribers from './20260628_021500_add_newsletter_subscribers'

export const migrations = [
  {
    up: migration_20260627_104423_initial.up,
    down: migration_20260627_104423_initial.down,
    name: '20260627_104423_initial',
  },
  {
    up: migration_20260628_012231_add_email_logs.up,
    down: migration_20260628_012231_add_email_logs.down,
    name: '20260628_012231_add_email_logs',
  },
  {
    up: migration_20260628_021500_add_newsletter_subscribers.up,
    down: migration_20260628_021500_add_newsletter_subscribers.down,
    name: '20260628_021500_add_newsletter_subscribers',
  },
]
