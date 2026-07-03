'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface AdminChartsProps {
  chartData: { name: string; value: number }[]
}

const COLORS = [
  '#2d8a64', '#e07b39', '#4ade80', '#f87171', '#60a5fa',
  '#facc15', '#a78bfa', '#34d399', '#fb923c', '#38bdf8',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-bg-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="font-semibold">{label}</p>
        <p style={{ color: 'var(--color-primary-400)' }}>
          {payload[0].value} ekor
        </p>
      </div>
    )
  }
  return null
}

export default function AdminCharts({ chartData }: AdminChartsProps) {
  if (chartData.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
          Belum ada data untuk ditampilkan dalam grafik
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Populasi per Jenis Hewan (Status Hidup)
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
