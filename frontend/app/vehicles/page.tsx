'use client'

import { useMemo, useState } from 'react'
import { Search, Download, Gauge, Edit2, Trash2 } from 'lucide-react'
import { PageHeader, Reveal, StatusBadge, SectionLabel } from '@/components/ui-blocks'
import { csvDownload, type VehicleStatus, type Vehicle } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'
import { useAuth } from '@/components/shell/auth-context'
import { useRole } from '@/components/shell/role-context'
import { VehicleFormModal } from '@/components/vehicles/vehicle-form-modal'
import { apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUSES: (VehicleStatus | 'All')[] = ['All', 'Available', 'On Trip', 'In Shop', 'Retired']

export default function VehiclesPage() {
  const { vehicles, refetch } = useFleetData()
  const { token } = useAuth()
  const { role } = useRole()
  
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<VehicleStatus | 'All'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null)

  const isManager = role === 'Fleet Manager'

  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (status === 'All' || v.status === status) &&
          (v.name.toLowerCase().includes(query.toLowerCase()) ||
            v.reg.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, status, vehicles],
  )

  const exportCsv = () =>
    csvDownload('vehicles.csv', [
      ['Registration', 'Name', 'Type', 'Capacity (kg)', 'Odometer (km)', 'Cost', 'Status', 'Region'],
      ...filtered.map((v) => [v.reg, v.name, v.type, v.capacityKg, v.odometerKm, v.acquisitionCost, v.status, v.region]),
    ])

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    try {
      const res = await apiRequest(`vehicles/${id}`, token, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete vehicle')
      }
      refetch()
    } catch (err: any) {
      alert(err.message || 'Error deleting vehicle')
    }
  }

  const handleEdit = (v: Vehicle) => {
    setVehicleToEdit(v)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setVehicleToEdit(null)
    setIsModalOpen(true)
  }

  return (
    <div>
      <PageHeader
        index="02"
        title="Vehicle Registry"
        tags={['Fleet Assets', `${vehicles.length} Units`, 'CRUD']}
        description="Every unit in the fleet with capacity, odometer, and lifecycle status. Retired and in-shop vehicles are automatically excluded from dispatch."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <div className="flex items-center gap-2 border border-input bg-secondary px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH REG / MODEL"
            className="w-44 bg-transparent font-mono text-xs tracking-wider placeholder:text-muted-foreground/50 focus:outline-none"
            aria-label="Search vehicles"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
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
        
        <div className="ml-auto flex gap-2">
          {isManager && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 border border-primary bg-primary/10 px-3 py-2 font-mono text-[10px] tracking-widest text-primary uppercase transition-colors hover:bg-primary/20"
            >
              + Add Vehicle
            </button>
          )}
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Download className="size-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Vehicle cards */}
      <section className="grid grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 md:px-8 xl:grid-cols-3">
        {filtered.map((v, i) => (
          <Reveal key={v.id} delay={Math.min(i * 0.05, 0.3)}>
            <article className="group relative overflow-hidden border border-border bg-card p-5 transition-colors hover:border-primary/50">
              <div className="absolute top-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-primary">{v.reg}</p>
                  <h2 className="mt-1 font-display text-xl tracking-tight uppercase">{v.name}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={v.status} />
                  {isManager && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(v)} 
                        className="p-1 hover:text-primary text-muted-foreground transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(v.id)} 
                        className="p-1 hover:text-primary text-muted-foreground transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
                <div>
                  <dt className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Capacity</dt>
                  <dd className="mt-1 font-mono text-sm">{(v.capacityKg / 1000).toFixed(1)}t</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Odometer</dt>
                  <dd className="mt-1 flex items-center gap-1 font-mono text-sm">
                    <Gauge className="size-3 text-muted-foreground" />
                    {(v.odometerKm / 1000).toFixed(0)}k
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Region</dt>
                  <dd className="mt-1 font-mono text-sm">{v.region}</dd>
                </div>
              </dl>
            </article>
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full border border-dashed border-border p-10 text-center">
            <SectionLabel>No matches</SectionLabel>
            <p className="text-sm text-muted-foreground">No vehicles match the current filter.</p>
          </div>
        )}
      </section>

      <VehicleFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setVehicleToEdit(null)
        }} 
        vehicleToEdit={vehicleToEdit} 
      />
    </div>
  )
}
