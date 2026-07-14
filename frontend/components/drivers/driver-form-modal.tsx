'use client'

import { useState, useEffect } from 'react'
import { useFleetData } from '../shell/data-context'
import { useAuth } from '../shell/auth-context'
import { X, Calendar, User, Mail, Phone, Shield, ShieldAlert, FileText } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Driver } from '@/lib/data'

interface DriverFormModalProps {
  isOpen: boolean
  onClose: () => void
  driverToEdit?: Driver | null
}

const DRIVER_STATUSES = ['On Duty', 'On Trip', 'Off Duty', 'Suspended']

export function DriverFormModal({ isOpen, onClose, driverToEdit }: DriverFormModalProps) {
  const { token } = useAuth()
  const { refetch } = useFleetData()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseExpiry, setLicenseExpiry] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('Off Duty')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (driverToEdit) {
      setName(driverToEdit.name)
      setEmail('') // Not exposed on edit typically, backend uses relation update if needed
      setLicenseNumber(driverToEdit.licenseNo)
      setLicenseExpiry(driverToEdit.licenseExpiry)
      setPhone('') // Default fallback
      setStatus(driverToEdit.status)
      setNotes('')
    } else {
      setName('')
      setEmail('')
      setLicenseNumber('')
      setLicenseExpiry('')
      setPhone('')
      setStatus('Off Duty')
      setNotes('')
    }
  }, [driverToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload: Record<string, any> = {
      license_number: licenseNumber,
      license_expiry: licenseExpiry,
      phone,
      notes,
    }

    if (driverToEdit) {
      payload.status = status
    } else {
      payload.name = name
      payload.email = email
    }

    try {
      const url = driverToEdit
        ? `drivers/${driverToEdit.id}`
        : 'drivers'

      const method = driverToEdit ? 'PUT' : 'POST'

      const res = await apiRequest(url, token, {
        method,
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorDetails = data.data ? Object.values(data.data).flat().join(' | ') : ''
        throw new Error(errorDetails ? `${data.message}: ${errorDetails}` : data.message || 'Failed to save driver')
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
          {driverToEdit ? 'EDIT OPERATOR' : 'REGISTER DRIVER PROFILE'}<span className="text-primary">.</span>
        </h2>

        {error && (
          <div className="mb-4 border border-primary/50 bg-primary/10 p-3 font-mono text-[10px] uppercase text-primary">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!driverToEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                    placeholder="e.g. Alex Mendes"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">License Number</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                  placeholder="e.g. CDL-2024-001"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">License Expiry Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="e.g. +49 170 123456"
                  required
                />
              </div>
            </div>
            {driverToEdit ? (
              <div>
                <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">Driver Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-border bg-background py-2 px-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none uppercase"
                  required
                >
                  {DRIVER_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">General Notes</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                    placeholder="Medical dates, certs..."
                  />
                </div>
              </div>
            )}
          </div>

          {driverToEdit && (
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1">General Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-border bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="Medical dates, certs..."
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-primary bg-primary/10 hover:bg-primary/20 py-2.5 font-mono text-xs tracking-widest text-primary uppercase transition-all duration-150"
            >
              {isSubmitting ? 'SAVING...' : 'SAVE PROFILE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
