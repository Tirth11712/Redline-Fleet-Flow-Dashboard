'use client'

import { useState, useEffect } from 'react'
import { useFleetData } from '../shell/data-context'
import { useAuth } from '../shell/auth-context'
import { X, Calendar, Key, Shield, Info, Truck } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Vehicle } from '@/lib/data'

interface VehicleFormModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleToEdit?: Vehicle | null
}

const VEHICLE_TYPES = ['truck', 'van', 'car', 'bus', 'motorcycle', 'trailer']
const FUEL_TYPES = ['diesel', 'petrol', 'electric', 'hybrid', 'cng']

export function VehicleFormModal({ isOpen, onClose, vehicleToEdit }: VehicleFormModalProps) {
  const { token } = useAuth()
  const { refetch } = useFleetData()
  
  const [licensePlate, setLicensePlate] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [type, setType] = useState('truck')
  const [capacityKg, setCapacityKg] = useState('')
  const [fuelType, setFuelType] = useState('diesel')
  const [odometer, setOdometer] = useState('0')
  const [vin, setVin] = useState('')
  const [insuranceExpiry, setInsuranceExpiry] = useState('')
  const [registrationExpiry, setRegistrationExpiry] = useState('')
  const [notes, setNotes] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (vehicleToEdit) {
      // Mapping from response properties back to form state fields
      setLicensePlate(vehicleToEdit.reg)
      // Parse name into make and model if possible (e.g. "Volvo FH16")
      const nameParts = vehicleToEdit.name.split(' ')
      setMake(nameParts[0] || '')
      setModel(nameParts.slice(1).join(' ') || '')
      setYear('2024') // Default fallback since response might not have it
      setType(vehicleToEdit.type.toLowerCase())
      setCapacityKg(vehicleToEdit.capacityKg.toString())
      setFuelType('diesel') // Default fallback
      setOdometer(vehicleToEdit.odometerKm.toString())
      setVin('')
      setInsuranceExpiry('')
      setRegistrationExpiry('')
      setNotes('')
    } else {
      // Clear form
      setLicensePlate('')
      setMake('')
      setModel('')
      setYear(new Date().getFullYear().toString())
      setType('truck')
      setCapacityKg('')
      setFuelType('diesel')
      setOdometer('0')
      setVin('')
      setInsuranceExpiry('')
      setRegistrationExpiry('')
      setNotes('')
    }
  }, [vehicleToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload = {
      license_plate: licensePlate,
      make,
      model,
      year: parseInt(year),
      type,
      capacity_kg: parseFloat(capacityKg),
      fuel_type: fuelType,
      odometer: parseFloat(odometer),
      vin,
      insurance_expiry: insuranceExpiry || null,
      registration_expiry: registrationExpiry || null,
      notes,
    }

    try {
      const url = vehicleToEdit
        ? `vehicles/${vehicleToEdit.id}`
        : 'vehicles'

      const method = vehicleToEdit ? 'PUT' : 'POST'

      const res = await apiRequest(url, token, {
        method,
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorDetails = data.data ? Object.values(data.data).flat().join(' | ') : ''
        throw new Error(errorDetails ? `${data.message}: ${errorDetails}` : data.message || 'Failed to save vehicle')
      }

      refetch()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg border border-border bg-card p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </button>

        <h2 className="font-display text-2xl uppercase tracking-tight mb-6">
          {vehicleToEdit ? 'EDIT VEHICLE' : 'REGISTER NEW VEHICLE'}<span className="text-primary">.</span>
        </h2>

        {error && (
          <div className="mb-4 border border-primary/50 bg-primary/10 p-3 font-mono text-[10px] uppercase text-primary">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Registration Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                placeholder="e.g. FL-1001"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Vehicle Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                required
              >
                {VEHICLE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Make</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                placeholder="e.g. Volvo"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                placeholder="e.g. FH16"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                placeholder="Year"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Load Capacity (KG)</label>
              <input
                type="number"
                value={capacityKg}
                onChange={(e) => setCapacityKg(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                placeholder="Capacity KG"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                required
              >
                {FUEL_TYPES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Odometer (KM)</label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                placeholder="Odometer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">VIN Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="VIN"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Registration Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={registrationExpiry}
                  onChange={(e) => setRegistrationExpiry(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Insurance Expiry</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">General Notes</label>
              <div className="relative">
                <Info className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="Optional details..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-primary bg-primary/10 hover:bg-primary/20 py-2.5 font-mono text-xs tracking-widest text-primary uppercase transition-all duration-150"
            >
              {isSubmitting ? 'SAVING...' : 'SAVE ASSET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
