'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Role } from '@/lib/data'
import { useAuth } from './auth-context'

interface RoleContextValue {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleContextValue>({
  role: 'Fleet Manager',
  setRole: () => {},
})

const mapRole = (slug: string | null): Role => {
  switch (slug) {
    case 'fleet_manager':    return 'Fleet Manager'
    case 'dispatcher':       return 'Driver'
    case 'driver':           return 'Driver'
    case 'safety_officer':   return 'Safety Officer'
    case 'financial_analyst':return 'Financial Analyst'
    default:                 return 'Fleet Manager'
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [role, setRole] = useState<Role>('Fleet Manager')

  useEffect(() => {
    if (user?.role) {
      setRole(mapRole(user.role))
    } else {
      setRole('Fleet Manager')
    }
  }, [user])

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export const useRole = () => useContext(RoleContext)
