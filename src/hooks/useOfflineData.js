/**
 * useOfflineData.js
 * Hook que busca dados do IndexedDB quando offline
 * e da API quando online, mantendo o cache sempre atualizado.
 */

import { useState, useEffect, useCallback } from 'react'
import { getAll, getById as getByIdDB } from '../services/indexedDB'
import { enqueue } from '../services/syncQueue'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('asdoks_token')
}

async function apiFetch(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

/**
 * Hook principal — busca lista de uma store
 * Online: busca da API e atualiza IndexedDB
 * Offline: busca do IndexedDB
 */
export function useOfflineList(storeName, apiPath) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (navigator.onLine) {
        const result = await apiFetch('GET', apiPath)
        setData(result || [])
      } else {
        const cached = await getAll(storeName)
        setData(cached || [])
      }
    } catch {
      // Fallback para cache se API falhar
      try {
        const cached = await getAll(storeName)
        setData(cached || [])
      } catch (e) {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [storeName, apiPath])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refresh: load }
}

/**
 * Executa uma operação de escrita.
 * Online: envia direto para a API
 * Offline: salva na fila de sync
 */
export async function offlineWrite(method, url, body, localAction) {
  if (navigator.onLine) {
    // Online — envia direto
    return apiFetch(method, url, body)
  } else {
    // Offline — enfileira e executa ação local no IndexedDB
    await enqueue({ method, url, body })
    if (localAction) await localAction()
    return body
  }
}