import * as migration_20260630_180128_initial from './20260630_180128_initial'
import * as migration_20260701_163431_initial_payload from './20260701_163431_initial_payload'
import * as migration_20260705_155739 from './20260705_155739'

export const migrations = [
  {
    up: migration_20260630_180128_initial.up,
    down: migration_20260630_180128_initial.down,
    name: '20260630_180128_initial',
  },
  {
    up: migration_20260701_163431_initial_payload.up,
    down: migration_20260701_163431_initial_payload.down,
    name: '20260701_163431_initial_payload',
  },
  {
    up: migration_20260705_155739.up,
    down: migration_20260705_155739.down,
    name: '20260705_155739',
  },
]
