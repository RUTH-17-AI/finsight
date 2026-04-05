'use client'

import { cn } from '@/lib/utils'

interface HeaderProps {
  pageTitle: string
  pageSubtitle: string
  showAddButton: boolean
  onAddClick: () => void
  onExportClick: () => void
  onMenuClick: () => void
}

export function Header({ 
  pageTitle, 
  pageSubtitle, 
  showAddButton, 
  onAddClick, 
  onExportClick,
  onMenuClick
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)] px-7 h-[58px] flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden flex flex-col gap-1 cursor-pointer p-1.5 rounded-md bg-transparent border-none text-[var(--text)]"
        >
          <span className="block w-[18px] h-[1.5px] bg-current rounded-sm transition-all" />
          <span className="block w-[18px] h-[1.5px] bg-current rounded-sm transition-all" />
          <span className="block w-[18px] h-[1.5px] bg-current rounded-sm transition-all" />
        </button>
        
        <div>
          <div className="font-serif text-lg font-light text-[var(--text)]">
            {pageTitle}
          </div>
          <div className="text-[11px] font-mono text-[var(--text3)]">
            {pageSubtitle}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button 
          onClick={onExportClick}
          className="px-3.5 py-1.5 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--text2)] font-sans text-xs cursor-pointer transition-all flex items-center gap-1.5 hover:bg-[var(--bg3)] hover:text-[var(--text)]"
        >
          ↓ <span className="hidden sm:inline">Export</span>
        </button>
        
        <button 
          onClick={onAddClick}
          className={cn(
            "px-3.5 py-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)] font-sans text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 hover:bg-[var(--accent2)]",
            !showAddButton && "hidden"
          )}
        >
          + <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>
    </header>
  )
}
