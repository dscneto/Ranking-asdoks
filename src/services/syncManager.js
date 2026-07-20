/**
 * syncManager.js
 * Gerencia a sincronização entre IndexedDB e o servidor.
 * - Faz o cache inicial dos dados do servidor
 * - Processa a fila de operações pendentes ao reconectar
 */

import { putMany, clearStore } from './indexedDB'
import { getQueue, dequeue, incrementRetry } from './syncQueue'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const MAX_RETRIES = 3

function getToken() {
  return localStorage.getItem('asdoks_token')
}

function authHeaders() {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// ─── Sincroniza dados do servidor para o IndexedDB ────────────────────────────
export async function syncFromServer() {
  try {
    const endpoints = [
      { url: '/athletes',          store: 'athletes'         },
      { url: '/competitions',      store: 'competitions'     },
      { url: '/competition-types', store: 'competitionTypes' },
      { url: '/training-units',    store: 'trainingUnits'    },
      { url: '/results/all',       store: 'results'          },
    ]

    await Promise.all(
      endpoints.map(async ({ url, store }) => {
        try {
          const res = await fetch(`${BASE_URL}${url}`, {
            headers: authHeaders(),
          })
          if (!res.ok) return
          const data = await res.json()
          await clearStore(store)
          await putMany(store, data)
        } catch {
          // Falha silenciosa — sem internet, usa cache
        }
      })
    )
  } catch {
    // Sem internet — usa dados do IndexedDB
  }
}

// ─── Processa a fila de operações pendentes ───────────────────────────────────
export async function processSyncQueue() {
  const queue = await getQueue()
  if (queue.length === 0) return { processed: 0, failed: 0 }

  let processed = 0
  let failed    = 0

  for (const operation of queue) {
    if (operation.retries >= MAX_RETRIES) {
      await dequeue(operation.id)
      failed++
      continue
    }

    try {
      const res = await fetch(`${BASE_URL}${operation.url}`, {
        method:  operation.method,
        headers: authHeaders(),
        body:    operation.body ? JSON.stringify(operation.body) : undefined,
      })

      if (res.ok || res.status === 404) {
        // 404 significa que o item já foi deletado — remove da fila
        await dequeue(operation.id)
        processed++
      } else {
        await incrementRetry(operation.id)
        failed++
      }
    } catch {
      await incrementRetry(operation.id)
      failed++
    }
  }

  // Após processar a fila, atualiza o cache local
  if (processed > 0) {
    await syncFromServer()
  }

  return { processed, failed }
}