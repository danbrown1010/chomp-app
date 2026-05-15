import * as dotenv from 'dotenv'
dotenv.config()

import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL)

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_EMAIL    = process.env.TEST_USER_EMAIL!
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!
const BASE_URL      = process.env.BASE_URL ?? 'https://app.vela-go.com'

async function globalSetup() {
  if (!SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env')
  if (!TEST_EMAIL)  throw new Error('TEST_USER_EMAIL is not set in .env')
  if (!TEST_PASSWORD) throw new Error('TEST_USER_PASSWORD is not set in .env')

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Create test user if they don't exist yet
  const { data: { users } } = await admin.auth.admin.listUsers()
  const existing = users.find(u => u.email === TEST_EMAIL)

  if (!existing) {
    const { error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    })
    if (error) throw new Error(`Failed to create test user: ${error.message}`)
    console.log('[setup] Created test user:', TEST_EMAIL)
  } else {
    console.log('[setup] Test user already exists:', TEST_EMAIL)
  }

  // Add test user to allowlist so checkAllowlist() passes
  const { error: allowlistError } = await admin
    .from('allowed_users')
    .upsert({ email: TEST_EMAIL }, { onConflict: 'email' })
  if (allowlistError) throw new Error(`Allowlist upsert failed: ${allowlistError.message}`)
  console.log('[setup] Test user added to allowlist')

  // Seed gear items for the test user so data-dependent tests have rows to assert against
  const { data: { users: allUsers } } = await admin.auth.admin.listUsers()
  const testUser = allUsers.find(u => u.email === TEST_EMAIL)!
  const { count: existingGear } = await admin
    .from('gear_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', testUser.id)

  if (!existingGear || existingGear === 0) {
    const seedItems = [
      { id: crypto.randomUUID(), user_id: testUser.id, name: 'MaxTrax MKII', category: 'Recovery', quantity: 2, condition: 'good', notes: 'rear door', vendor: 'MaxTrax', purchased_from: 'Amazon', purchase_link: '', on_rig: true, include_in_checklist: true, updated_at: new Date().toISOString() },
      { id: crypto.randomUUID(), user_id: testUser.id, name: 'Hi-Lift Jack 48"', category: 'Recovery', quantity: 1, condition: 'good', notes: '', vendor: 'Hi-Lift', purchased_from: 'REI', purchase_link: '', on_rig: true, include_in_checklist: true, updated_at: new Date().toISOString() },
      { id: crypto.randomUUID(), user_id: testUser.id, name: 'Garmin inReach Mini', category: 'Navigation', quantity: 1, condition: 'good', notes: '', vendor: 'Garmin', purchased_from: 'REI', purchase_link: '', on_rig: true, include_in_checklist: true, updated_at: new Date().toISOString() },
    ]
    const { error: seedError } = await admin.from('gear_items').insert(seedItems)
    if (seedError) throw new Error(`Gear seed failed: ${seedError.message}`)
    console.log(`[setup] Seeded ${seedItems.length} gear items for test user`)
  } else {
    console.log(`[setup] Test user already has ${existingGear} gear items — skipping seed`)
  }

  // Generate a magic link — supabase handles the full auth redirect,
  // no manual localStorage injection needed
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: TEST_EMAIL,
    options: { redirectTo: BASE_URL },
  })
  if (linkError || !linkData?.properties?.action_link) {
    throw new Error(`Magic link generation failed: ${linkError?.message}`)
  }
  console.log('[setup] Magic link generated')

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Visit the magic link — Supabase redirects to BASE_URL with session tokens
  // in the URL fragment, and supabase-js handles the rest
  await page.goto(linkData.properties.action_link)

  // Wait for the app to process the auth callback and show the main UI
  await page.waitForSelector('text=More', { timeout: 20000 })

  await context.storageState({ path: 'tests/fixtures/.auth.json' })
  await browser.close()

  console.log('[setup] Auth state saved → tests/fixtures/.auth.json')
}

export default globalSetup
