import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Footer } from './Footer'

const { mockFind, mockFindGlobal } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockFindGlobal: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: mockFind,
    findGlobal: mockFindGlobal,
  })),
}))

async function renderFooter() {
  render(await Footer())
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFind.mockResolvedValue({
    docs: [
      { id: 1, name: 'Silk', slug: 'silk' },
      { id: 2, name: 'Cotton', slug: 'cotton' },
      { id: 3, name: 'Chanderi', slug: 'khadi-cotton' },
      { id: 4, name: 'Missing slug', slug: null },
    ],
  })
  mockFindGlobal.mockResolvedValue({
    id: 1,
    instagramUrl: 'https://instagram.com/shayga.official',
    facebookUrl: 'https://facebook.com/shayga',
    youtubeUrl: 'https://youtube.com/@shayga',
    whatsappUrl: 'https://wa.me/91906566511',
  })
})

describe('Footer', () => {
  it('renders the brand name', async () => {
    await renderFooter()
    expect(screen.getAllByText('Shayga').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a copyright line with the current year', async () => {
    await renderFooter()
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`©.*${year}`))).toBeInTheDocument()
  })

  it('renders social links from site settings', async () => {
    await renderFooter()
    expect(
      screen.getByRole('link', { name: /instagram/i }).getAttribute('href'),
    ).toBe('https://instagram.com/shayga.official')
    expect(
      screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href'),
    ).toBe('https://wa.me/91906566511')
    expect(screen.getByRole('link', { name: /youtube/i })).toBeInTheDocument()
  })

  it('does not render a Pinterest link', async () => {
    await renderFooter()
    expect(
      screen.queryByRole('link', { name: /pinterest/i }),
    ).not.toBeInTheDocument()
  })

  it('falls back to the default WhatsApp number when not set', async () => {
    mockFindGlobal.mockResolvedValue({
      id: 1,
      instagramUrl: 'https://instagram.com/shayga',
      facebookUrl: 'https://facebook.com/shayga',
    })
    await renderFooter()
    expect(
      screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href'),
    ).toBe('https://wa.me/91906566511')
  })

  it('renders fabric links from Payload with openable category URLs', async () => {
    await renderFooter()

    expect(
      screen.getByRole('link', { name: 'Silk Sarees' }).getAttribute('href'),
    ).toBe('/category/all?fabric=silk')
    expect(
      screen
        .getByRole('link', { name: 'Chanderi Sarees' })
        .getAttribute('href'),
    ).toBe('/category/all?fabric=khadi-cotton')
    expect(
      screen.queryByRole('link', { name: 'Missing slug Sarees' }),
    ).not.toBeInTheDocument()
    expect(mockFind).toHaveBeenCalledWith({
      collection: 'fabric-types',
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'name',
    })
  })

  it('keeps All Sarees last in the Shop column', async () => {
    await renderFooter()
    const shop = screen.getByRole('heading', { name: 'Shop' }).parentElement
    const links = within(shop as HTMLElement).getAllByRole('link')

    expect(links.at(-1)?.textContent).toBe('All Sarees')
    expect(links.at(-1)?.getAttribute('href')).toBe('/category/all')
  })

  it('does not render hardcoded weave links that are not fabric types', async () => {
    await renderFooter()
    expect(
      screen.queryByRole('link', { name: 'Banarasi Sarees' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Kanchipuram Sarees' }),
    ).not.toBeInTheDocument()
  })

  it('keeps All Sarees when no fabric types are returned', async () => {
    mockFind.mockResolvedValue({ docs: [] })
    await renderFooter()

    expect(
      screen.getByRole('link', { name: 'All Sarees' }).getAttribute('href'),
    ).toBe('/category/all')
  })
})
