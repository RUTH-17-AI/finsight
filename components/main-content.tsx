'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Transaction, CAT_COLORS, fmt, fmtShort, pct } from '@/lib/data'

interface MainContentProps {
  currentPage: string
  transactions: Transaction[]
  role: 'admin' | 'viewer'
  filters: { search: string; type: string; category: string }
  sort: { key: string; dir: string }
  page: number
  perPage: number
  chartRange: number
  theme: 'dark' | 'light'
  onFiltersChange: (filters: { search: string; type: string; category: string }) => void
  onSortChange: (sort: { key: string; dir: string }) => void
  onPageChange: (page: number) => void
  onChartRangeChange: (range: number) => void
  onEdit: (tx: Transaction) => void
  onDelete: (id: number) => void
  onNavigate: (page: string) => void
}

function getMonthTxs(transactions: Transaction[], monthsAgo = 0) {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0)
  return transactions.filter(t => {
    const d = new Date(t.date)
    return d >= target && d <= end
  })
}

function computeStats(transactions: Transaction[]) {
  const thisMonth = getMonthTxs(transactions, 0)
  const lastMonth = getMonthTxs(transactions, 1)
  const income = thisMonth.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const expense = thisMonth.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const lastIncome = lastMonth.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const lastExpense = lastMonth.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const balance = transactions.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0)
  const savings = income > 0 ? ((income - expense) / income * 100) : 0
  return { income, expense, balance, savings, lastIncome, lastExpense }
}

