import { describe, it, expect } from 'vitest'
import { weaveLabel, weaveIdOf } from '../weaves'

describe('weaveLabel', () => {
  it('returns the string as-is for legacy enum values', () => {
    expect(weaveLabel('banarasi')).toBe('banarasi')
  })

  it('returns the name for a populated relationship object', () => {
    expect(weaveLabel({ id: 1, name: 'Banarasi', slug: 'banarasi' })).toBe(
      'Banarasi',
    )
  })

  it('falls back to slug when name is missing', () => {
    expect(weaveLabel({ id: 1, slug: 'kanchipuram' })).toBe('kanchipuram')
  })

  it('returns an empty string for null/undefined/ids', () => {
    expect(weaveLabel(null)).toBe('')
    expect(weaveLabel(undefined)).toBe('')
    expect(weaveLabel(7)).toBe('')
  })

  it('never returns a non-string (guards against .toLowerCase crashes)', () => {
    const shapes: unknown[] = [
      'banarasi',
      { id: 1, name: 'Banarasi', slug: 'banarasi' },
      { id: 1, slug: 'banarasi' },
      null,
      undefined,
      7,
    ]
    for (const shape of shapes) {
      expect(typeof weaveLabel(shape)).toBe('string')
    }
  })
})

describe('weaveIdOf', () => {
  it('returns the id for a populated relationship object', () => {
    expect(weaveIdOf({ id: 42, name: 'Banarasi' })).toBe(42)
  })

  it('returns ids and strings as-is', () => {
    expect(weaveIdOf(42)).toBe(42)
    expect(weaveIdOf('42')).toBe('42')
  })

  it('returns null for empty values', () => {
    expect(weaveIdOf(null)).toBeNull()
    expect(weaveIdOf(undefined)).toBeNull()
    expect(weaveIdOf({})).toBeNull()
  })
})
