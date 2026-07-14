'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Fuel } from 'lucide-react'
import { PageHeader, Reveal, SectionLabel, CountUp } from '@/components/ui-blocks'
import { getVehicle, csvDownload, formatINR, type Expense } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'
import { cn } from '@/lib/utils'

const CATEGORIES: (Expense['category'] | 'All')[] = ['All', 'Fuel', 'Toll', 'Insurance', 'Repair', 'Permit']

export default function ExpensesPage() {
  const { expenses, fuelLogs, vehicles } = useFleetData()
  const [cat, setCat] = useState<Expense['category'] | 'All'>('All')

  const filtered = useMemo(() => expenses.filter((e) => cat === 'All' || e.category === cat), [cat])
  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const fuelTotal = fuelLogs.reduce((s, f) => s + f.cost, 0)
  const litersTotal = fuelLogs.reduce((s, f) => s + f.liters, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount))
    const grand = expenses.reduce((s, e) => s + e.amount, 0)
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, amt]) => ({ name, amt, pct: (amt / grand) * 100 }))
  }, [])

  const exportCsv = () =>
    csvDownload('expenses.csv', [
      ['Date', 'Vehicle', 'Category', 'Amount', 'Note'],
      ...filtered.map((e) => [e.date, getVehicle(e.vehicleId, vehicles)?.reg ?? '', e.category, e.amount, e.note]),
    ])

  return (
    <div>
      <PageHeader
        index="06"
        title="Cost Control"
        tags={['Fuel Logs', 'Roll-Ups', 'Financial']}
        description="Every liter and every rupee logged per vehicle, rolled up automatically into operational cost and ROI calculations."
      />

      {/* Rollups */}
      <div className="grid grid-cols-1 gap-px border-b border-border bg-border sm:grid-cols-3">
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Total logged spend</p>
          <p className="mt-2 font-display text-4xl">₹<CountUp value={expenses.reduce((s, e) => s + e.amount, 0)} /></p>
        </div>
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Fuel spend</p>
          <p className="mt-2 font-display text-4xl">₹<CountUp value={fuelTotal} /></p>
        </div>
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Liters dispensed</p>
          <p className="mt-2 font-display text-4xl"><CountUp value={litersTotal} suffix="L" /></p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 py-8 md:px-8 lg:grid-cols-3">
        {/* Category breakdown */}
        <Reveal className="border border-border bg-card p-5">
          <SectionLabel>Spend by category</SectionLabel>
          <ul className="mt-2 flex flex-col gap-4">
            {byCategory.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between font-mono text-[11px] uppercase">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">{formatINR(c.amt)}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full bg-primary"
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-border/60 pt-5">
            <SectionLabel>Latest fuel logs</SectionLabel>
            <ul className="flex flex-col gap-3">
              {fuelLogs.slice(0, 4).map((f) => (
                <li key={f.id} className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                  <Fuel className="size-3.5 text-primary" />
                  <span className="text-foreground">{getVehicle(f.vehicleId, vehicles)?.reg}</span>
                  <span>{f.liters}L</span>
                  <span className="ml-auto">₹{f.cost}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Ledger */}
        <Reveal delay={0.1} className="border border-border bg-card lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  'border px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors',
                  cat === c
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
            <button
              onClick={exportCsv}
              className="ml-auto flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Download className="size-3.5" /> CSV
            </button>
          </div>
          <ul>
            {filtered.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border/50 px-5 py-3.5 last:border-0">
                <span className="font-mono text-[10px] text-muted-foreground">{e.date}</span>
                <span className="font-mono text-xs text-primary">{getVehicle(e.vehicleId, vehicles)?.reg}</span>
                <span className="border border-border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase">{e.category}</span>
                <span className="text-sm text-muted-foreground">{e.note}</span>
                <span className="ml-auto font-mono text-sm">{formatINR(e.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border px-5 py-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Filtered total</span>
            <span className="font-display text-xl">{formatINR(total)}</span>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
