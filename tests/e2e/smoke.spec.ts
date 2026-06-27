import { test, expect, Page } from '@playwright/test'

async function waitForHydration(page: Page) {
  try {
    await page.waitForSelector('body[data-hydrated="true"]', { timeout: 15000 })
  } catch (e) {
    console.warn('Hydration selector body[data-hydrated="true"] timed out.')
  }
}

test.describe('Smoke', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status() ?? 0).toBeLessThan(400)
  })

  test('homepage renders brand', async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)
    await expect(
      page.getByRole('link', { name: /shayga/i }).first(),
    ).toBeVisible()
  })

  test('admin route responds', async ({ page }) => {
    const response = await page.goto('/admin', {
      waitUntil: 'domcontentloaded',
    })
    // Admin panel may return 200 or redirect — both are acceptable
    expect(response?.status() ?? 0).toBeLessThan(500)
  })
})
