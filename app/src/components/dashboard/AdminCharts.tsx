'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AdminChartsProps {
  chartData: { name: string; value: number }[]
}

const COLORS = ['#166534', '#ea580c', '#0369a1', '#b45309', '#7c3aed', '#dc2626', '#0891b2', '#15803d']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-green-700">{payload[0].value} ekor</p>
      </div>
    )
  }
  return null
}

export default function AdminCharts({ chartData }: AdminChartsProps) {
  if (chartData.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-center py-8 text-gray-400">
          Belum ada data untuk grafik
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-sm text-gray-900 mb-4">
        Populasi per Jenis Hewan (Hidup)
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
