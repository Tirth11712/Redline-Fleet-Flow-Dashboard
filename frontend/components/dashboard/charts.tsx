'use client'

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Legend,
} from 'recharts'
import { getTripsPerDay, getCostPerWeek, getFleetKpis } from '@/lib/data'
import { useFleetData } from '@/components/shell/data-context'

const tooltipStyle = {
  background: 'oklch(0.165 0.014 25)',
  border: '1px solid oklch(1 0 0 / 12%)',
  borderRadius: 0,
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: 11,
  color: 'oklch(0.96 0.005 60)',
}

export function TripsChart() {
  const { trips } = useFleetData()
  const data = getTripsPerDay(trips)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="day"
          stroke="oklch(0.45 0.01 40)"
          fontSize={9}
          fontFamily="var(--font-jetbrains-mono)"
          tickLine={false}
          axisLine={{ stroke: 'oklch(1 0 0 / 10%)' }}
          interval={1}
        />
        <YAxis
          stroke="oklch(0.45 0.01 40)"
          fontSize={9}
          fontFamily="var(--font-jetbrains-mono)"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'oklch(1 0 0 / 5%)' }} />
        <Bar dataKey="trips" fill="var(--color-primary)" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={1200} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const FLEET_COLORS = {
  Available: 'oklch(0.72 0.17 150)',
  'On Trip': 'oklch(0.55 0.22 28)',
  'In Shop': 'oklch(0.8 0.16 80)',
  Retired: 'oklch(0.45 0.01 40)',
}

export function FleetDonut() {
  const { vehicles, trips, drivers } = useFleetData()
  const k = getFleetKpis(vehicles, trips, drivers)
  const data = [
    { name: 'Available', value: k.available },
    { name: 'On Trip', value: k.active },
    { name: 'In Shop', value: k.inShop },
    { name: 'Retired', value: k.retired },
  ]
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="85%"
          paddingAngle={3}
          stroke="none"
          isAnimationActive
          animationDuration={1200}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={FLEET_COLORS[d.name as keyof typeof FLEET_COLORS]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(v) => (
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'oklch(0.62 0.01 40)' }}>
              {String(v).toUpperCase()}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function CostChart() {
  const { expenses } = useFleetData()
  const data = getCostPerWeek(expenses)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 4, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="fuelFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.22 28)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="oklch(0.55 0.22 28)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="maintFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.005 60)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="oklch(0.85 0.005 60)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="week"
          stroke="oklch(0.45 0.01 40)"
          fontSize={9}
          fontFamily="var(--font-jetbrains-mono)"
          tickLine={false}
          axisLine={{ stroke: 'oklch(1 0 0 / 10%)' }}
        />
        <YAxis
          stroke="oklch(0.45 0.01 40)"
          fontSize={9}
          fontFamily="var(--font-jetbrains-mono)"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
        />
        <Area type="monotone" dataKey="fuel" stroke="oklch(0.55 0.22 28)" fill="url(#fuelFill)" strokeWidth={2} isAnimationActive animationDuration={1400} />
        <Area type="monotone" dataKey="maintenance" stroke="oklch(0.85 0.005 60)" fill="url(#maintFill)" strokeWidth={2} isAnimationActive animationDuration={1400} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
