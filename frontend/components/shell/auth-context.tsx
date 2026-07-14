'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { API_BASE } from '@/lib/api'

export interface UserProfile {
  id: string | number
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  role: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, role: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Hydrate state from localStorage
    const savedToken = localStorage.getItem('transit_token')
    const savedUser = localStorage.getItem('transit_user')

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserProfile
        setToken(savedToken)
        setUser(parsedUser)
        setRole(parsedUser.role)
      } catch (e) {
        localStorage.removeItem('transit_token')
        localStorage.removeItem('transit_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Gating redirect logic in useEffect
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/login', '/register']
      const isPublicPath = publicPaths.includes(pathname)
      const hasToken = !!token

      if (!hasToken && !isPublicPath) {
        router.push('/login')
      } else if (hasToken && isPublicPath) {
        router.push('/')
      }
    }
  }, [token, pathname, isLoading, router])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorDetails = data.data ? Object.values(data.data).flat().join(' | ') : ''
        throw new Error(errorDetails ? `${data.message}: ${errorDetails}` : data.message || 'Login failed')
      }

      const accessToken = data.data.access_token
      const userProfile = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
      }

      localStorage.setItem('transit_token', accessToken)
      localStorage.setItem('transit_user', JSON.stringify(userProfile))
      sessionStorage.setItem('fleetflow_token', accessToken)

      setToken(accessToken)
      setUser(userProfile)
      setRole(userProfile.role)
      
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Network error, please try again')
      throw err
    }
  }

  const registerUser = async (name: string, email: string, roleSlug: string, password: string) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role: roleSlug,
          password,
          password_confirmation: password, // auto-confirm since it's a simple form
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorDetails = data.data ? Object.values(data.data).flat().join(' | ') : ''
        throw new Error(errorDetails ? `${data.message}: ${errorDetails}` : data.message || 'Registration failed')
      }

      const accessToken = data.data.access_token
      const userProfile = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
      }

      localStorage.setItem('transit_token', accessToken)
      localStorage.setItem('transit_user', JSON.stringify(userProfile))
      sessionStorage.setItem('fleetflow_token', accessToken)

      setToken(accessToken)
      setUser(userProfile)
      setRole(userProfile.role)

      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('transit_token')
    localStorage.removeItem('transit_user')
    sessionStorage.removeItem('fleetflow_token')
    setToken(null)
    setUser(null)
    setRole(null)
    router.push('/login')
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        login,
        register: registerUser,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
