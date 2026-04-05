'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { MainContent } from '@/components/main-content'
import { TransactionModal } from '@/components/transaction-modal'
import { ToastContainer, useToast } from '@/components/toast'
import { Transaction, SEED_DATA } from '@/lib/data'

const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'April 2026' },
  transactions: { title: 'Transactions', subtitle: 'All activity' },
  insights: { title: 'Insights', subtitle: 'Spending analysis' },
}

export default function FinSightDashboard() {
  const [currentPage, setCurrentPage] = useState('overview')
  const [role, setRole] = useState<'admin' | 'viewer'>('admin')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState({ search: '', type: '', category: '' })
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [chartRange, setChartRange] = useState(3)
  const { toasts, showToast } = useToast()

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('finsight_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        setTransactions(parsed.transactions || SEED_DATA)
        setTheme(parsed.theme || 'dark')
        setRole(parsed.role || 'admin')
      } else {
        setTransactions([...SEED_DATA])
      }
    } catch {
      setTransactions([...SEED_DATA])
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Save state to localStorage
  const saveState = useCallback(() => {
    localStorage.setItem('finsight_state', JSON.stringify({
      transactions,
      theme,
      role
    }))
  }, [transactions, theme, role])

  useEffect(() => {
    if (transactions.length > 0) {
      saveState()
    }
  }, [transactions, theme, role, saveState])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false)
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    setPage(1)
  }

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleAddClick = () => {
    setEditingTransaction(null)
    setModalOpen(true)
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this transaction?')) return
    setTransactions(prev => prev.filter(t => t.id !== id))
    showToast('Transaction deleted', 'red')
  }

  const handleSaveTransaction = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => t.id === editingTransaction.id ? { ...t, ...data } : t)
      )
      showToast('✓ Transaction updated')
    } else {
      const newId = Math.max(0, ...transactions.map(t => t.id)) + 1
      setTransactions(prev => [{ id: newId, ...data }, ...prev])
      showToast('✓ Transaction added')
    }
    setModalOpen(false)
  }

  const handleExport = () => {
    const csv = ['Date,Description,Category,Type,Amount,Note',
      ...transactions.map(t => `${t.date},"${t.desc}",${t.category},${t.type},${t.amount},"${t.note || ''}"`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'finsight-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('✓ CSV exported')
  }

  const pageInfo = PAGE_INFO[currentPage] || PAGE_INFO.overview

  return (
    <div className={theme}>
      <div className="flex min-h-screen">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          role={role}
          onRoleChange={setRole}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:ml-[220px] flex-1 flex flex-col min-h-screen transition-[margin]">
          <Header
            pageTitle={pageInfo.title}
            pageSubtitle={pageInfo.subtitle}
            showAddButton={currentPage === 'transactions' && role === 'admin'}
            onAddClick={handleAddClick}
            onExportClick={handleExport}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <MainContent
            currentPage={currentPage}
            transactions={transactions}
            role={role}
            filters={filters}
            sort={sort}
            page={page}
            perPage={10}
            chartRange={chartRange}
            theme={theme}
            onFiltersChange={f => { setFilters(f); setPage(1) }}
            onSortChange={setSort}
            onPageChange={setPage}
            onChartRangeChange={setChartRange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
          />
        </div>

        <TransactionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTransaction}
          editTransaction={editingTransaction}
        />

        <ToastContainer toasts={toasts} />
      </div>
    </div>
  )
}
