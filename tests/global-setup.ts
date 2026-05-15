import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANON_KEY      = process.env.VITE_SUPABASE_ANON_KEY!
const TEST_EMAIL    = process.env.TEST_USER_EMAIL!
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!
const BASE_URL      = process.env.BASE_URL ?? 'https://app.vela-go.com'

// supabase-js v2 localStorage key format
const STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`

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

  // Sign in with email/password using the anon client
  const anon = createClient(SUPABASE_URL, ANON_KEY)
  const { data, error } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
  if (error || !data.session) throw new Error(`Sign-in failed: ${error?.message}`)

  // Inject session into browser localStorage and save storageState
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(BASE_URL)

  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
  }, {
    key: STORAGE_KEY,
    session: {
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at:    data.session.expires_at,
      token_type:    'bearer',
      user:          data.user,
    },
  })

  await context.storageState({ path: 'tests/fixtures/.auth.json' })
  await browser.close()

  console.log('[setup] Auth state saved → tests/fixtures/.auth.json')
}

export default globalSetup
