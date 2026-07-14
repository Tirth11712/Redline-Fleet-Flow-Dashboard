'use client'

import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { PageHeader, Reveal, SectionLabel, CountUp } from '@/components/ui-blocks'
import { CostChart } from '@/components/dashboard/charts'
import { csvDownload, formatINR } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'
import { cn } from '@/lib/utils'

interface VehicleReport {
  reg: string
  name: string
  revenue: number
  cost: number
  roi: number
  kmPerL: number | null
}

export default function ReportsPage() {
  const { vehicles, trips, fuelLogs, expenses, maintenanceLogs } = useFleetData()
  
  const buildReport = () => {
    return vehicles
      .filter((v) => v.status !== 'Retired')
      .map((v) => {
        const revenue = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed').reduce((s, t) => s + t.revenue, 0)
        const cost =
          expenses.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0) +
          maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0)
        const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0
        const logs = fuelLogs.filter((f) => f.vehicleId === v.id)
        const km = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed').reduce((s, t) => s + t.distanceKm, 0)
        const liters = logs.reduce((s, f) => s + f.liters, 0)
        const kmPerL = liters > 0 ? km / liters : null
        return { reg: v.reg, name: v.name, revenue, cost, roi, kmPerL }
      })
      .sort((a, b) => b.roi - a.roi)
  }

  const report = buildReport()
  const totalRevenue = trips.filter((t) => t.status === 'Completed').reduce((s, t) => s + t.revenue, 0)
  const totalCost = expenses.reduce((s, e) => s + e.amount, 0) + maintenanceLogs.reduce((s, m) => s + m.cost, 0)
  const margin = totalRevenue - totalCost

  const exportCsv = () =>
    csvDownload('fleet-report.csv', [
      ['Vehicle', 'Model', 'Revenue', 'Cost', 'ROI %', 'Km per Liter'],
      ...report.map((r) => [r.reg, r.name, r.revenue, r.cost, r.roi.toFixed(1), r.kmPerL?.toFixed(2) ?? 'N/A']),
    ])

  return (
    <div>
      <PageHeader
        index="07"
        title="Analytics"
        tags={['ROI', 'Fuel Efficiency', 'CSV Export']}
        description="Derived metrics computed live from trips, fuel, and expense data — never stored, never stale. Export everything as CSV in one click."
      />

      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-px border-b border-border bg-border sm:grid-cols-3">
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Completed revenue</p>
          <p className="mt-2 font-display text-4xl">₹<CountUp value={totalRevenue} /></p>
        </div>
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Operational cost</p>
          <p className="mt-2 font-display text-4xl">₹<CountUp value={totalCost} /></p>
        </div>
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Net margin</p>
          <p className={cn('mt-2 font-display text-4xl', margin < 0 ? 'text-primary' : 'text-success')}>
            {margin < 0 ? '-' : ''}₹<CountUp value={Math.abs(margin)} />
          </p>
        </div>
      </div>

      <section className="px-4 py-8 md:px-8">
        <Reveal className="border border-border bg-card p-5">
          <SectionLabel>Weekly cost trend</SectionLabel>
          <CostChart />
        </Reveal>
      </section>

      {/* ROI table */}
      <section className="px-4 pb-10 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Vehicle ROI leaderboard</SectionLabel>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
        <Reveal className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-border">
                {['Rank', 'Vehicle', 'Revenue', 'Cost', 'ROI', 'Fuel Efficiency'].map((h) => (
                  <th key={h} className="px-5 py-3 font-mono text-[10px] font-normal tracking-[0.25em] text-muted-foreground uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={r.reg} className="border-b border-border/50 transition-colors last:border-0 hover:bg-accent/40">
                  <td className="px-5 py-4 font-display text-lg text-muted-foreground">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-primary">{r.reg}</p>
                    <p className="text-sm">{r.name}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm">{formatINR(r.revenue)}</td>
                  <td className="px-5 py-4 font-mono text-sm text-muted-foreground">{formatINR(r.cost)}</td>
                  <td className="px-5 py-4">
                    <span className={cn('flex items-center gap-1.5 font-mono text-sm', r.roi >= 0 ? 'text-success' : 'text-primary')}>
                      {r.roi >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                      {r.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-muted-foreground">
                    {r.kmPerL ? `${r.kmPerL.toFixed(2)} km/L` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>
    </div>
  )
}
