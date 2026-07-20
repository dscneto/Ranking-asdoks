/**
 * indexedDB.js
 * Configura e expõe o banco local IndexedDB.
 * Stores: athletes, competitions, competitionTypes, trainingUnits, results, syncQueue
 */

const DB_NAME    = 'asdoks_offline'
const DB_VERSION = 1

let db = null

export function openDB() {
  if (db) return Promise.resolve(db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Stores de dados
      if (!database.objectStoreNames.contains('athletes'))
        database.createObjectStore('athletes', { keyPath: 'id' })

      if (!database.objectStoreNames.contains('competitions'))
        database.createObjectStore('competitions', { keyPath: 'id' })

      if (!database.objectStoreNames.contains('competitionTypes'))
        database.createObjectStore('competitionTypes', { keyPath: 'id' })

      if (!database.objectStoreNames.contains('trainingUnits'))
        database.createObjectStore('trainingUnits', { keyPath: 'id' })

      if (!database.objectStoreNames.contains('results'))
        database.createObjectStore('results', { keyPath: 'id' })

      // Fila de operações pendentes
      if (!database.objectStoreNames.contains('syncQueue'))
        database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
    }

    request.onsuccess = (event) => {
      db = event.target.result
      resolve(db)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

// ─── Helpers genéricos ────────────────────────────────────────────────────────

export async function getAll(storeName) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(storeName, 'readonly')
    const store   = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

export async function getById(storeName, id) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(storeName, 'readonly')
    const store   = tx.objectStore(storeName)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

export async function putItem(storeName, item) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(storeName, 'readwrite')
    const store   = tx.objectStore(storeName)
    const request = store.put(item)
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

export async function putMany(storeName, items) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = database.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    items.forEach(item => store.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export async function deleteItem(storeName, id) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(storeName, 'readwrite')
    const store   = tx.objectStore(storeName)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}

export async function clearStore(storeName) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(storeName, 'readwrite')
    const store   = tx.objectStore(storeName)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}