# VELA Test Flows

Manual regression test cases for app.vela-go.com.

---

## TF-013 · Gear Cross-Device Sync

Tests that gear registry data syncs correctly between sessions via Supabase,
with no dependency on local IndexedDB cache.

---

### TF-013-01 · Gear loads in fresh session (incognito)

**Purpose:** Verify that a user signing in on a device with no local IndexedDB
cache (incognito window, new device) receives their full gear list from Supabase
within a few seconds of login.

**Prerequisites:**
- Google account with at least one gear item saved in VELA
- Access to a normal browser session and an incognito/private window

**Steps:**

1. Open a normal browser session and go to `https://app.vela-go.com`
2. Sign in with your Google account
3. Navigate to **More → Gear & Packing**
4. Note the total item count shown in the stats bar
5. Note which categories are present
6. Open a new **incognito / private** browser window
7. Go to `https://app.vela-go.com`
8. Sign in with the same Google account
9. Navigate to **More → Gear & Packing**
10. Open browser DevTools → Console
11. Wait up to 3 seconds for gear to appear

**Expected results:**

- [ ] Gear items appear within 3 seconds of navigating to Gear & Packing
- [ ] Total item count matches the normal session exactly
- [ ] All categories present in the normal session are present in incognito
- [ ] Individual items within each category match between sessions
- [ ] Console contains `Loaded X gear items from Supabase` where X matches the item count
- [ ] No console errors related to gear loading or IndexedDB

**Expected:** Full gear list loads from Supabase in fresh session with no cache

**Root cause fixed:** `useSyncOnLogin` now pulls gear DOWN from Supabase after pushing local gear UP

**Automated:** Playwright incognito context

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-013-02 · Gear syncs to new device

**Purpose:** Verify that a gear item created on one device or session appears
in full on a second device or fresh session, with all fields intact.

**Prerequisites:**
- Google account with an existing gear list
- Two devices or one device + one incognito window (device A and device B)

**Steps:**

1. On **device A**, open `https://app.vela-go.com` and sign in
2. Navigate to **More → Gear & Packing**
3. Tap **+ Add** and create a new item with all fields populated:
   - Name, category, quantity, condition, vendor, purchased from, notes
4. Save the item and confirm it appears in the gear list on device A
5. Open browser DevTools → Network and verify a Supabase `gear_items` upsert
   request completed with status 200
6. On **device B** (or a new incognito window), go to `https://app.vela-go.com`
7. Sign in with the same Google account
8. Navigate to **More → Gear & Packing**
9. Wait up to 3 seconds for gear to load
10. Locate the item created in step 3

**Expected results:**

- [ ] New item appears in device B's gear list within 3 seconds
- [ ] Item name matches exactly
- [ ] Category matches exactly
- [ ] Quantity matches exactly
- [ ] Condition (good / worn / replace) matches exactly
- [ ] Vendor field matches exactly
- [ ] Purchased from field matches exactly
- [ ] Notes field matches exactly
- [ ] Console on device B shows `Loaded X gear items from Supabase`

**Expected:** All item fields round-trip through Supabase with no data loss

**Root cause fixed:** `gearRow()` in `syncManager.js` maps all fields to
snake_case columns; pull-down in `useSyncOnLogin` maps them back to camelCase

**Automated:** Playwright dual context

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-013-03 · Gear loads after cache clear

**Purpose:** Verify that clearing all browser storage (IndexedDB, localStorage,
service worker cache) and signing back in fully restores the gear list from
Supabase with no manual intervention.

**Prerequisites:**
- Google account with at least one gear item saved in VELA
- Chrome or Edge with DevTools access

**Steps:**

1. Open `https://app.vela-go.com` and sign in
2. Navigate to **More → Gear & Packing**
3. Note the total item count shown in the stats bar
4. Open **DevTools → Application → Storage**
5. Click **Clear site data** (ensure IndexedDB, localStorage, cache storage,
   and service workers are all checked)
6. Refresh the page
7. Sign in again with the same Google account
8. Navigate to **More → Gear & Packing**
9. Wait up to 3 seconds for gear to load
10. Open DevTools → Console

**Expected results:**

- [ ] Gear list reloads without any manual action after sign-in
- [ ] Total item count matches the count noted in step 3
- [ ] Console shows `Loaded X gear items from Supabase` where X matches
- [ ] No "No gear added yet" empty state is shown
- [ ] No console errors related to IndexedDB or sync

**Expected:** Gear restores fully from Supabase after complete cache wipe

**Root cause fixed:** `useSyncOnLogin` pulls from Supabase on every login,
not just when local IndexedDB is populated

**Expected:** Gear always recoverable from Supabase after cache clear

**Automated:** Playwright with `storage.clearCookies()` + `clearOrigin()`

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-013-04 · Gear count matches Supabase

**Purpose:** Verify that the item count shown in the app always reflects the
true row count in Supabase — adds and deletes propagate immediately.

**Prerequisites:**
- Google account with existing gear items
- Access to Supabase dashboard (supabase.com → project → Table Editor)

**Steps:**

