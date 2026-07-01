import * as migration_20260630_180128_initial from './20260630_180128_initial'

export const migrations = [
  {
    up: migration_20260630_180128_initial.up,
    down: migration_20260630_180128_initial.down,
    name: '20260630_180128_initial',
  },
]
