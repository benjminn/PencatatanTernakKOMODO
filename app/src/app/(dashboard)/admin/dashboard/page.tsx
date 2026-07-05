import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, List, TrendingUp, MapPin, DollarSign, Skull } from 'lucide-react'
import AdminCharts from '@/components/dashboard/AdminCharts'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik').select('*').eq('id', user.id).single()
  if (!pemilik || (pemilik.role !== 'admin' && pemilik.role !== 'superadmin')) redirect('/dashboard')

  const { count: totalPeternak } = await supabase
    .from('pemilik').select('*', { count: 'exact', head: true }).eq('role', 'peternak')
  const { count: totalTernak } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true })
  const { count: totalHidup } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true }).eq('status', 'hidup')
  const { count: totalMati } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true }).eq('status', 'mati')
  const { count: totalDijual } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true }).eq('status', 'dijual')

  const { data: statistikDesa } = await supabase.from('v_statistik_desa').select('*')

  const { data: perJenis } = await supabase
    .from('ternak').select('id_jenis, master_jenis_ternak(nama_jenis)').eq('status', 'hidup')

  const jenisCounts: Record<string, number> = {}
  perJenis?.forEach((t: any) => {
    const nama = t.master_jenis_ternak?.nama_jenis
    if (nama) jenisCounts[nama] = (jenisCounts[nama] || 0) + 1
  })
  const chartData = Object.entries(jenisCounts).map(([name, value]) => ({ name, value }))

  const goloMoriTotal = statistikDesa
    ?.filter((s) => s.alamat_desa === 'Golo Mori')
    .reduce((acc, s) => acc + (s.total || 0), 0) ?? 0
  const warlokaTotal = statistikDesa
    ?.filter((s) => s.alamat_desa === 'Warloka')
    .reduce((acc, s) => acc + (s.total || 0), 0) ?? 0

  const stats = [
    { label: 'Peternak', value: totalPeternak ?? 0, icon: Users, color: '#166534', href: '/admin/peternak' },
    { label: 'Total Ternak', value: totalTernak ?? 0, icon: List, color: '#0369a1', href: '/ternak' },
    { label: 'Hidup', value: totalHidup ?? 0, icon: TrendingUp, color: '#15803d', href: '/ternak?status=hidup' },
    { label: 'Mati', value: totalMati ?? 0, icon: Skull, color: '#dc2626', href: '/ternak?status=mati' },
    { label: 'Dijual', value: totalDijual ?? 0, icon: DollarSign, color: '#b45309', href: '/ternak?status=dijual' },
  ]

  return (
    <div className="space-y-6 max-w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Rekapitulasi populasi ternak Desa Golo Mori & Warloka</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href} className="stats-card group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}10`, color: s.color }}>
                  <Icon size={15} />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value.toLocaleString('id-ID')}</p>
            </Link>
          )
        })}
      </div>

      {/* Per Desa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { desa: 'Golo Mori', total: goloMoriTotal },
          { desa: 'Warloka', total: warlokaTotal },
        ].map(({ desa, total }) => (
          <Link key={desa} href={`/ternak?desa=${desa}`} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0fdf4', color: '#166534' }}>
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Desa {desa}</p>
              <p className="text-lg font-bold text-green-800">
                {total.toLocaleString('id-ID')}
                <span className="text-xs font-normal text-gray-500 ml-1">ekor</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart */}
      <AdminCharts chartData={chartData} />
    </div>
  )
}
