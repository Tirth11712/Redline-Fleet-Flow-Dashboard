'use client'

import { Wrench, CircleCheck, CircleDot } from 'lucide-react'
import { PageHeader, Reveal, StatusBadge, SectionLabel, CountUp } from '@/components/ui-blocks'
import { getVehicle, formatINR } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'
import { cn } from '@/lib/utils'

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles } = useFleetData()

  const open = maintenanceLogs.filter((m) => m.status === 'Open')
  const totalCost = maintenanceLogs.reduce((s, m) => s + m.cost, 0)

  return (
    <div>
      <PageHeader
        index="05"
        title="Maintenance Bay"
        tags={['Workflow', `${open.length} Open`, 'Auto Status']}
        description="Opening a record moves the vehicle to In Shop automatically. Closing it returns the unit to Available — unless it has been retired."
      />

      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-px border-b border-border bg-border sm:grid-cols-3">
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Open work orders</p>
          <p className="mt-2 font-display text-4xl"><CountUp value={open.length} /></p>
        </div>
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Closed this quarter</p>
          <p className="mt-2 font-display text-4xl"><CountUp value={maintenanceLogs.length - open.length} /></p>
        </div>
        <div className="bg-background px-4 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Maintenance spend</p>
          <p className="mt-2 font-display text-4xl">₹<CountUp value={totalCost} /></p>
        </div>
      </div>

      {/* Timeline */}
      <section className="px-4 py-10 md:px-8">
        <SectionLabel>Work order timeline</SectionLabel>
        <ol className="relative ml-2 border-l border-border">
          {maintenanceLogs.map((m, i) => {
            const v = getVehicle(m.vehicleId, vehicles)
            const isOpen = m.status === 'Open'
            return (
              <Reveal key={m.id} delay={Math.min(i * 0.07, 0.35)}>
                <li className="relative pb-8 pl-8 last:pb-0">
                  <span
                    className={cn(
                      'absolute top-1 -left-[9px] flex size-4.5 items-center justify-center rounded-full border bg-background',
                      isOpen ? 'border-warning text-warning' : 'border-success text-success',
                    )}
                  >
                    {isOpen ? <CircleDot className="size-3 animate-pulse-dot" /> : <CircleCheck className="size-3" />}
                  </span>
                  <article className="group border border-border bg-card p-5 transition-colors hover:border-primary/50">
                    <div className="flex flex-wrap items-center gap-3">
                      <Wrench className="size-4 text-muted-foreground" />
                      <h2 className="font-display text-lg tracking-tight uppercase">{m.type}</h2>
                      <span className="font-mono text-[10px] tracking-[0.25em] text-primary">{v?.reg}</span>
                      <span className="ml-auto"><StatusBadge status={m.status} /></span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
                      <span>OPENED {m.openedAt}</span>
                      <span>{m.closedAt ? `CLOSED ${m.closedAt}` : 'IN PROGRESS'}</span>
                      <span className="text-foreground">{formatINR(m.cost)}</span>
                      <span>{v?.name}</span>
                    </div>
                  </article>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