export function MainContent({
  currentPage,
  transactions,
  role,
  filters,
  sort,
  page,
  perPage,
  chartRange,
  onFiltersChange,
  onSortChange,
  onPageChange,
  onEdit,
  onDelete,
  onNavigate,
  onChartRangeChange,
}: MainContentProps) {
  const stats = useMemo(() => computeStats(transactions), [transactions])
  
  const thisMonthExpenses = useMemo(() => {
    return getMonthTxs(transactions, 0).filter(t => t.type === 'expense')
  }, [transactions])
  
  const catTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    thisMonthExpenses.forEach(t => totals[t.category] = (totals[t.category] || 0) + t.amount)
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [thisMonthExpenses])
  
  const spendingTotal = catTotals.reduce((a, e) => a + e[1], 0)

  const recentTx = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }, [transactions])

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    let txs = [...transactions]
    const { search, type, category } = filters
    if (search) {
      txs = txs.filter(t => 
        t.desc.toLowerCase().includes(search.toLowerCase()) || 
        t.category.toLowerCase().includes(search.toLowerCase()) || 
        (t.note && t.note.toLowerCase().includes(search.toLowerCase()))
      )
    }
    if (type) txs = txs.filter(t => t.type === type)
    if (category) txs = txs.filter(t => t.category === category)

    txs.sort((a, b) => {
      const { key, dir } = sort
      let av: Date | number = key === 'date' ? new Date(a[key]) : a[key as keyof Transaction]
      let bv: Date | number = key === 'date' ? new Date(b[key]) : b[key as keyof Transaction]
      if (key === 'amount') { av = Number(a.amount); bv = Number(b.amount) }
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ? 1 : -1
      return 0
    })
    return txs
  }, [transactions, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / perPage))
  const currentPageNum = Math.min(page, totalPages)
  const paginatedTxs = filteredTxs.slice((currentPageNum - 1) * perPage, currentPageNum * perPage)

  const categories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category))].sort()
  }, [transactions])

  // Monthly data for insights
  const monthlyData = useMemo(() => {
    const now = new Date()
    const data = []
    for (let i = 3; i >= 0; i--) {
      const txs = getMonthTxs(transactions, i)
      const inc = txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
      const exp = txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      data.push({ label: d.toLocaleString('en-US', { month: 'short' }), income: inc, expense: exp })
    }
    return data
  }, [transactions])

  const maxMonthlyVal = Math.max(...monthlyData.flatMap(m => [m.income, m.expense])) || 1

  // Trend data
  const trendData = useMemo(() => {
    const now = new Date()
    const data = []
    let balance = 0
    for (let i = chartRange - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthTxs = transactions.filter(t => {
        const td = new Date(t.date)
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
      })
      monthTxs.forEach(t => balance += t.type === 'income' ? t.amount : -t.amount)
      data.push({
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        value: balance
      })
    }
    return data
  }, [transactions, chartRange])

  // Insights data
  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense')
    const allCatTotals: Record<string, number> = {}
    expenses.forEach(t => allCatTotals[t.category] = (allCatTotals[t.category] || 0) + t.amount)
    const topCat = Object.entries(allCatTotals).sort((a, b) => b[1] - a[1])[0]
    const avgTx = expenses.length ? expenses.reduce((a, t) => a + t.amount, 0) / expenses.length : 0

    return [
      { icon: '⬆', label: 'Top Spending Category', value: topCat ? topCat[0] : '—', desc: topCat ? fmt(topCat[1]) + ' total across all months' : 'No expenses recorded yet' },
      { icon: '◑', label: 'Savings This Month', value: stats.income > 0 ? (((stats.income - stats.expense) / stats.income) * 100).toFixed(1) + '%' : '—', desc: stats.income > 0 ? 'Saved ' + fmt(Math.max(0, stats.income - stats.expense)) + ' of ' + fmt(stats.income) + ' income' : 'No income this month' },
      { icon: '⇄', label: 'Avg Transaction Size', value: avgTx ? fmt(avgTx) : '—', desc: transactions.length + ' total transactions on record' },
      { icon: '↑', label: 'Income Change', value: pct(stats.income, stats.lastIncome), desc: 'vs last month: ' + fmt(stats.lastIncome) },
      { icon: '↓', label: 'Expense Change', value: pct(stats.expense, stats.lastExpense), desc: 'vs last month: ' + fmt(stats.lastExpense) },
      { icon: '◎', label: 'Net Cash Flow', value: fmt(stats.income - stats.expense), desc: stats.income >= stats.expense ? 'Positive month — well done!' : 'Expenses exceed income this month' }
    ]
  }, [transactions, stats])

  const sortColumn = (key: string) => {
    if (sort.key === key) {
      onSortChange({ key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ key, dir: key === 'date' ? 'desc' : 'asc' })
    }
  }

  return (
    <div className="p-7 flex-1 overflow-x-hidden">
      {/* Overview Page */}
      {currentPage === 'overview' && (
        <div className="animate-[fadeUp_0.25s_ease]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6">
            <SummaryCard
              label="Total Balance"
              value={fmt(stats.balance)}
              change={`Net: ${stats.income - stats.expense > 0 ? '+' : ''}${fmt(stats.income - stats.expense)} this month`}
              changeType="pos"
              icon="◈"
              accentColor="var(--accent)"
            />
            <SummaryCard
              label="Monthly Income"
              value={fmt(stats.income)}
              change={`vs last month: ${pct(stats.income, stats.lastIncome)}`}
              changeType="pos"
              icon="↑"
              accentColor="var(--green)"
            />
            <SummaryCard
              label="Monthly Expenses"
              value={fmt(stats.expense)}
              change={`vs last month: ${pct(stats.expense, stats.lastExpense)}`}
              changeType="neg"
              icon="↓"
              accentColor="var(--red)"
            />
            <SummaryCard
              label="Savings Rate"
              value={`${stats.savings.toFixed(1)}%`}
              change={`Saved: ${fmt(Math.max(0, stats.income - stats.expense))}`}
              changeType="neu"
              icon="◑"
              accentColor="var(--blue)"
              valueColor={stats.savings >= 20 ? 'var(--green)' : stats.savings < 0 ? 'var(--red)' : undefined}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-3.5 mb-6">
            {/* Balance Trend */}
            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-serif text-[15px] font-light text-[var(--text)] mb-0.5">Balance Trend</div>
                  <div className="text-[11px] font-mono text-[var(--text3)]">Running balance over time</div>
                </div>
                <div className="flex gap-1">
                  {[3, 6, 12].map(m => (
                    <button
                      key={m}
                      onClick={() => onChartRangeChange(m)}
                      className={cn(
                        "text-[11px] font-mono px-2.5 py-1 rounded-full cursor-pointer border border-[var(--border)] text-[var(--text3)] bg-transparent transition-all",
                        chartRange === m && "bg-[var(--bg4)] text-[var(--text)] border-[var(--border2)]"
                      )}
                    >
                      {m === 12 ? '1Y' : `${m}M`}
                    </button>
                  ))}
                </div>
              </div>
              <SimpleTrendChart data={trendData} />
            </div>

            {/* Spending by Category */}
            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-serif text-[15px] font-light text-[var(--text)] mb-0.5">Spending by Category</div>
                  <div className="text-[11px] font-mono text-[var(--text3)]">This month</div>
                </div>
              </div>
              <div className="flex items-center justify-center h-[180px] relative">
                <SimpleDonutChart data={catTotals} total={spendingTotal} />
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {catTotals.slice(0, 5).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[var(--text2)]">
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: CAT_COLORS[cat] || '#a0a098' }} />
                      <span>{cat}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--text3)]">
                      {fmt(amt)} · {spendingTotal > 0 ? ((amt / spendingTotal) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-serif text-[15px] font-light text-[var(--text)] mb-0.5">Recent Transactions</div>
                <div className="text-[11px] font-mono text-[var(--text3)]">Last 5 entries</div>
              </div>
              <button 
                onClick={() => onNavigate('transactions')}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--text2)] font-sans text-xs cursor-pointer transition-all hover:bg-[var(--bg3)] hover:text-[var(--text)]"
              >
                View all →
              </button>
            </div>
            {recentTx.length === 0 ? (
              <div className="py-[60px] text-center text-[var(--text3)]">
                <div className="text-[32px] mb-3 opacity-40">◎</div>
                <div className="font-mono text-[13px]">No transactions yet</div>
              </div>
            ) : (
              <div>
                {recentTx.map(t => (
                  <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-b-0">
                    <div className="flex-1">
                      <div className="text-[13px] text-[var(--text)] font-normal">{t.desc}</div>
                      <div className="text-[11px] text-[var(--text3)] font-mono">{t.date} · {t.category}</div>
                    </div>
                    <div className={cn(
                      "font-mono text-[13px] font-medium whitespace-nowrap",
                      t.type === 'income' ? "text-[var(--green)]" : "text-[var(--red)]"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Page */}
      {currentPage === 'transactions' && (
        <div className="animate-[fadeUp_0.25s_ease]">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="font-serif text-xl font-light text-[var(--text)] mb-0.5">Transactions</div>
              <div className="text-[11px] font-mono text-[var(--text3)]">{filteredTxs.length} transaction{filteredTxs.length !== 1 ? 's' : ''}</div>
            </div>
            <span className="text-[11px] font-mono text-[var(--text3)] bg-[var(--bg3)] px-2.5 py-1 rounded-full border border-[var(--border)]">
              {role === 'admin' ? 'Admin — can add & edit' : 'Viewer — read only'}
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-2.5 mb-4 flex-wrap items-center">
            <div className="flex-1 min-w-[180px] relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text3)] text-sm pointer-events-none">⌕</span>
              <input
                type="text"
                placeholder="Search transactions…"
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="w-full bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[var(--text)] font-sans text-[13px] py-2 px-3 pl-9 outline-none transition-colors focus:border-[var(--border2)] placeholder:text-[var(--text3)]"
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[var(--text2)] font-sans text-xs py-2 px-2.5 cursor-pointer outline-none transition-all min-w-[120px] hover:border-[var(--border2)] hover:text-[var(--text)]"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[var(--text2)] font-sans text-xs py-2 px-2.5 cursor-pointer outline-none transition-all min-w-[120px] hover:border-[var(--border2)] hover:text-[var(--text)]"
            >
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={`${sort.key}-${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split('-')
                onSortChange({ key, dir })
              }}
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg text-[var(--text2)] font-sans text-xs py-2 px-2.5 cursor-pointer outline-none transition-all min-w-[120px] hover:border-[var(--border2)] hover:text-[var(--text)]"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
            <span className="text-[11px] font-mono text-[var(--text3)] whitespace-nowrap py-2">
              {filteredTxs.length} result{filteredTxs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th onClick={() => sortColumn('date')} className="bg-[var(--bg3)] px-4 py-2.5 text-left text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-[var(--text2)]">
                    Date <span className={cn("ml-1 opacity-40", sort.key === 'date' && "opacity-100 text-[var(--accent)]")}>{sort.key === 'date' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                  <th className="bg-[var(--bg3)] px-4 py-2.5 text-left text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">Description</th>
                  <th onClick={() => sortColumn('category')} className="bg-[var(--bg3)] px-4 py-2.5 text-left text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-[var(--text2)]">
                    Category <span className={cn("ml-1 opacity-40", sort.key === 'category' && "opacity-100 text-[var(--accent)]")}>{sort.key === 'category' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                  <th className="bg-[var(--bg3)] px-4 py-2.5 text-left text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">Type</th>
                  <th onClick={() => sortColumn('amount')} className="bg-[var(--bg3)] px-4 py-2.5 text-right text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)] cursor-pointer select-none whitespace-nowrap transition-colors hover:text-[var(--text2)]">
                    Amount <span className={cn("ml-1 opacity-40", sort.key === 'amount' && "opacity-100 text-[var(--accent)]")}>{sort.key === 'amount' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                  {role === 'admin' && (
                    <th className="bg-[var(--bg3)] px-4 py-2.5 text-right text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider border-b border-[var(--border)]">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedTxs.map(t => (
                  <tr key={t.id} className="border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--bg3)]">
                    <td className="px-4 py-3 text-[12px] font-mono text-[var(--text3)] whitespace-nowrap align-middle">{t.date}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="text-[13px] text-[var(--text)] font-normal">{t.desc}</div>
                      {t.note && <div className="text-[11px] text-[var(--text3)] mt-0.5">{t.note}</div>}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`cat-${t.category.toLowerCase().replace(/\s/g, '-')} inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap`}>
                        ⬤ {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wide",
                        t.type === 'income' ? "bg-[rgba(74,204,168,0.12)] text-[var(--green)]" : "bg-[rgba(240,90,90,0.12)] text-[var(--red)]"
                      )}>
                        {t.type}
                      </span>
                    </td>
                    <td className={cn(
                      "px-4 py-3 font-mono text-[13px] font-medium text-right whitespace-nowrap align-middle",
                      t.type === 'income' ? "text-[var(--green)]" : "text-[var(--red)]"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    {role === 'admin' && (
                      <td className="px-4 py-3 align-middle">
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => onEdit(t)}
                            className="bg-transparent border border-[var(--border)] rounded-md text-[var(--text3)] text-xs px-2 py-1 cursor-pointer transition-all font-sans hover:bg-[var(--bg4)] hover:text-[var(--text)] hover:border-[var(--border2)]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => onDelete(t.id)}
                            className="bg-transparent border border-[var(--border)] rounded-md text-[var(--text3)] text-xs px-2 py-1 cursor-pointer transition-all font-sans hover:border-[var(--red)] hover:text-[var(--red)]"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {paginatedTxs.length === 0 && (
              <div className="py-[60px] text-center text-[var(--text3)]">
                <div className="text-[32px] mb-3 opacity-40">◎</div>
                <div className="font-mono text-[13px]">No transactions match your filters</div>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--bg2)] rounded-b-xl">
              <span className="text-[11px] font-mono text-[var(--text3)]">
                Page {currentPageNum} of {totalPages} ({filteredTxs.length} records)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onPageChange(currentPageNum - 1)}
                  disabled={currentPageNum <= 1}
                  className="bg-transparent border border-[var(--border)] rounded-md text-[var(--text2)] text-xs px-2.5 py-1 cursor-pointer transition-all font-mono disabled:opacity-35 disabled:cursor-default hover:enabled:bg-[var(--bg3)] hover:enabled:text-[var(--text)]"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  if (p === 1 || p === totalPages || Math.abs(p - currentPageNum) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={cn(
                          "bg-transparent border border-[var(--border)] rounded-md text-[var(--text2)] text-xs px-2.5 py-1 cursor-pointer transition-all font-mono hover:bg-[var(--bg3)] hover:text-[var(--text)]",
                          p === currentPageNum && "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                        )}
                      >
                        {p}
                      </button>
                    )
                  } else if (Math.abs(p - currentPageNum) === 2) {
                    return (
                      <button key={p} disabled className="bg-transparent border border-[var(--border)] rounded-md text-[var(--text2)] text-xs px-2.5 py-1 font-mono opacity-35 cursor-default">
                        …
                      </button>
                    )
                  }
                  return null
                })}
                <button
                  onClick={() => onPageChange(currentPageNum + 1)}
                  disabled={currentPageNum >= totalPages}
                  className="bg-transparent border border-[var(--border)] rounded-md text-[var(--text2)] text-xs px-2.5 py-1 cursor-pointer transition-all font-mono disabled:opacity-35 disabled:cursor-default hover:enabled:bg-[var(--bg3)] hover:enabled:text-[var(--text)]"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Page */}
      {currentPage === 'insights' && (
        <div className="animate-[fadeUp_0.25s_ease]">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="font-serif text-xl font-light text-[var(--text)] mb-0.5">Insights</div>
              <div className="text-[11px] font-mono text-[var(--text3)]">Data-driven observations from your activity</div>
            </div>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 mb-6">
            {insights.map((item, i) => (
              <div key={i} className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-5 py-4 transition-colors hover:border-[var(--border2)]">
                <div className="text-xl mb-2.5">{item.icon}</div>
                <div className="text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">{item.label}</div>
                <div className="font-mono text-xl font-medium text-[var(--text)] mb-1 tracking-tight">{item.value}</div>
                <div className="text-xs text-[var(--text3)] leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Monthly Comparison */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-5 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-serif text-[15px] font-light text-[var(--text)] mb-0.5">Monthly Comparison</div>
                <div className="text-[11px] font-mono text-[var(--text3)]">Income vs Expenses per month</div>
              </div>
            </div>
            {monthlyData.map((m, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="text-[11px] font-mono text-[var(--text3)] mb-2 uppercase tracking-wide">{m.label}</div>
                <div className="grid grid-cols-[100px_1fr_80px] items-center gap-3.5 mb-2.5">
                  <div className="text-xs font-mono text-[var(--text2)] whitespace-nowrap">Income</div>
                  <div className="h-1.5 bg-[var(--bg4)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--green)] rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${(m.income / maxMonthlyVal * 100).toFixed(1)}%` }} 
                    />
                  </div>
                  <div className="font-mono text-xs text-[var(--text2)] text-right">{fmtShort(m.income)}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr_80px] items-center gap-3.5">
                  <div className="text-xs font-mono text-[var(--text2)] whitespace-nowrap">Expenses</div>
                  <div className="h-1.5 bg-[var(--bg4)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--red)] rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${(m.expense / maxMonthlyVal * 100).toFixed(1)}%` }} 
                    />
                  </div>
                  <div className="font-mono text-xs text-[var(--text2)] text-right">{fmtShort(m.expense)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart Placeholder */}
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-serif text-[15px] font-light text-[var(--text)] mb-0.5">Income vs Expenses</div>
                <div className="text-[11px] font-mono text-[var(--text3)]">Monthly overview</div>
              </div>
            </div>
            <SimpleBarChart data={monthlyData} />
          </div>
        </div>
      )}
    </div>
  )
}

// Summary Card Component
function SummaryCard({ 
  label, 
  value, 
  change, 
  changeType, 
  icon, 
  accentColor,
  valueColor 
}: { 
  label: string
  value: string
  change: string
  changeType: 'pos' | 'neg' | 'neu'
  icon: string
  accentColor: string
  valueColor?: string
}) {
  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl px-5 py-4 relative overflow-hidden transition-all hover:border-[var(--border2)] hover:-translate-y-px cursor-default">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accentColor }} />
      <div className="text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider mb-2.5">{label}</div>
      <div 
        className="font-mono text-2xl sm:text-[26px] font-medium text-[var(--text)] tracking-tight leading-none mb-2"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      <div className={cn(
        "text-[11px] font-mono flex items-center gap-1",
        changeType === 'pos' && "text-[var(--green)]",
        changeType === 'neg' && "text-[var(--red)]",
        changeType === 'neu' && "text-[var(--text3)]"
      )}>
        {change}
      </div>
      <div className="absolute top-4 right-4 text-[22px] opacity-15">{icon}</div>
    </div>
  )
}

// Simple Trend Chart (CSS-based)
function SimpleTrendChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  
  return (
    <div className="h-[200px] flex items-end gap-2">
      {data.map((d, i) => {
        const height = ((d.value - min) / range) * 150 + 30
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
            <div className="text-[10px] font-mono text-[var(--text3)]">{fmtShort(d.value)}</div>
            <div 
              className="w-full bg-[var(--accent)] rounded-t-md transition-all duration-500 min-h-[4px] opacity-80"
              style={{ height: `${height}px` }}
            />
            <div className="text-[10px] font-mono text-[var(--text3)]">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}

// Simple Donut Chart (CSS-based)
function SimpleDonutChart({ data, total }: { data: [string, number][]; total: number }) {
  if (data.length === 0) {
    return (
      <div className="text-center text-[var(--text3)] text-xs">No expenses this month</div>
    )
  }

  let cumulativePercent = 0
  const segments = data.map(([cat, amt]) => {
    const percent = total > 0 ? (amt / total) * 100 : 0
    const segment = { cat, percent, start: cumulativePercent, color: CAT_COLORS[cat] || '#a0a098' }
    cumulativePercent += percent
    return segment
  })

  // Create conic-gradient
  const gradientStops = segments.map(s => 
    `${s.color} ${s.start}% ${s.start + s.percent}%`
  ).join(', ')

  return (
    <div className="relative w-[140px] h-[140px]">
      <div 
        className="w-full h-full rounded-full"
        style={{ 
          background: `conic-gradient(${gradientStops})`,
        }}
      />
      <div className="absolute inset-[28%] bg-[var(--bg2)] rounded-full flex flex-col items-center justify-center">
        <div className="font-mono text-lg font-medium text-[var(--text)]">{fmtShort(total)}</div>
        <div className="text-[10px] font-mono text-[var(--text3)] uppercase tracking-wide">Spent</div>
      </div>
    </div>
  )
}

// Simple Bar Chart
function SimpleBarChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense])) || 1
  
  return (
    <div className="h-[220px] flex items-end gap-4 px-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="flex gap-1 items-end h-[170px]">
            <div 
              className="w-6 bg-[rgba(74,204,168,0.6)] rounded-t transition-all duration-500"
              style={{ height: `${(d.income / max) * 150}px` }}
              title={`Income: ${fmt(d.income)}`}
            />
            <div 
              className="w-6 bg-[rgba(240,90,90,0.6)] rounded-t transition-all duration-500"
              style={{ height: `${(d.expense / max) * 150}px` }}
              title={`Expense: ${fmt(d.expense)}`}
            />
          </div>
          <div className="text-[11px] font-mono text-[var(--text3)]">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
