import { openDB } from 'idb'

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
  const db = await getDB()
  await db.put('gear', item)
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
