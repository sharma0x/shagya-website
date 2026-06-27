import { test, expect, Page } from '@playwright/test'

async function waitForHydration(page: Page) {
  try {
    await page.waitForSelector('body[data-hydrated="true"]', { timeout: 15000 })
  } catch (e) {
    // Fallback or log if it fails, but usually required
    console.warn('Hydration selector body[data-hydrated="true"] timed out.')
  }
}

test.describe('Customer Storefront Flows', () => {
  const testPassword = 'Password123!'
  const testName = 'E2E Customer'

  test('should load home page and verify layout elements', async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)

    // Verify brand link in Header
    await expect(
      page.getByRole('link', { name: /shayga/i }).first(),
    ).toBeVisible()

    // Header should contain category links
    await expect(
      page.getByRole('link', { name: /silk/i }).first(),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /cotton/i }).first(),
    ).toBeVisible()
  })

  test('should display cart drawer when clicking cart button', async ({
    page,
  }) => {
    await page.goto('/')
    await waitForHydration(page)

    // Click the cart button
    await page.getByRole('button', { name: /^cart$/i }).click()

    // Verify Cart Drawer is visible and empty
    await expect(
      page.getByRole('heading', { name: /shopping cart/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /your cart is empty/i }),
    ).toBeVisible()

    // Close cart drawer
    await page.getByRole('button', { name: /close cart/i }).click()
    await expect(
      page.getByRole('heading', { name: /shopping cart/i }),
    ).not.toBeVisible()
  })

  test('should allow user registration, automatic customer sync, and redirection', async ({
    page,
    context,
  }) => {
    await context.clearCookies()
    const regEmail = `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`

    await page.goto('/account/login')
    await waitForHydration(page)

    // Go to register page
    await page.getByRole('link', { name: /create an account/i }).click()
    await expect(page).toHaveURL(/\/account\/register/)
    await waitForHydration(page)

    // Fill register form
    await page.getByLabel(/full name/i).fill(testName)
    await page.getByLabel(/email address/i).fill(regEmail)
    await page
      .getByLabel(/password/i)
      .first()
      .fill(testPassword)
    await page.getByLabel(/confirm password/i).fill(testPassword)

    // Submit registration
    await page.getByRole('button', { name: /create account/i }).click()

    // Should redirect to dashboard /account
    await expect(page).toHaveURL(/\/account/)
    await expect(
      page.getByRole('heading', {
        name: new RegExp(`Namaste, ${testName}`, 'i'),
      }),
    ).toBeVisible()
  })

  test('should allow logging out and logging back in with registered credentials', async ({
    page,
    context,
  }) => {
    await context.clearCookies()
    const loginEmail = `login_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`

    // 1. Register first so the credentials exist
    await page.goto('/account/register')
    await waitForHydration(page)
    await page.getByLabel(/full name/i).fill(testName)
    await page.getByLabel(/email address/i).fill(loginEmail)
    await page
      .getByLabel(/password/i)
      .first()
      .fill(testPassword)
    await page.getByLabel(/confirm password/i).fill(testPassword)
    await page.getByRole('button', { name: /create account/i }).click()

    // Verify landed on dashboard
    await expect(page).toHaveURL(/\/account/)

    // 2. Click sign out
    await page.getByRole('button', { name: /sign out/i }).click()

    // Should be redirected back to login page
    await expect(page).toHaveURL(/\/account\/login/)
    await waitForHydration(page)

    // 3. Try logging back in
    await page.getByLabel(/email address/i).fill(loginEmail)
    await page.getByLabel(/password/i).fill(testPassword)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify landing on dashboard again
    await expect(page).toHaveURL(/\/account/)
    await expect(
      page.getByRole('heading', {
        name: new RegExp(`Namaste, ${testName}`, 'i'),
      }),
    ).toBeVisible()
  })

  test('should load dynamic pages (about, faq) or journal index successfully', async ({
    page,
  }) => {
    // Check Journal index
    const journalRes = await page.goto('/blog')
    expect(journalRes?.status()).toBeLessThan(400)
    await waitForHydration(page)
    await expect(
      page.getByRole('heading', { name: /weaving chronicles/i }),
    ).toBeVisible()
  })
})
