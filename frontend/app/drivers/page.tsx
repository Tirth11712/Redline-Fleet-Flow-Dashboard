'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ShieldAlert, Edit2, Trash2 } from 'lucide-react'
import { PageHeader, Reveal, StatusBadge } from '@/components/ui-blocks'
import { csvDownload, type DriverStatus, type Driver } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'
import { useAuth } from '@/components/shell/auth-context'
import { useRole } from '@/components/shell/role-context'
import { DriverFormModal } from '@/components/drivers/driver-form-modal'
import { apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-success' : score >= 70 ? 'bg-warning' : 'bg-primary'
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-24 overflow-hidden bg-muted">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full', color)}
        />
      </div>
      <span className="font-mono text-xs">{score}</span>
    </div>
  )
}

export default function DriversPage() {
  const { drivers, refetch } = useFleetData()
  const { token } = useAuth()
  const { role } = useRole()
  
  const [sortBy, setSortBy] = useState<'name' | 'safetyScore' | 'tripsCompleted'>('safetyScore')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null)

  const isManager = role === 'Fleet Manager'

  const sorted = [...drivers].sort((a, b) =>
    sortBy === 'name' ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy],
  )

  const exportCsv = () =>
    csvDownload('drivers.csv', [
      ['Name', 'License No', 'License Expiry', 'Safety Score', 'Status', 'Trips', 'Region'],
      ...sorted.map((d) => [d.name, d.licenseNo, d.licenseExpiry, d.safetyScore, d.status, d.tripsCompleted, d.region]),
    ])

  const expiringSoon = (expiry: string) => new Date(expiry) < new Date('2026-09-01')

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this driver?')) return
    try {
      const res = await apiRequest(`drivers/${id}`, token, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete driver')
      }
      refetch()
    } catch (err: any) {
      alert(err.message || 'Error deleting driver')
    }
  }

  const handleEdit = (d: Driver) => {
    setDriverToEdit(d)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setDriverToEdit(null)
    setIsModalOpen(true)
  }

  return (
    <div>
      <PageHeader
        index="03"
        title="Driver Roster"
        tags={['Compliance', `${drivers.length} Drivers`, 'License Tracking']}
        description="License validity, safety scores, and duty status. Suspended drivers and expired licenses are structurally blocked from trip assignment."
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 md:px-8">
        <label htmlFor="sort" className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Sort by
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="border border-input bg-secondary px-3 py-2 font-mono text-xs tracking-wider uppercase focus:outline-2 focus:outline-ring"
        >
          <option value="safetyScore">Safety Score</option>
          <option value="tripsCompleted">Trips Completed</option>
          <option value="name">Name</option>
        </select>
        
        <div className="ml-auto flex gap-2">
          {isManager && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 border border-primary bg-primary/10 px-3 py-2 font-mono text-[10px] tracking-widest text-primary uppercase transition-colors hover:bg-primary/20"
            >
              + Add Driver
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

      <section className="px-4 py-8 md:px-8">
        <Reveal className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-border">
                {['Driver', 'License', 'Expiry', 'Safety Score', 'Trips', 'Status', isManager ? 'Actions' : ''].filter(Boolean).map((h) => (
                  <th key={h} className="px-5 py-3 font-mono text-[10px] font-normal tracking-[0.25em] text-muted-foreground uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-accent/40 group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{d.region} region</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{d.licenseNo}</td>
                  <td className="px-5 py-4">
                    <span className={cn('flex items-center gap-1.5 font-mono text-xs', expiringSoon(d.licenseExpiry) ? 'text-warning' : 'text-muted-foreground')}>
                      {expiringSoon(d.licenseExpiry) && <ShieldAlert className="size-3.5" />}
                      {d.licenseExpiry}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ScoreBar score={d.safetyScore} />
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">{d.tripsCompleted}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  {isManager && (
                    <td className="px-5 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(d)}
                          className="p-1 hover:text-primary text-muted-foreground transition-colors"
                          title="Edit Driver"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(d.id)}
                          className="p-1 hover:text-primary text-muted-foreground transition-colors"
                          title="Delete Driver"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <DriverFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setDriverToEdit(null)
        }} 
        driverToEdit={driverToEdit} 
      />
    </div>
  )
}
