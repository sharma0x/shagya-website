import { describe, it, expect } from 'vitest'
import { test, expect as playwrightExpect } from '@playwright/test'

test.describe('Smoke', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/')
    playwrightExpect(response?.status() ?? 0).toBeLessThan(400)
  })

  test('homepage renders brand', async ({ page }) => {
    await page.goto('/')
    await playwrightExpect(
      page.getByRole('link', { name: /shagya/i }).first(),
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
