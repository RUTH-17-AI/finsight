'use client'

import { useEffect, useState } from 'react'

interface Toast {
  id: number
  message: string
  type: 'green' | 'red' | 'amber'
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: 'green' | 'red' | 'amber' = 'green') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return { toasts, showToast }
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
    const timer = setTimeout(() => setIsVisible(false), 2700)
    return () => clearTimeout(timer)
  }, [])

  const borderColor = toast.type === 'green' ? 'var(--green)' : toast.type === 'red' ? 'var(--red)' : 'var(--amber)'

  return (
    <div 
      className={`bg-[var(--bg3)] border border-[var(--border2)] rounded-lg px-4 py-3 text-[13px] text-[var(--text)] flex items-center gap-2.5 max-w-[280px] shadow-lg transition-all duration-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}
      style={{ borderLeft: `2px solid ${borderColor}` }}
    >
      {toast.message}
    </div>
  )
}
