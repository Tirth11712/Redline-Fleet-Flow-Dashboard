'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  Truck,
  Users,
  Route,
  Wrench,
  Receipt,
  BarChart3,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { RoleProvider, useRole } from './role-context'
import { Intro } from './intro'
import { useFleetData } from './data-context'
import { useAuth } from './auth-context'
import { ROLES, type Role } from '@/lib/data'
import { cn } from '@/lib/utils'

const NAV = [
  { num: '01', label: 'Dashboard', href: '/', icon: LayoutGrid, roles: ROLES },
  { num: '02', label: 'Vehicles', href: '/vehicles', icon: Truck, roles: ['Fleet Manager', 'Driver', 'Safety Officer'] as Role[] },
  { num: '03', label: 'Drivers', href: '/drivers', icon: Users, roles: ['Fleet Manager', 'Safety Officer'] as Role[] },
  { num: '04', label: 'Trips', href: '/trips', icon: Route, roles: ['Fleet Manager', 'Driver', 'Safety Officer'] as Role[] },
  { num: '05', label: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['Fleet Manager'] as Role[] },
  { num: '06', label: 'Expenses', href: '/expenses', icon: Receipt, roles: ['Fleet Manager', 'Financial Analyst'] as Role[] },
  { num: '07', label: 'Reports', href: '/reports', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst'] as Role[] },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { role } = useRole()

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
          <Link href="/" className="group">
            <span className="font-display text-xl tracking-tight text-sidebar-foreground">
              REDLINE<span className="text-primary">.</span>
            </span>
            <p className="font-mono text-[9px] tracking-[0.35em] text-muted-foreground">
              FLEET CONSOLE
            </p>
          </Link>
          <button onClick={onClose} className="text-muted-foreground lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
          {NAV.map((item) => {
            const active = pathname === item.href
            const allowed = item.roles.includes(role)
            return (
              <Link
                key={item.href}
                href={allowed ? item.href : '#'}
                onClick={onClose}
                aria-disabled={!allowed}
                tabIndex={allowed ? 0 : -1}
                className={cn(
                  'group relative flex items-center gap-3 px-5 py-3 font-mono text-xs tracking-widest uppercase transition-colors',
                  active
                    ? 'text-sidebar-foreground'
                    : allowed
                      ? 'text-muted-foreground hover:text-sidebar-foreground'
                      : 'pointer-events-none text-muted-foreground/30',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-y-1 left-0 w-full bg-sidebar-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                {active && <span className="absolute inset-y-1 left-0 z-10 w-0.75 bg-primary" />}
                <span className={cn('relative z-10 text-[9px]', active ? 'text-primary' : 'text-muted-foreground/60')}>
                  {item.num}
                </span>
                <item.icon className="relative z-10 size-4" />
                <span className="relative z-10">{item.label}</span>
                {!allowed && <span className="relative z-10 ml-auto text-[8px]">LOCKED</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-5">
          <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
            <span className="mr-2 inline-block size-1.5 animate-pulse-dot rounded-full bg-success align-middle" />
            SYSTEM NOMINAL
          </p>
          <p className="mt-1 font-mono text-[9px] tracking-[0.3em] text-muted-foreground/50">
            V1.0 / HACKATHON BUILD
          </p>
        </div>
      </aside>
    </>
  )
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { role } = useRole()
  const { user, logout } = useAuth()
  
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
      <button onClick={onMenu} className="text-muted-foreground lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>
      <p className="hidden font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase sm:block">
        Operator: <span className="text-foreground">{user?.name || 'Loading...'}</span> ({user?.role?.replace('_', ' ')})
      </p>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Access Level: <span className="text-primary font-bold">{role}</span>
          </span>
        </div>
        <button
          onClick={logout}
          className="border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
function DataLoadingBar() {
  const { isLoading, error } = useFleetData()
  if (!isLoading && !error) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-0.5">
      {isLoading && (
        <div className="h-full bg-primary animate-[loading-bar_1.8s_ease-in-out_infinite]" style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--color-primary), transparent)', backgroundSize: '200% 100%' }} />
      )}
      {error && <div className="h-full bg-destructive" />}
    </div>
  )
}


export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  
  if (pathname === '/login' || pathname === '/register') {
    return (
      <>
        <Intro />
        <main>{children}</main>
      </>
    )
  }

  return (
    <RoleProvider>
      <DataLoadingBar />
      <Intro />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-svh flex-col lg:pl-60">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </RoleProvider>
  )
}
