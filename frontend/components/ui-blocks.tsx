'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/* ---------- Page header, Builder Labs style ---------- */

export function PageHeader({
  index,
  title,
  tags,
  description,
}: {
  index: string
  title: string
  tags: string[]
  description: string
}) {
  return (
    <div className="border-b border-border px-4 pt-10 pb-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 flex flex-wrap items-center gap-2"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-primary">/{index}</span>
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase"
          >
            {t}
          </span>
        ))}
      </motion.div>
      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: '105%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl leading-[0.95] tracking-tight uppercase text-balance md:text-6xl"
        >
          {title}
          <span className="text-primary">.</span>
        </motion.h1>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-4 max-w-xl leading-relaxed text-muted-foreground text-pretty"
      >
        {description}
      </motion.p>
    </div>
  )
}

/* ---------- Scroll reveal wrapper ---------- */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Animated counter ---------- */

export function CountUp({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 90, damping: 24 })

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, value, mv])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`
    })
  }, [spring, suffix])

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}

/* ---------- KPI Card ---------- */

export function KpiCard({
  label,
  value,
  suffix,
  sub,
  alert,
  delay = 0,
}: {
  label: string
  value: number
  suffix?: string
  sub: string
  alert?: boolean
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <div className="group relative overflow-hidden border border-border bg-card p-5 transition-colors hover:border-primary/50">
        <div className="absolute top-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
        <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">{label}</p>
        <p className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
          <CountUp value={value} suffix={suffix} />
        </p>
        <p className={cn('mt-2 font-mono text-[10px] tracking-widest uppercase', alert ? 'text-primary' : 'text-muted-foreground')}>
          {sub}
        </p>
      </div>
    </Reveal>
  )
}

/* ---------- Status badge ---------- */

const STATUS_STYLES: Record<string, string> = {
  Available: 'text-success border-success/40 bg-success/10',
  'On Trip': 'text-primary border-primary/40 bg-primary/10',
  'In Shop': 'text-warning border-warning/40 bg-warning/10',
  Retired: 'text-muted-foreground border-border bg-muted',
  'On Duty': 'text-success border-success/40 bg-success/10',
  'Off Duty': 'text-muted-foreground border-border bg-muted',
  Suspended: 'text-primary border-primary/40 bg-primary/10',
  Draft: 'text-muted-foreground border-border bg-muted',
  Dispatched: 'text-primary border-primary/40 bg-primary/10',
  Completed: 'text-success border-success/40 bg-success/10',
  Cancelled: 'text-warning border-warning/40 bg-warning/10',
  Open: 'text-warning border-warning/40 bg-warning/10',
  Closed: 'text-success border-success/40 bg-success/10',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase',
        STATUS_STYLES[status] ?? 'text-muted-foreground border-border',
      )}
    >
      <span className="size-1 rounded-full bg-current" />
      {status}
    </span>
  )
}

/* ---------- Section label ---------- */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
      <span className="h-px w-6 bg-primary" />
      {children}
    </p>
  )
}
