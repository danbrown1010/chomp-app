import { openDB } from 'idb'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { syncGearToSupabase, deleteGearFromSupabase } from './syncManager'

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

const PENDING_SAVES_KEY = 'vela-pending-saves'

export function getPendingSaves() {
  const raw = localStorage.getItem(PENDING_SAVES_KEY)
  return raw ? JSON.parse(raw) : {}
}

function addPendingSave(item) {
  const pending = getPendingSaves()
  pending[item.id] = item
  localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(pending))
}

export function removePendingSave(id) {
  const pending = getPendingSaves()
  delete pending[id]
  localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(pending))
}

export function clearPendingSaves() {
  localStorage.removeItem(PENDING_SAVES_KEY)
}

const PENDING_DELETES_KEY = 'vela-pending-deletes'

export function getPendingDeletes() {
  const raw = localStorage.getItem(PENDING_DELETES_KEY)
  return raw ? JSON.parse(raw) : []
}

function addPendingDelete(id) {
  const pending = getPendingDeletes()
  if (!pending.includes(id)) {
    pending.push(id)
    localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(pending))
  }
}

export function removePendingDelete(id) {
  const pending = getPendingDeletes().filter(p => p !== id)
  localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(pending))
}

const DB_NAME = 'vela-gear'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('gear')) {
        const store = db.createObjectStore('gear', { keyPath: 'id' })
        store.createIndex('category', 'category')
        store.createIndex('onRig', 'onRig')
      }
    },
  })
}

export async function saveGearItem(item) {
  const itemWithUUID = {
    ...item,
    id: isValidUUID(item.id) ? item.id : uuidv4(),
  }
  const db = await getDB()
  await db.put('gear', itemWithUUID)

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    const { error } = await syncGearToSupabase(itemWithUUID, session.user.id)
    if (error) {
      addPendingSave(itemWithUUID)
    } else {
      removePendingSave(itemWithUUID.id)
    }
  }
}

export async function getGearItems() {
  const db = await getDB()
  return db.getAll('gear')
}

export async function getGearByCategory(category) {
  const db = await getDB()
  const index = db.transaction('gear').store.index('category')
  return index.getAll(category)
}

export async function deleteGearItem(id) {
  const db = await getDB()
  await db.delete('gear', id)

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { error } = await deleteGearFromSupabase(id)
      if (error) {
        addPendingDelete(id)
      } else {
        removePendingDelete(id)
      }
    }
  } catch (err) {
    console.error('deleteGearItem sync error, queuing:', err)
    addPendingDelete(id)
  }
}

export async function getGearSummary() {
  const items = await getGearItems()
  if (items.length === 0) return null

  const byCategory = {}
  items.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = []
    byCategory[item.category].push(item)
  })

  const lines = ['Equipment on Chomp (2014 JKU):']
  Object.entries(byCategory).forEach(([cat, catItems]) => {
    lines.push(`\n${cat}:`)
    catItems.forEach(item => {
      let line = `  - ${item.name}`
      if (item.vendor) line += ` (${item.vendor})`
      if (item.quantity > 1) line += ` x${item.quantity}`
      if (item.notes) line += ` · ${item.notes}`
      if (item.condition !== 'good') line += ` [${item.condition.toUpperCase()}]`
      lines.push(line)
    })
  })

  return lines.join('\n')
}