1. Open `https://app.vela-go.com` and sign in
2. Navigate to **More → Gear & Packing**
3. Note the total item count shown in the stats bar (e.g. "42 items")
4. Open **Supabase Table Editor → gear_items**
5. Add a filter: `user_id = <your user UUID>`
6. Note the row count returned
7. Verify app count and Supabase row count match
8. Back in the app, tap **+ Add** and save a new gear item
9. Refresh the Supabase Table Editor view
10. Note the new Supabase row count
11. Back in the app, delete the item added in step 8
12. Refresh the Supabase Table Editor view
13. Note the final Supabase row count

**Expected results:**

- [ ] Initial app count equals initial Supabase row count
- [ ] After adding an item, Supabase row count increments by 1
- [ ] After deleting the item, Supabase row count decrements by 1
- [ ] Final Supabase row count equals the original count from step 6
- [ ] No orphaned rows remain in Supabase after deletion

**Expected:** App count and Supabase row count stay in lock-step through
add and delete operations

**Root cause fixed:** `syncGearToSupabase` upserts on save;
`deleteGearFromSupabase` hard-deletes by id with no soft-delete ambiguity

**Expected:** App and DB always in sync

**Automated:** Playwright + Supabase API

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-013-05 · Offline gear add syncs on reconnect

**Purpose:** Verify that a gear item added while offline is saved to IndexedDB
immediately, queued as a pending save, and flushed to Supabase automatically
when the network connection is restored.

**Prerequisites:**
- Google account with existing gear items
- Chrome DevTools access
- Supabase Table Editor open in a separate tab

**Steps:**

1. Open `https://app.vela-go.com` and sign in
2. Navigate to **More → Gear & Packing** and confirm gear loads
3. Open **DevTools → Network** and set throttle to **Offline**
4. Tap **+ Add** and save a new gear item with a distinctive name
5. Confirm the item appears immediately in the app's gear list
6. Switch to the Supabase Table Editor tab → **gear_items** filtered by your user_id
7. Confirm the new item is **not yet present** in Supabase
8. Back in DevTools, set the network throttle back to **No throttle** (online)
9. Wait 5 seconds
10. Refresh the Supabase Table Editor view
11. Check the app gear list for duplicate items

**Expected results:**

- [ ] Item appears in the app UI immediately while offline (IndexedDB write)
- [ ] Item is absent from Supabase while network is offline
- [ ] Item appears in Supabase within 5 seconds of going back online
- [ ] Item appears exactly once in Supabase (no duplicate rows)
- [ ] Item appears exactly once in the app gear list (no duplicate UI entries)
- [ ] All fields saved correctly (name, category, condition, etc.)

**Expected:** Offline-first write to IndexedDB flushes to Supabase on reconnect
with no duplicates due to upsert-on-conflict-id behaviour

**Root cause fixed:** `bulkSyncGearToSupabase` uses `onConflict: 'id'` upsert;
pending saves are cleared after a successful flush in `useSyncOnLogin`

**Expected:** Pending op queue flushes on reconnect, no duplicates

**Automated:** Playwright network throttle + Supabase assertion

**Pass / Fail:** ___

**Notes / observations:**

---

---

## TF-014 · Travel Documents

### TF-014-01 · Add text note
1. More → Travel Documents → + Add
2. Select "Text note"
3. Title: "Gate code — FR 500"
4. Category: Note
5. Content: "Gate code: 1234*"
6. Toggle Markdown ON
7. Add tags: "methow, 2026"
8. Tap Save
9. Verify doc appears in list
10. Verify lock icon visible
11. Tap doc → verify content renders
12. Tap RAW → verify raw text shows
13. Verify tags appear as pills

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-014-02 · Add reservation
1. + Add → Reservation
2. Title: "Harts Pass — Night 2"
3. Confirmation: "NRRS-12345678"
4. Date: select a future date
5. Location: "Harts Pass, Site 7"
6. Notes: "No hookups, pit toilet"
7. Save
8. Verify reservation card shows confirmation number prominently
9. Verify date and location show

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-014-03 · Add PDF
1. + Add → PDF document
2. Upload a small PDF
3. Title auto-fills from filename
4. Save
5. Verify PDF preview loads in iframe
6. Verify "Open in new tab" link works
7. Verify file size shows in list

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-014-04 · Search
1. Add 3 documents with different content
2. Type in search bar
3. Verify only matching docs show
4. Search content inside a text note
5. Verify it matches text content
6. Clear search → all docs return

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-014-05 · Type filters
1. Add one of each type
2. Tap PDF filter → only PDFs show
3. Tap Image → only images show
4. Tap Reservation → only reservations
5. Tap All → everything returns

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-014-06 · Delete document
1. Tap a document
2. Tap Delete
3. Confirm dialog appears
4. Confirm deletion
5. Verify removed from list
6. Verify file removed from Supabase Storage bucket

**Pass / Fail:** ___

**Notes / observations:**

---

### TF-014-07 · Security — private bucket
1. Open Supabase Storage → travel-docs
2. Find an uploaded file
3. Copy the storage path
4. Try to access it directly via URL
5. Verify access is denied (403)
6. Only signed URLs work

**Pass / Fail:** ___

**Notes / observations:**

---

## Regression Checklist

Run before each production deploy:

- [ ] Gear loads in incognito session
- [ ] Gear count matches Supabase DB
- [ ] New gear item syncs within 5 seconds
