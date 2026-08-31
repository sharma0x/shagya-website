import { describe, it, expect } from 'vitest'
import { isUnoptimizedImage } from '@/lib/image-url'

describe('isUnoptimizedImage', () => {
  it('returns false for empty values', () => {
    expect(isUnoptimizedImage(undefined)).toBe(false)
    expect(isUnoptimizedImage(null)).toBe(false)
    expect(isUnoptimizedImage('')).toBe(false)
  })

  it('marks production CDN/R2 media as unoptimized', () => {
    expect(
      isUnoptimizedImage(
        'https://pub-abc.r2.cloudflarestorage.com/shayga-media/saree-01.jpg',
      ),
    ).toBe(true)
    expect(isUnoptimizedImage('https://cdn.shayga.in/saree-01.jpg')).toBe(true)
  })

  it('marks local MinIO media as unoptimized', () => {
    expect(
      isUnoptimizedImage('http://localhost:9000/shayga-media/saree-01.jpg'),
    ).toBe(true)
    expect(
      isUnoptimizedImage('http://127.0.0.1:9000/shayga-media/saree-01.jpg'),
    ).toBe(true)
  })

  it('keeps relative media paths optimized', () => {
    expect(isUnoptimizedImage('/api/media/file/saree-01.jpg')).toBe(false)
  })
})
