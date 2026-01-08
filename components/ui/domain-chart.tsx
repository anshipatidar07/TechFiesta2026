"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface DomainChartProps {
  domains: {
    web: number
    ml: number
    core: number
    systems: number
    tools: number
  }
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DomainChart({ domains }: DomainChartProps) {
  const data = [
    { name: "Web Development", value: domains.web },
    { name: "AI / Machine Learning", value: domains.ml },
    { name: "Core Programming", value: domains.core },
    { name: "Backend & Systems", value: domains.systems },
    { name: "Tools & Platforms", value: domains.tools },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.3}
        />
        <XAxis
  dataKey="name"
  interval={0}
  angle={-30}
  textAnchor="end"
  height={60}
  stroke="hsl(var(--muted-foreground))"
  fontSize={12}
  tickLine={false}
/>


        <YAxis
          domain={[0, 100]}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
