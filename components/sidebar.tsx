'use client'

import { cn } from '@/lib/utils'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  role: 'admin' | 'viewer'
  onRoleChange: (role: 'admin' | 'viewer') => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { page: 'overview', icon: '◈', label: 'Overview' },
  { page: 'transactions', icon: '⇄', label: 'Transactions' },
  { page: 'insights', icon: '◎', label: 'Insights' },
]

export function Sidebar({ 
  currentPage, 
  onNavigate, 
  role, 
  onRoleChange, 
  theme, 
  onThemeToggle, 
  isOpen,
  onClose
}: SidebarProps) {
  const handleNavClick = (page: string) => {
    onNavigate(page)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-[90] lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-[220px] bg-[var(--bg2)] border-r border-[var(--border)] flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-transform",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-[22px] pb-[18px] border-b border-[var(--border)]">
          <div className="font-serif text-xl font-normal text-[var(--text)] tracking-tight">
            Fin<span className="text-[var(--accent)]">Sight</span>
          </div>
          <div className="text-[10px] font-mono text-[var(--text3)] mt-0.5 uppercase tracking-wider">
            Financial Dashboard
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider px-2 mb-1.5 mt-4">
            Menu
          </div>
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-[var(--text2)] text-[13px] font-normal transition-all border border-transparent mb-0.5 select-none",
                "hover:bg-[var(--bg3)] hover:text-[var(--text)]",
                currentPage === item.page && "bg-[var(--bg3)] text-[var(--text)] border-[var(--border)]"
              )}
            >
              <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              {item.label}
              {currentPage === item.page && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] ml-auto shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          {/* Role Selector */}
          <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg px-3 py-2.5 mb-2.5">
            <div className="text-[10px] font-mono text-[var(--text3)] uppercase tracking-wider mb-1.5">
              Current Role
            </div>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as 'admin' | 'viewer')}
              className="w-full bg-[var(--bg4)] border border-[var(--border2)] rounded-md text-[var(--text)] font-sans text-xs px-2 py-1.5 cursor-pointer outline-none transition-all"
            >
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <div className="flex items-center gap-1.5 text-[11px] font-mono mt-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                role === 'admin' ? "bg-[var(--accent)]" : "bg-[var(--amber)]"
              )} />
              <span className="text-[var(--text2)]">
                {role === 'admin' ? 'Admin — full access' : 'Viewer — read only'}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-[var(--text2)] text-xs transition-all hover:bg-[var(--bg3)] hover:text-[var(--text)]"
          >
            <span>Light mode</span>
            <div className={cn(
              "w-8 h-[18px] rounded-full relative border border-[var(--border2)] transition-colors",
              theme === 'light' ? "bg-[var(--accent)]" : "bg-[var(--bg4)]"
            )}>
              <div className={cn(
                "w-3 h-3 bg-[var(--text)] rounded-full absolute top-0.5 left-0.5 transition-transform",
                theme === 'light' && "translate-x-3.5"
              )} />
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}
