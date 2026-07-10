import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCached, setCache } from './pincode-cache'

describe('pincode-cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic get/set', () => {
    it('returns null on cache miss', () => {
      expect(getCached('missing')).toBeNull()
    })

    it('returns the cached value on hit', () => {
      setCache('key', { foo: 'bar' })
      expect(getCached('key')).toEqual({ foo: 'bar' })
    })

    it('preserves type via generic', () => {
      setCache<string>('greeting', 'hello')
      const result = getCached<string>('greeting')
      expect(result).toBe('hello')
    })

    it('keeps entries under different keys isolated', () => {
      setCache('a', 1)
      setCache('b', 2)
      expect(getCached('a')).toBe(1)
      expect(getCached('b')).toBe(2)
    })

    it('overwrites existing entry when set again', () => {
      setCache('key', 'first')
      setCache('key', 'second')
      expect(getCached('key')).toBe('second')
    })
  })

  describe('TTL expiry', () => {
    it('returns null after the TTL window elapses', () => {
      setCache('expiring', { value: 42 })
      vi.advanceTimersByTime(60_001)
      expect(getCached('expiring')).toBeNull()
    })

    it('still returns the value just before TTL elapses', () => {
      setCache('fresh', 'still-good')
      vi.advanceTimersByTime(59_999)
      expect(getCached('fresh')).toBe('still-good')
    })
  })

  describe('LRU eviction', () => {
    it('evicts the oldest entry once the cache reaches its max size', () => {
      const MAX = 1000
      // Fill the cache
      for (let i = 0; i < MAX; i++) {
        setCache(`key-${i}`, i)
      }
      // Insert one more — should evict the oldest (key-0)
      setCache('overflow', 'new')

      expect(getCached('key-0')).toBeNull()
      expect(getCached('overflow')).toBe('new')
      expect(getCached(`key-${MAX - 1}`)).toBe(MAX - 1)
    })

    it('keeps recently-touched keys alive (insertion order reflects LRU)', () => {
      const MAX = 1000
      for (let i = 0; i < MAX; i++) {
        setCache(`key-${i}`, i)
      }
      // Touch key-0 by re-setting it (moves to end of insertion order)
      setCache('key-0', 'refreshed')
      // Now overflow — key-1 should be evicted, not key-0
      setCache('overflow', 'new')

      expect(getCached('key-0')).toBe('refreshed')
      expect(getCached('key-1')).toBeNull()
    })
  })
})
