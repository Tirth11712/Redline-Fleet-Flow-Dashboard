'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '@/lib/data'
import { API_BASE } from '@/lib/api'

interface FleetDataContextType {
  vehicles: Vehicle[]
  drivers: Driver[]
  trips: Trip[]
  maintenanceLogs: MaintenanceLog[]
  fuelLogs: FuelLog[]
  expenses: Expense[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const defaultContext: FleetDataContextType = {
  vehicles: [],
  drivers: [],
  trips: [],
  maintenanceLogs: [],
  fuelLogs: [],
  expenses: [],
  isLoading: false,
  error: null,
  refetch: () => {},
}

const FleetDataContext = createContext<FleetDataContextType>(defaultContext)

export function useFleetData() {
  return useContext(FleetDataContext)
}

const API = API_BASE

async function apiFetch(path: string, token: string) {
  const res = await fetch(`${API}/${path}?per_page=200`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    throw new Error('Authentication failed')
  }
  if (!res.ok) {
    console.warn(`API ${path} returned ${res.status}`)
    return { data: [] }
  }
  return res.json()
}

import { useAuth } from './auth-context'

export function FleetDataProvider({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth()
  const [data, setData] = useState<Omit<FleetDataContextType, 'isLoading' | 'error' | 'refetch'>>({
    vehicles: [],
    drivers: [],
    trips: [],
    maintenanceLogs: [],
    fuelLogs: [],
    expenses: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = () => setTick((n) => n + 1)

  useEffect(() => {
    if (!token) {
      setData({
        vehicles: [],
        drivers: [],
        trips: [],
        maintenanceLogs: [],
        fuelLogs: [],
        expenses: [],
      })
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function fetchAllData() {
      setIsLoading(true)
      setError(null)
      try {
        const [
          vehiclesJson,
          driversJson,
          tripsJson,
          maintenanceJson,
          fuelJson,
          expensesJson,
        ] = await Promise.all([
          apiFetch('vehicles', token),
          apiFetch('drivers', token),
          apiFetch('trips', token),
          apiFetch('maintenance', token),
          apiFetch('fuel-logs', token),
          apiFetch('expenses', token),
        ])

        if (isMounted) {
          setData({
            vehicles: vehiclesJson.data ?? [],
            drivers: driversJson.data ?? [],
            trips: tripsJson.data ?? [],
            maintenanceLogs: maintenanceJson.data ?? [],
            fuelLogs: fuelJson.data ?? [],
            expenses: expensesJson.data ?? [],
          })
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Fleet data fetch error:', err)
          // If token was invalid/expired
          if (err.message?.includes('Authentication') || err.status === 401) {
            logout()
          } else {
            setError(err.message ?? 'Failed to load fleet data')
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchAllData()
    return () => { isMounted = false }
  }, [token, tick, logout])

  return (
    <FleetDataContext.Provider value={{ ...data, isLoading, error, refetch }}>
      {children}
    </FleetDataContext.Provider>
  )
}
