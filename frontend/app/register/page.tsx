'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/shell/auth-context'
import { KeyRound, Mail, User, AlertTriangle } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'fleet_manager', label: 'Fleet Manager' },
  { value: 'dispatcher', label: 'Driver / Dispatcher' },
  { value: 'safety_officer', label: 'Safety Officer' },
  { value: 'financial_analyst', label: 'Financial Analyst' },
]

export default function RegisterPage() {
  const { register, error, clearError } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('dispatcher')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!name || !email || !role || !password) {
      setLocalError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long')
      return
    }

    setIsSubmitting(true)
    try {
      await register(name, email, role, password)
    } catch (err: any) {
      // Error is handled and displayed by auth context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 select-none grain">
      <div className="w-full max-w-md space-y-8 border border-border bg-card p-8">
        <div className="text-center">
          <span className="font-display text-3xl tracking-tight uppercase">
            REDLINE<span className="text-primary">.</span>
          </span>
          <p className="mt-2 font-mono text-[9px] tracking-[0.35em] text-muted-foreground uppercase">
            OPERATOR REGISTRATION
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {(error || localError) && (
            <div className="flex items-center gap-3 border border-primary/50 bg-primary/10 p-4 text-xs font-mono uppercase text-primary">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User className="size-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border bg-background py-2.5 pl-10 pr-4 font-mono text-sm tracking-wide text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="size-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-background py-2.5 pl-10 pr-4 font-mono text-sm tracking-wide text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
                Assigned Console Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-border bg-background py-2.5 px-3 font-mono text-sm tracking-wide text-foreground focus:border-primary/50 focus:outline-none uppercase"
                required
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
                Console Passphrase
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <KeyRound className="size-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border bg-background py-2.5 pl-10 pr-4 font-mono text-sm tracking-wide text-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="•••••••• (Min 8 chars)"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-primary bg-primary/15 hover:bg-primary/25 active:bg-primary/35 py-3 font-mono text-xs tracking-widest text-primary hover:text-primary uppercase transition-all duration-150 disabled:opacity-50"
            >
              {isSubmitting ? 'CREATING PROFILE...' : 'INITIALIZE ACCOUNT'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-border/40">
          <p className="font-mono text-[10px] text-muted-foreground">
            Already registered?{' '}
            <Link href="/login" className="text-primary hover:underline">
              LOGIN HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
