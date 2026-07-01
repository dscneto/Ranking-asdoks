import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]
          px-5 py-3 rounded-xl text-sm font-medium text-white shadow-xl
          transition-all animate-fade-up whitespace-nowrap
          ${toast.type === 'error'   ? 'bg-red-800'   : ''}
          ${toast.type === 'success' ? 'bg-[#166534]'  : ''}
          ${toast.type === 'info'    ? 'bg-[#0D3278]'  : ''}
        `}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
