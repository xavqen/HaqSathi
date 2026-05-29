import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/tools', '/complaint', '/upi-help', '/scheme-finder', '/documents', '/pricing', '/search']

test.describe('public mobile/desktop smoke', () => {
  for (const route of publicRoutes) {
    test(`${route} renders without horizontal overflow`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('body')).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(4)
    })
  }

  test('core CTA path opens complaint generator', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /complaint|start|generate/i }).first().click()
    await expect(page).toHaveURL(/complaint|login/)
  })
})
