'use client'

import { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Users, LayoutDashboard, PawPrint } from 'lucide-react'
import type { TernakLengkap } from '@/types/database.types'

interface StatistikDashboardProps {
  ternakData: TernakLengkap[]
  peternakCount: number
}

// Colors for the charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1']
const STATUS_COLORS = {
  Hidup: '#10b981',
  Dijual: '#f59e0b',
  Mati: '#ef4444'
}

export default function StatistikDashboard({ ternakData, peternakCount }: StatistikDashboardProps) {
  const [selectedDesa, setSelectedDesa] = useState<string>('Semua Desa')

  // Get unique Desa for filter dropdown
  const desaList = useMemo(() => {
    const desas = Array.from(new Set(ternakData.map(t => t.alamat_desa).filter(Boolean)))
    return ['Semua Desa', ...desas.sort()]
  }, [ternakData])

  // Filter data based on selected Desa
  const filteredTernak = useMemo(() => {
    if (selectedDesa === 'Semua Desa') return ternakData
    return ternakData.filter(t => t.alamat_desa === selectedDesa)
  }, [ternakData, selectedDesa])

  // Agregasi Data untuk Kartu Ringkasan
  const totalTernak = filteredTernak.length
  
  // Agregasi Jenis Hewan
  const jenisData = useMemo(() => {
    const map = new Map<string, number>()
    filteredTernak.forEach(t => {
      const j = t.nama_jenis || 'Lainnya'
      map.set(j, (map.get(j) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTernak])

  // Agregasi Status Kehidupan
  const statusData = useMemo(() => {
    const map = new Map<string, number>()
    filteredTernak.forEach(t => {
      // Capitalize first letter
      const s = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Lainnya'
      map.set(s, (map.get(s) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
  }, [filteredTernak])

  // Agregasi Populasi per Desa (hanya relevan jika Semua Desa)
  const populasiDesaData = useMemo(() => {
    const map = new Map<string, number>()
    ternakData.forEach(t => {
      const d = t.alamat_desa || 'Tidak Diketahui'
      map.set(d, (map.get(d) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, Populasi]) => ({ name, Populasi }))
      .sort((a, b) => b.Populasi - a.Populasi)
  }, [ternakData])

  // Agregasi Kelamin per Jenis Hewan
  const kelaminJenisData = useMemo(() => {
    const map = new Map<string, { Jantan: number, Betina: number, Lainnya: number }>()
    filteredTernak.forEach(t => {
      const j = t.nama_jenis || 'Lainnya'
      const k = t.jenis_kelamin?.toLowerCase() === 'jantan' ? 'Jantan' 
              : t.jenis_kelamin?.toLowerCase() === 'betina' ? 'Betina' 
              : 'Lainnya'
      
      if (!map.has(j)) map.set(j, { Jantan: 0, Betina: 0, Lainnya: 0 })
      map.get(j)![k]++
    })
    return Array.from(map.entries()).map(([name, counts]) => ({
      name,
      ...counts
    }))
  }, [filteredTernak])

  // Agregasi Distribusi Fase
  const faseData = useMemo(() => {
    const map = new Map<string, number>()
    filteredTernak.forEach(t => {
      const f = t.fase || 'Tidak Diketahui'
      map.set(f, (map.get(f) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTernak])

  // Agregasi Rata-rata Berat per Jenis Hewan
  const beratJenisData = useMemo(() => {
    const map = new Map<string, { totalBerat: number, count: number }>()
    filteredTernak.forEach(t => {
      const j = t.nama_jenis || 'Lainnya'
      const berat = t.berat_badan || 0
      if (berat > 0) {
        if (!map.has(j)) map.set(j, { totalBerat: 0, count: 0 })
        const stats = map.get(j)!
        stats.totalBerat += berat
        stats.count++
      }
    })
    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        RataRata: Math.round((stats.totalBerat / stats.count) * 10) / 10
      }))
      .sort((a, b) => b.RataRata - a.RataRata)
  }, [filteredTernak])

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div>
          <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-blue-600" />
            Dasbor Statistik Populasi
          </h2>
          <p className="text-sm text-blue-700/80">Pantau persebaran dan status hewan ternak secara real-time</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-blue-800">Filter Wilayah:</span>
          <select 
            className="form-input bg-white border-blue-200 text-blue-900 font-semibold focus:border-blue-500 focus:ring-blue-500/20"
            value={selectedDesa}
            onChange={(e) => setSelectedDesa(e.target.value)}
          >
            {desaList.map(desa => (
              <option key={desa} value={desa}>{desa}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Ternak</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <PawPrint size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900">{totalTernak.toLocaleString('id-ID')}</p>
          <p className="text-sm text-gray-500 mt-1">Ekor terdaftar di {selectedDesa}</p>
        </div>
        
        <div className="card p-6 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ternak Hidup</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900">
            {statusData.find(s => s.name === 'Hidup')?.value.toLocaleString('id-ID') || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Populasi aktif saat ini</p>
        </div>

        <div className="card p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Peternak</h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-gray-900">{peternakCount.toLocaleString('id-ID')}</p>
          <p className="text-sm text-gray-500 mt-1">Jumlah pemilik (Keseluruhan)</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Jenis Hewan Pie Chart */}
        <div className="card p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Proporsi Jenis Hewan</h3>
          {totalTernak > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jenisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {jenisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} Ekor`, 'Jumlah']} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Tidak ada data ternak</div>
          )}
        </div>

        {/* Status Kehidupan Donut/Bar Chart */}
        <div className="card p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Status Kehidupan Ternak</h3>
          {totalTernak > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} fontWeight="bold" />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value: number) => [`${value} Ekor`, 'Jumlah']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Tidak ada data ternak</div>
          )}
        </div>

        {/* Breakdown Kelamin per Jenis Hewan */}
        <div className="card p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Kelamin per Jenis Hewan</h3>
          {totalTernak > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kelaminJenisData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickMargin={10} />
                  <YAxis />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="Jantan" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} barSize={40} />
                  <Bar dataKey="Betina" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Lainnya" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Tidak ada data ternak</div>
          )}
        </div>

        {/* Rata-rata Berat per Jenis Hewan */}
        <div className="card p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Rata-rata Berat (Kg) per Jenis</h3>
          {beratJenisData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={beratJenisData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickMargin={10} />
                  <YAxis />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value: number) => [`${value} Kg`, 'Rata-rata Berat']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="RataRata" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Data berat belum tersedia</div>
          )}
        </div>

        {/* Distribusi Fase */}
        <div className={`card p-6 shadow-sm ${selectedDesa !== 'Semua Desa' ? 'lg:col-span-2 xl:col-span-2' : ''}`}>
          <h3 className="font-bold text-gray-800 mb-6">Distribusi Fase Ternak</h3>
          {totalTernak > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={faseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {faseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} Ekor`, 'Jumlah']} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Tidak ada data ternak</div>
          )}
        </div>

        {/* Populasi Per Desa Bar Chart (Hanya tampil di Semua Desa) */}
        {selectedDesa === 'Semua Desa' && (
          <div className="card p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Distribusi Populasi per Desa</h3>
            {populasiDesaData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={populasiDesaData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickMargin={10} />
                    <YAxis />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      formatter={(value: number) => [`${value} Ekor`, 'Populasi']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Populasi" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">Tidak ada data ternak</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
