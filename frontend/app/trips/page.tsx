'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Package, MapPin, Ban } from 'lucide-react'
import { PageHeader, Reveal, StatusBadge, SectionLabel } from '@/components/ui-blocks'
import { useFleetData } from '@/components/shell/data-context'
import { useAuth } from '@/components/shell/auth-context'
import { useRole } from '@/components/shell/role-context'
import { TripFormModal } from '@/components/trips/trip-form-modal'
import { apiRequest } from '@/lib/api'
import { getVehicle, getDriver, formatINR, type TripStatus } from '@/lib/data'
import { cn } from '@/lib/utils'

const LIFECYCLE: TripStatus[] = ['Draft', 'Dispatched', 'Completed', 'Cancelled']

function LifecycleRail({ status }: { status: TripStatus }) {
  const activeIdx = LIFECYCLE.indexOf(status)
  const cancelled = status === 'Cancelled'
  return (
    <div className="flex items-center gap-1" aria-label={`Trip status: ${status}`}>
      {LIFECYCLE.slice(0, 3).map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <span
            className={cn(
              'size-2 rounded-full',
              cancelled
                ? 'bg-muted'
                : i <= activeIdx
                  ? i === activeIdx
                    ? 'bg-primary animate-pulse-dot'
                    : 'bg-success'
                  : 'bg-muted',
            )}
          />
          {i < 2 && <span className={cn('h-px w-5', !cancelled && i < activeIdx ? 'bg-success' : 'bg-muted')} />}
        </div>
      ))}
      {cancelled && <Ban className="ml-1 size-3.5 text-warning" />}
    </div>
  )
}

export default function TripsPage() {
  const { trips, vehicles, drivers, refetch } = useFleetData()
  const { token } = useAuth()
  const { role } = useRole()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<TripStatus | 'All'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = trips.filter((t) => status === 'All' || t.status === status)

  const availableVehicles = vehicles.filter((v) => v.status === 'Available')
  const eligibleDrivers = drivers.filter(
    (d) => d.status === 'On Duty' && new Date(d.licenseExpiry) > new Date(),
  )

  const canCreateTrips = role === 'Fleet Manager' || role === 'Driver'
  const canManageStatus = role === 'Fleet Manager' || role === 'Driver'

  const handleUpdateStatus = async (tripId: string | number, newStatus: string) => {
    try {
      const res = await apiRequest(`trips/${tripId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Status transition failed')
      }
      refetch()
    } catch (err: any) {
      alert(err.message || 'Error updating status')
    }
  }

  return (
    <div>
      <PageHeader
        index="04"
        title="Trip Engine"
        tags={['Lifecycle', 'Business Rules', `${trips.length} Trips`]}
        description="Draft to Dispatched to Completed — every transition validated. Vehicles and drivers flip status automatically on dispatch and completion."
      />

      {/* Rules banner */}
      <div className="grid grid-cols-1 gap-px border-b border-border bg-border sm:grid-cols-3">
        {[
          { label: 'Dispatch-ready vehicles', value: availableVehicles.length, note: 'In Shop & Retired excluded' },
          { label: 'Eligible drivers', value: eligibleDrivers.length, note: 'Valid license, not suspended' },
          { label: 'Rules enforced', value: 10, note: 'Server-side validation' },
        ].map((item) => (
          <div key={item.label} className="flex items-baseline gap-3 bg-background px-4 py-4 md:px-8">
            <span className="font-display text-3xl text-primary">{item.value}</span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase">{item.label}</p>
              <p className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">{item.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Add button */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border px-4 py-4 md:px-8">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter trips">
          {(['All', ...LIFECYCLE] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'border px-3 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors',
                status === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {canCreateTrips && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-primary bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 font-mono text-xs tracking-widest uppercase transition-colors"
          >
            + New Trip
          </button>
        )}
      </div>

      <section className="flex flex-col gap-4 px-4 py-8 md:px-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((t) => {
            const v = getVehicle(t.vehicleId, vehicles)
            const d = getDriver(t.driverId, drivers)
            const overCapacity = v && t.cargoKg > v.capacityKg
            return (
              <motion.article
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <span className="font-mono text-xs tracking-widest text-primary">{t.ref}</span>
                  <div className="flex items-center gap-2 font-display text-lg tracking-tight uppercase">
                    <MapPin className="size-4 text-muted-foreground" />
                    {t.origin}
                    <ArrowRight className="size-4 text-primary" />
                    {t.destination}
                  </div>
                  <LifecycleRail status={t.status} />
                  <span className="ml-auto"><StatusBadge status={t.status} /></span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
                  <span>VEH {v?.reg} — {v?.name}</span>
                  <span>DRV {d?.name}</span>
                  <span className={cn('flex items-center gap-1.5', overCapacity && 'text-primary')}>
                    <Package className="size-3.5" />
                    {(t.cargoKg / 1000).toFixed(1)}t / {v ? (v.capacityKg / 1000).toFixed(1) : '—'}t max
                  </span>
                  <span>{t.distanceKm} KM</span>
                  <span>{t.date}</span>
                  {t.revenue > 0 && <span className="text-foreground">{formatINR(t.revenue)}</span>}

                  {/* Status Transition Controls */}
                  {canManageStatus && (
                    <div className="ml-auto flex gap-2">
                      {t.status === 'Draft' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'Dispatched')}
                          className="border border-success/50 hover:bg-success/15 text-success px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors"
                        >
                          Dispatch
                        </button>
                      )}
                      {t.status === 'Dispatched' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'Completed')}
                            className="border border-success/50 hover:bg-success/15 text-success px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'Cancelled')}
                            className="border border-primary/50 hover:bg-primary/15 text-primary px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <Reveal className="border border-dashed border-border p-10 text-center">
            <SectionLabel>Empty queue</SectionLabel>
            <p className="text-sm text-muted-foreground">No trips with this status.</p>
          </Reveal>
        )}
      </section>

      <TripFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
