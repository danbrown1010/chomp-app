import { openDB } from 'idb'

const DB_NAME = 'vela-knowledge'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' })
        docStore.createIndex('name', 'name')
      }
      if (!db.objectStoreNames.contains('chunks')) {
        const chunkStore = db.createObjectStore('chunks', { keyPath: 'id', autoIncrement: true })
        chunkStore.createIndex('docId', 'docId')
      }
    },
  })
}

export async function saveDocument(doc) {
  const db = await getDB()
  await db.put('documents', doc)
}

export async function getDocuments() {
  const db = await getDB()
  return db.getAll('documents')
}

export async function deleteDocument(id) {
  const db = await getDB()
  await db.delete('documents', id)
  // Batch-delete chunks to avoid a single long-lived transaction
  const allChunks = await db.getAllFromIndex('chunks', 'docId', id)
  const BATCH = 200
  for (let i = 0; i < allChunks.length; i += BATCH) {
    const tx = db.transaction('chunks', 'readwrite')
    for (const chunk of allChunks.slice(i, i + BATCH)) tx.store.delete(chunk.id)
    await tx.done
  }
}

// Batch writes — each transaction holds at most BATCH_SIZE records so the
// browser never auto-commits a long-idle transaction mid-loop.
export async function saveChunks(chunks, onProgress) {
  const db = await getDB()
  const BATCH = 100
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    const tx = db.transaction('chunks', 'readwrite')
    for (const chunk of batch) tx.store.add(chunk)   // no await inside tx
    await tx.done
    onProgress?.(i + batch.length, chunks.length)
  }
}

export async function getChunksForDoc(docId) {
  const db = await getDB()
  return db.getAllFromIndex('chunks', 'docId', docId)
}

export async function getAllChunks() {
  const db = await getDB()
  return db.getAll('chunks')
}

export async function searchChunks(query, limit = 8) {
  const chunks = await getAllChunks()
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3)
  if (terms.length === 0) return chunks.slice(0, limit)

  const scored = chunks.map(chunk => {
    const text = chunk.text.toLowerCase()
    const score = terms.reduce((acc, term) => {
      return acc + (text.match(new RegExp(term, 'g')) || []).length
    }, 0)
    return { ...chunk, score }
  })

  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
