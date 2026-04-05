'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Transaction, CATEGORIES } from '@/lib/data'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Omit<Transaction, 'id'>) => void
  editTransaction: Transaction | null
}

export function TransactionModal({ isOpen, onClose, onSave, editTransaction }: TransactionModalProps) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (editTransaction) {
      setDesc(editTransaction.desc)
      setAmount(editTransaction.amount.toString())
      setDate(editTransaction.date)
      setType(editTransaction.type)
      setCategory(editTransaction.category)
      setNote(editTransaction.note || '')
    } else {
      setDesc('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setType('expense')
      setCategory('Food')
      setNote('')
    }
  }, [editTransaction, isOpen])

  const handleSubmit = () => {
    if (!desc.trim() || !amount || !date) {
      return
    }
    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      return
    }

    onSave({
      desc: desc.trim(),
      amount: amountNum,
      date,
      type,
      category,
      note: note.trim()
    })
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-5 transition-opacity backdrop-blur-sm",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn(
        "bg-[var(--bg2)] border border-[var(--border2)] rounded-xl p-7 w-full max-w-[440px] transition-transform",
        isOpen ? "translate-y-0 scale-100" : "translate-y-2.5 scale-[0.98]"
      )}>
        <div className="font-serif text-lg font-light text-[var(--text)] mb-5">
          {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </div>

        <div className="mb-3.5">
          <label className="block text-[11px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Netflix subscription"
            className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] px-3 py-2.5 outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text3)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div>
            <label className="block text-[11px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] px-3 py-2.5 outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text3)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] px-3 py-2.5 outline-none transition-colors focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div>
            <label className="block text-[11px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] px-3 py-2.5 outline-none transition-colors focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] px-3 py-2.5 outline-none transition-colors focus:border-[var(--accent)] cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional details"
            className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] px-3 py-2.5 outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text3)]"
          />
        </div>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-sans text-[13px] cursor-pointer transition-all border border-[var(--border2)] bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg font-sans text-[13px] font-medium cursor-pointer transition-all border border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent2)]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
