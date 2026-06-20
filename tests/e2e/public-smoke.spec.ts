import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/tools', '/tools/scam-radar', '/tools/smart-complaint-wizard', '/complaint', '/upi-help', '/scheme-finder', '/documents', '/pricing', '/search', '/status', '/privacy', '/terms', '/disclaimer', '/language-hub/hindi']

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

  test('UPI fraud page shows official emergency channels', async ({ page }) => {
    await page.goto('/upi-help')
    await expect(page.getByText('1930').first()).toBeVisible()
    await expect(page.getByText(/cybercrime\.gov\.in/i).first()).toBeVisible()
  })

  test('language hub does not expose AI system prompt copy', async ({ page }) => {
    await page.goto('/language-hub/hindi')
    await expect(page.locator('body')).not.toContainText('Respond primarily')
    await expect(page.locator('body')).not.toContainText('Use simple words')
  })


  test('Pricing page does not leak dev billing copy', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.locator('body')).not.toContainText('In local development, empty Razorpay keys')
    await expect(page.locator('body')).not.toContainText('Document vault placeholder')
  })

  test('homepage does not SSR 0+ Tools', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).not.toContainText(/0\+\s*Tools/i)
  })

  test('fraud escalation is visible on UPI, Scam Radar and Smart Wizard pages', async ({ page }) => {
    for (const route of ['/upi-help', '/tools/scam-radar', '/tools/smart-complaint-wizard']) {
      await page.goto(route)
      await expect(page.getByText('1930').first()).toBeVisible()
      await expect(page.getByText(/cybercrime\.gov\.in/i).first()).toBeVisible()
    }
  })

  test('status page uses user-facing operational copy', async ({ page }) => {
    await page.goto('/status')
    await expect(page.getByText(/AI Assistant: Operational/i).first()).toBeVisible()
    await expect(page.getByText(/Database: Operational/i).first()).toBeVisible()
  })

  test('SEO title suffix appears once on critical routes', async ({ page }) => {
    for (const route of ['/tools', '/tools/scam-radar', '/search', '/language-hub/hindi']) {
      await page.goto(route)
      const title = await page.title()
      const count = (title.match(/HaqSathi AI/g) || []).length
      expect(count).toBe(1)
    }
  })
})
