/**
 * useSync.js
 * Hook que monitora o status de conexão e gerencia a sincronização.
 * Retorna: isOnline, isSyncing, pendingCount, forceSync
 */

import { useState, useEffect, useCallback } from 'react'
import { getPendingCount } from '../services/syncQueue'
import { syncFromServer, processSyncQueue } from '../services/syncManager'

export function useSync() {
  const [isOnline, setIsOnline]       = useState(navigator.onLine)
  const [isSyncing, setIsSyncing]     = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Atualiza contagem de pendentes
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount()
    setPendingCount(count)
  }, [])

  // Processa a fila ao reconectar
  const sync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return
    setIsSyncing(true)
    try {
      await processSyncQueue()
      await refreshPendingCount()
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, refreshPendingCount])

  // Monitora conexão
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      await sync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [sync])

  // Sincroniza ao montar o app
  useEffect(() => {
    syncFromServer().then(refreshPendingCount)
  }, [refreshPendingCount])

  return { isOnline, isSyncing, pendingCount, forceSync: sync, refreshPendingCount }
}