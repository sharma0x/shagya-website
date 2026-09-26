import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The cart drawer's item links navigate to a product but used to leave the
 * drawer mounted and open over the new page, so the user got no confirmation
 * that navigation happened. Every link that leaves the drawer must therefore
 * close it.
 *
 * These assert the source invariant rather than mounting the component: the
 * drawer depends on the cart store, Payload-backed product data, and GA4, so
 * a render test here would be mostly mocks.
 */
const CART_DRAWER = join(process.cwd(), 'src/components/cart/CartDrawer.tsx')

const source = readFileSync(CART_DRAWER, 'utf8')

/** Every `<Link ...>` opening tag in the file, in source order. */
function linkOpenings(src: string): string[] {
  return src.match(/<Link\b[\s\S]*?>/g) ?? []
}

describe('CartDrawer link handlers', () => {
  const links = linkOpenings(source)

  it('has links to assert against', () => {
    expect(links.length).toBeGreaterThan(0)
  })

  it('every link closes the drawer on click', () => {
    const missing = links.filter((tag) => !tag.includes('onClick={onClose}'))
    expect(
      missing,
      `These <Link>s navigate away but never close the drawer:\n${missing.join('\n')}`,
    ).toHaveLength(0)
  })

  it('item image link closes the drawer', () => {
    const imageLink = links.find((tag) => tag.includes('aspect-[3/4]'))
    expect(imageLink).toBeDefined()
    expect(imageLink).toContain('onClick={onClose}')
  })

  it('product title link closes the drawer', () => {
    // The title link is a single-line opening tag: `<Link href={productUrl} …>`
    const titleLink = links.find((tag) => /href=\{productUrl\}/.test(tag))
    expect(titleLink).toBeDefined()
    expect(titleLink).toContain('onClick={onClose}')
  })

  it('checkout link closes the drawer', () => {
    const checkout = links.find((tag) => tag.includes('href="/checkout"'))
    expect(checkout).toBeDefined()
    expect(checkout).toContain('onClick={onClose}')
  })
})

describe('CartDrawer dismissal affordances', () => {
  it('closes via the overlay, the X button, and continue-shopping', () => {
    // Three independent ways out, so a user is never trapped with the drawer
    // covering the page.
    expect(source).toMatch(/onClick=\{onClose\}/)
    expect(source).toContain('aria-label="Close cart"')
    expect(source).toContain('Continue shopping')
  })
})
