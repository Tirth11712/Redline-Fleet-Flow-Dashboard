export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired'
export type DriverStatus = 'On Duty' | 'On Trip' | 'Off Duty' | 'Suspended'
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'
export type Role = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst'

export const ROLES: Role[] = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']

export interface Vehicle {
  id: string
  reg: string
  name: string
  type: 'Truck' | 'Van' | 'Trailer' | 'Bus'
  capacityKg: number
  odometerKm: number
  acquisitionCost: number
  status: VehicleStatus
  region: string
}

export interface Driver {
  id: string
  name: string
  licenseNo: string
  licenseExpiry: string
  safetyScore: number
  status: DriverStatus
  tripsCompleted: number
  region: string
}

export interface Trip {
  id: string
  ref: string
  vehicleId: string
  driverId: string
  origin: string
  destination: string
  cargoKg: number
  distanceKm: number
  status: TripStatus
  date: string
  revenue: number
}

export interface MaintenanceLog {
  id: string
  vehicleId: string
  type: string
  description: string
  cost: number
  openedAt: string
  closedAt: string | null
  status: 'Open' | 'Closed'
}

export interface FuelLog {
  id: string
  vehicleId: string
  liters: number
  cost: number
  date: string
  odometerKm: number
}

export interface Expense {
  id: string
  vehicleId: string
  category: 'Fuel' | 'Toll' | 'Insurance' | 'Repair' | 'Permit'
  amount: number
  date: string
  note: string
}



// ---- Derived helpers ----

export const getVehicle = (id: string, vehicles: Vehicle[]) => vehicles.find((v) => v.id === id)
export const getDriver = (id: string, drivers: Driver[]) => drivers.find((d) => d.id === id)

export function getFleetKpis(vehicles: Vehicle[], trips: Trip[], drivers: Driver[]) {
  const active = vehicles.filter((v) => v.status === 'On Trip').length
  const available = vehicles.filter((v) => v.status === 'Available').length
  const inShop = vehicles.filter((v) => v.status === 'In Shop').length
  const retired = vehicles.filter((v) => v.status === 'Retired').length
  const operational = vehicles.length - retired
  const utilization = operational > 0 ? Math.round((active / operational) * 100) : 0
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length
  const draftTrips = trips.filter((t) => t.status === 'Draft').length
  const onDuty = drivers.filter((d) => d.status === 'On Duty' || d.status === 'On Trip').length
  const licenseAlerts = drivers.filter((d) => new Date(d.licenseExpiry) < new Date('2026-09-01')).length
  return { active, available, inShop, retired, utilization, activeTrips, draftTrips, onDuty, licenseAlerts, operational }
}

export function getTripsPerDay(trips: Trip[]) {
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  return last14Days.map((dateStr) => {
    const count = trips.filter((t) => t.date && t.date.startsWith(dateStr)).length
    const parts = dateStr.split('-')
    const dayLabel = parts.length > 2 ? `${parts[1]}-${parts[2]}` : dateStr
    return { day: dayLabel, trips: count }
  })
}

export function getCostPerWeek(expenses: Expense[]) {
  const weeks = Array.from({ length: 5 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }).reverse()

  return weeks.map((w, idx) => {
    const start = new Date(w)
    start.setHours(0, 0, 0, 0)
    const end = new Date(w)
    end.setDate(end.getDate() + 7)
    end.setHours(23, 59, 59, 999)

    const wExpenses = expenses.filter((e) => {
      const eDate = new Date(e.date)
      return eDate >= start && eDate <= end
    })

    const fuel = wExpenses.filter((e) => e.category === 'Fuel').reduce((s, e) => s + e.amount, 0)
    const maintenance = wExpenses.filter((e) => e.category === 'Repair').reduce((s, e) => s + e.amount, 0)
    const other = wExpenses.filter((e) => e.category !== 'Fuel' && e.category !== 'Repair').reduce((s, e) => s + e.amount, 0)

    return {
      week: `W${23 + idx}`,
      fuel,
      maintenance,
      other,
    }
  })
}

export function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Format a number as Indian Rupees — e.g. 12,34,567 → ₹12,34,567 */
export function formatINR(value: number): string {
  return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
