'use client'

import Link from 'next/link'
import { ArrowUpRight, AlertTriangle } from 'lucide-react'
import { useRole } from '@/components/shell/role-context'
import { PageHeader, KpiCard, Reveal, SectionLabel, StatusBadge } from '@/components/ui-blocks'
import { TripsChart, FleetDonut, CostChart } from '@/components/dashboard/charts'
import { getFleetKpis, getVehicle, getDriver, formatINR } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'
import { TripFormModal } from '@/components/trips/trip-form-modal'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const TrackingMap = dynamic(
  () => import('@/components/dashboard/tracking-map').then((mod) => mod.TrackingMap),
  { ssr: false }
)

function Ticker({ items }: { items: string[] }) {
  const displayItems = items.length > 0 ? items : ['SYSTEM NOMINAL — NO ACTIVE ALERTS']
  return (
    <div className="overflow-hidden border-b border-border bg-card py-2" aria-hidden="true">
      <div className="animate-marquee flex w-max gap-12">
        {[...displayItems, ...displayItems].map((item, i) => (
          <span key={i} className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-muted-foreground whitespace-nowrap">
            <span className="size-1 bg-primary" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { vehicles, trips, drivers, expenses, isLoading } = useFleetData()
  const { role } = useRole()
  const [isTripModalOpen, setIsTripModalOpen] = useState(false)
  const k = getFleetKpis(vehicles, trips, drivers)
  const activeTrips = trips.filter((t) => t.status === 'Dispatched' || t.status === 'Draft')
  // Fallback: show 5 most recent trips if no active ones
  const tripQueueItems = activeTrips.length > 0 ? activeTrips : trips.slice(0, 5)
  const licenseRisks = drivers.filter((d) => d.safetyScore < 75 || d.status === 'Suspended')
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0)

  const tickerItems = [
    ...trips.filter((t) => t.status === 'Dispatched').map((t) => `${t.ref} DISPATCHED — ${t.origin.split(',')[0]} → ${t.destination.split(',')[0]}`),
    ...vehicles.filter((v) => v.status === 'In Shop').map((v) => `${v.reg} IN SHOP`),
    ...drivers.filter((d) => d.status === 'Suspended').map((d) => `LICENSE ALERT — ${d.name.toUpperCase()} SUSPENDED`),
    `FLEET UTILIZATION ${k.utilization}% — ${k.active} OF ${k.operational} ACTIVE`,
    `TOTAL SPEND THIS QUARTER ${formatINR(totalSpend)}`,
  ].filter(Boolean)

  const showFinance = role === 'Fleet Manager' || role === 'Financial Analyst'
  const showSafety = role === 'Fleet Manager' || role === 'Safety Officer'

  return (
    <div>
      <Ticker items={tickerItems} />
      <PageHeader
        index="01"
        title="Operations"
        tags={['Live Console', role, 'Real-Time']}
        description={`Real-time view of fleet health and activity. Visible sections adapt to your role (${role}).`}
      />

      {/* KPI grid */}
      <section className="grid grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 md:px-8 xl:grid-cols-4" aria-label="Key performance indicators">
        <KpiCard label="Fleet Utilization" value={k.utilization} suffix="%" sub={`${k.active} of ${k.operational} active`} delay={0} />
        <KpiCard label="Available Vehicles" value={k.available} sub={`${k.inShop} in shop`} delay={0.08} />
        <KpiCard label="Active Trips" value={k.activeTrips} sub={`${k.draftTrips} draft pending`} delay={0.16} />
        <KpiCard label="Drivers On Duty" value={k.onDuty} sub={`${k.licenseAlerts} license alerts`} alert={k.licenseAlerts > 0} delay={0.24} />
      </section>

      {/* Live Map Tracking */}
      <section className="px-4 pb-8 md:px-8">
        <Reveal className="border border-border bg-card p-5">
          <SectionLabel>Live Fleet Tracking Telemetry</SectionLabel>
          <TrackingMap />
        </Reveal>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-4 px-4 pb-8 md:px-8 lg:grid-cols-5">
        <Reveal className="border border-border bg-card p-5 lg:col-span-3">
          <SectionLabel>Trips created — last 14 days</SectionLabel>
          <TripsChart />
        </Reveal>
        <Reveal delay={0.1} className="border border-border bg-card p-5 lg:col-span-2">
          <SectionLabel>Fleet status</SectionLabel>
          <FleetDonut />
        </Reveal>
      </section>

      {showFinance && (
        <section className="px-4 pb-8 md:px-8">
          <Reveal className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionLabel>Cost curve — fuel vs maintenance</SectionLabel>
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                Total spend <span className="font-display text-base text-foreground">{formatINR(totalSpend)}</span>
              </p>
            </div>
            <CostChart />
          </Reveal>
        </section>
      )}

      {/* Live trips + compliance */}
      <section className="grid grid-cols-1 gap-4 px-4 pb-8 md:px-8 lg:grid-cols-2">
        <Reveal className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <SectionLabel>Trip queue</SectionLabel>
            <div className="flex gap-4 items-center">
              {(role === 'Fleet Manager' || role === 'Driver') && (
                <button 
                  onClick={() => setIsTripModalOpen(true)}
                  className="group flex items-center gap-1 font-mono text-[10px] tracking-widest text-primary hover:text-primary/80 uppercase"
                >
                  + New Trip
                </button>
              )}
              <Link href="/trips" className="group flex items-center gap-1 font-mono text-[10px] tracking-widest text-primary uppercase">
                All trips <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
          <ul>
            {isLoading ? (
              <li className="px-5 py-6 font-mono text-xs text-muted-foreground animate-pulse">SYNCING TRIP DATA...</li>
            ) : tripQueueItems.length === 0 ? (
              <li className="px-5 py-6 font-mono text-xs text-muted-foreground">NO TRIPS FOUND</li>
            ) : (
              tripQueueItems.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0">
                  <span className="font-mono text-xs text-primary">{t.ref}</span>
                  <span className="text-sm">{t.origin} → {t.destination}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{getVehicle(t.vehicleId, vehicles)?.reg} / {getDriver(t.driverId, drivers)?.name}</span>
                  <span className="ml-auto"><StatusBadge status={t.status} /></span>
                </li>
              ))
            )}
          </ul>
        </Reveal>

        {showSafety ? (
          <Reveal delay={0.1} className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <SectionLabel>Compliance watchlist</SectionLabel>
              <AlertTriangle className="size-4 text-warning" />
            </div>
            <ul>
              {licenseRisks.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0">
                  <span className="text-sm">{d.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">SAFETY {d.safetyScore}/100 · EXP {d.licenseExpiry}</span>
                  <span className="ml-auto"><StatusBadge status={d.status} /></span>
                </li>
              ))}
              {licenseRisks.length === 0 && (
                <li className="px-5 py-6 font-mono text-xs text-muted-foreground">NO COMPLIANCE RISKS DETECTED</li>
              )}
            </ul>
          </Reveal>
        ) : (
          <Reveal delay={0.1} className="flex flex-col items-start justify-center border border-border bg-card p-6">
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Restricted section</p>
            <p className="mt-2 font-display text-2xl uppercase">
              Compliance data<span className="text-primary">.</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Visible to Fleet Managers and Safety Officers only. Role-based access is enforced server-side.
            </p>
          </Reveal>
        )}
      </section>

      {/* Big footer statement */}
      <section className="overflow-hidden border-t border-border px-4 py-12 md:px-8">
        <Reveal>
          <p className="font-display text-[11vw] leading-[0.9] tracking-tight uppercase text-stroke select-none lg:text-8xl" aria-hidden="true">
            Zero conflicts
          </p>
          <p className="font-display text-[11vw] leading-[0.9] tracking-tight uppercase lg:text-8xl">
            Full visibility<span className="text-primary">.</span>
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            The business rules engine blocks double-bookings, expired licenses, and overloaded cargo before they ever hit the road.
          </p>
        </Reveal>
      </section>

      <TripFormModal isOpen={isTripModalOpen} onClose={() => setIsTripModalOpen(false)} />
    </div>
  )
}
