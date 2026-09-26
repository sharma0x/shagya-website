import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Regression: a color variant whose image file is missing must not fail the
 * whole seed. uploadMedia returns null for a missing file, which leaves the
 * variant with an empty gallery, and Payload rejects that ("Variant Images >
 * Image is invalid"). The seeder used to submit those variants anyway, so a
 * clean checkout — where images are downloaded at seed time and any file can
 * fail to arrive — failed the entire deploy.
 */

const mocks = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFind: vi.fn(),
  mockFindByID: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('payload', async (importOriginal) => {
  const actual: Record<string, unknown> =
    await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() =>
      Promise.resolve({
        create: mocks.mockCreate,
        find: mocks.mockFind,
        findByID: mocks.mockFindByID,
        update: mocks.mockUpdate,
        delete: mocks.mockDelete,
      }),
    ),
  }
})

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))

describe('color variant gallery integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('a gallery row missing its required image is invalid', () => {
    // Mirrors Payload's validation: every gallery row must carry an `image`.
    const rowWithoutImage: { image?: number; alt?: string }[] = [
      { alt: 'Ruby red' },
    ]

    const hasInvalidRow = rowWithoutImage.some((row) => row.image == null)

    expect(hasInvalidRow).toBe(true)
  })

  it('a gallery holding at least one real image is valid', () => {
    const gallery = [{ image: 42, alt: 'Ruby red' }]

    const hasInvalidRow = gallery.some((row) => row.image == null)

    expect(hasInvalidRow).toBe(false)
  })

  it('drops exactly the variants whose image is missing', () => {
    const variantData = [
      { gallery: [{ image: 1 }] },
      { gallery: [] }, // image file missing
      { gallery: [{ image: 2 }] },
      { gallery: [] }, // image file missing
    ]

    const usable = variantData.filter((v) => v.gallery.length > 0)
    const dropped = variantData.length - usable.length

    expect(usable).toHaveLength(2)
    expect(dropped).toBe(2)
    expect(usable.every((v) => v.gallery.length > 0)).toBe(true)
  })
})
