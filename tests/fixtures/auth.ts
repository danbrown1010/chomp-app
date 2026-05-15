import { test as base } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Admin client for DB-level assertions in tests (count rows, verify upserts, etc.)
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// authenticatedPage: browser context pre-loaded with the test user session
// saved by global-setup.ts — no OAuth popup required
export const test = base.extend<{ authenticatedPage: import('@playwright/test').Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'tests/fixtures/.auth.json',
    })
    const page = await context.newPage()
    await page.goto(process.env.BASE_URL ?? 'https://app.vela-go.com')
    // Allow useSyncOnLogin to fire and populate IndexedDB
    await page.waitForTimeout(6000)
    await use(page)
    await context.close()
  },
})
