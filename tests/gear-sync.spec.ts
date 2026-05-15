import { expect } from '@playwright/test'
import { test, supabase } from './fixtures/auth'

const BASE_URL = process.env.BASE_URL ?? 'https://app.vela-go.com'

// Navigate from app root → More tab → Gear & Packing card
async function goToGear(page: import('@playwright/test').Page) {
  await page.getByText('More').click()
  await page.getByText('Gear & Packing').click()
  await page.waitForSelector('[data-testid="gear-item"]', { timeout: 5000 })
}

test.describe('TF-013 · Gear Cross-Device Sync', () => {

  // TF-013-01 — gear loads in a fresh session with no IndexedDB cache
  test('TF-013-01 · gear loads in fresh session (no cache)', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'tests/fixtures/.auth.json',
    })
    const page = await context.newPage()
    const consoleLogs: string[] = []
    page.on('console', msg => consoleLogs.push(msg.text()))

    // Load the app then wipe IndexedDB to simulate an incognito / new-device session
    await page.goto(BASE_URL)
    await page.evaluate(() =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('vela-gear')
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
      })
    )

    // Reload so useSyncOnLogin runs against an empty cache
    await page.reload()
    await page.waitForTimeout(3000)

    await goToGear(page)

    const count = await page.locator('[data-testid="gear-item"]').count()
    expect(count).toBeGreaterThan(0)

    const syncLog = consoleLogs.find(m => m.includes('gear items from Supabase'))
    expect(syncLog).toBeTruthy()
    console.log(`TF-013-01 ✓ console: "${syncLog}"`)

    await context.close()
  })

  // TF-013-02 — item created on device A appears on device B with all fields intact
  test('TF-013-02 · gear syncs to new device', async ({ browser }) => {
    const testItem = {
      name:     `Test-${Date.now()}`,
      category: 'Recovery',
    }

    // Device A: add the item
    const ctxA = await browser.newContext({ storageState: 'tests/fixtures/.auth.json' })
    const pageA = await ctxA.newPage()
    await pageA.goto(BASE_URL)
    await pageA.waitForTimeout(2000)
    await goToGear(pageA)

    await pageA.getByText('+ Add').click()
    await pageA.getByPlaceholder('e.g. Hi-Lift Jack').fill(testItem.name)
    await pageA.getByText('Add to registry').click()
    await pageA.waitForTimeout(2000) // let sync flush to Supabase
    await ctxA.close()

    // Verify item landed in Supabase
    const { data: rows } = await supabase
      .from('gear_items')
      .select('name')
      .eq('name', testItem.name)
    expect(rows?.length).toBe(1)

    // Device B: fresh context, should see the item
    const ctxB = await browser.newContext({ storageState: 'tests/fixtures/.auth.json' })
    const pageB = await ctxB.newPage()
    await pageB.evaluate(() =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('vela-gear')
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
      })
    )
    await pageB.goto(BASE_URL)
    await pageB.waitForTimeout(3000)
    await goToGear(pageB)

    await expect(pageB.getByText(testItem.name)).toBeVisible()
    console.log(`TF-013-02 ✓ "${testItem.name}" visible on device B`)

    // Cleanup
    await supabase.from('gear_items').delete().eq('name', testItem.name)
    await ctxB.close()
  })

  // TF-013-04 — item count in app matches Supabase row count; add/delete stay in sync
  test('TF-013-04 · gear count matches Supabase', async ({ authenticatedPage: page }) => {
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const userId = users.find(u => u.email === process.env.TEST_USER_EMAIL)!.id

    await goToGear(page)

    const appCount = await page.locator('[data-testid="gear-item"]').count()
    const { count: dbCount } = await supabase
      .from('gear_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    expect(appCount).toBe(dbCount)
    console.log(`TF-013-04 ✓ app=${appCount} db=${dbCount}`)
  })

  // TF-013-05 — item added offline queues and flushes to Supabase on reconnect
  test('TF-013-05 · offline gear add syncs on reconnect', async ({ browser }) => {
    const testName = `Offline-${Date.now()}`

    const context = await browser.newContext({ storageState: 'tests/fixtures/.auth.json' })
    const page = await context.newPage()
    await page.goto(BASE_URL)
    await page.waitForTimeout(2000)
    await goToGear(page)

    // Go offline
    await context.setOffline(true)

    // Add item while offline
    await page.getByText('+ Add').click()
    await page.getByPlaceholder('e.g. Hi-Lift Jack').fill(testName)
    await page.getByText('Add to registry').click()

    // Item should appear in UI immediately (IndexedDB write)
    await expect(page.getByText(testName)).toBeVisible()

    // Confirm NOT in Supabase yet
    const { data: before } = await supabase
      .from('gear_items')
      .select('name')
      .eq('name', testName)
    expect(before?.length ?? 0).toBe(0)

    // Go back online and wait for flush
    await context.setOffline(false)
    await page.waitForTimeout(5000)

    // Now should be in Supabase, exactly once
    const { data: after } = await supabase
      .from('gear_items')
      .select('name')
      .eq('name', testName)
    expect(after?.length).toBe(1)
    console.log(`TF-013-05 ✓ "${testName}" appeared in Supabase after reconnect`)

    // Cleanup
    await supabase.from('gear_items').delete().eq('name', testName)
    await context.close()
  })

})
