'use client'

import { useState } from 'react'
import { useFleetData } from '../shell/data-context'
import { useAuth } from '../shell/auth-context'
import { X, Calendar, MapPin, Truck, User, IndianRupee, Scale, Milestone } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface TripFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TripFormModal({ isOpen, onClose }: TripFormModalProps) {
  const { vehicles, drivers, refetch } = useFleetData()
  const { token } = useAuth()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [cargoKg, setCargoKg] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [revenue, setRevenue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Filter available assets — show all non-suspended drivers with a valid license
  // Off Duty drivers CAN be assigned trips (they'll be set to On Trip on dispatch)
  const availableVehicles = vehicles.filter(v => v.status === 'Available')
  const eligibleDrivers = drivers.filter(d => {
    const notSuspended = d.status !== 'Suspended' && d.status !== 'On Trip'
    const licenseNotExpired = d.licenseExpiry ? new Date(d.licenseExpiry) > new Date() : true
    return notSuspended && licenseNotExpired
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Form validations
    if (!origin || !destination || !vehicleId || !driverId) {
      setError('Origin, Destination, Vehicle, and Driver are required.')
      setIsSubmitting(false)
      return
    }

    const selectedVehicle = vehicles.find(v => v.id.toString() === vehicleId.toString())
    if (selectedVehicle && cargoKg && parseFloat(cargoKg) > selectedVehicle.capacityKg) {
      setError(`Cargo weight (${cargoKg} kg) exceeds vehicle load capacity (${selectedVehicle.capacityKg} kg).`)
      setIsSubmitting(false)
      return
    }

    try {
      const res = await apiRequest('trips', token, {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: vehicleId,
          driver_id: driverId,
          origin,
          destination,
          distance_km: distanceKm ? parseFloat(distanceKm) : 0,
          cargo_kg: cargoKg ? parseFloat(cargoKg) : 0,
          date,
          revenue: revenue ? parseFloat(revenue) : 0,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorDetails = data.data ? Object.values(data.data).flat().join(' | ') : ''
        throw new Error(errorDetails ? `${data.message}: ${errorDetails}` : data.message || 'Failed to dispatch trip')
      }

      refetch()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.')
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
          CREATE NEW TRIP<span className="text-primary">.</span>
        </h2>

        {error && (
          <div className="mb-4 border border-primary/50 bg-primary/10 p-3 font-mono text-[10px] uppercase text-primary">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Origin</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="e.g. Berlin, DE"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="e.g. Paris, FR"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Assign Vehicle</label>
              <div className="relative">
                <Truck className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                  required
                >
                  <option value="">Select vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.reg} — {v.name} ({v.capacityKg}kg)</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Assign Driver</label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                  required
                >
                  <option value="">Select driver</option>
                  {eligibleDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (Score: {d.safetyScore})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Cargo Weight (KG)</label>
              <div className="relative">
                <Scale className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="number"
                  value={cargoKg}
                  onChange={(e) => setCargoKg(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="Cargo KG"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Distance (KM)</label>
              <div className="relative">
                <Milestone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="Distance KM"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Expected Revenue (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="Revenue ₹"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Scheduled Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                placeholder="Route notes, instructions..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-primary bg-primary/10 hover:bg-primary/20 py-2.5 font-mono text-xs tracking-widest text-primary uppercase transition-all duration-150"
            >
              {isSubmitting ? 'DISPATCHING...' : 'DISPATCH TRIP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
