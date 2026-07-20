/**
 * syncQueue.js
 * Gerencia a fila de operações pendentes no IndexedDB.
 * Cada operação tem: method, url, body, timestamp.
 */

import { openDB } from './indexedDB'

const STORE = 'syncQueue'

// Adiciona uma operação na fila
export async function enqueue(operation) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(STORE, 'readwrite')
    const store   = tx.objectStore(STORE)
    const request = store.add({
      ...operation,
      timestamp: new Date().toISOString(),
      retries: 0,
    })
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

// Retorna todas as operações pendentes
export async function getQueue() {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(STORE, 'readonly')
    const store   = tx.objectStore(STORE)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

// Remove uma operação da fila após processada com sucesso
export async function dequeue(id) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(STORE, 'readwrite')
    const store   = tx.objectStore(STORE)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}

// Incrementa o contador de tentativas de uma operação
export async function incrementRetry(id) {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = database.transaction(STORE, 'readwrite')
    const store   = tx.objectStore(STORE)
    const getReq  = store.get(id)
    getReq.onsuccess = () => {
      const item = getReq.result
      if (!item) { resolve(); return }
      item.retries += 1
      const putReq = store.put(item)
      putReq.onsuccess = () => resolve()
      putReq.onerror   = () => reject(putReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

// Retorna o total de operações pendentes
export async function getPendingCount() {
  const queue = await getQueue()
  return queue.length
}