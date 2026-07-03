import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, List, Tag, TrendingUp, MapPin } from 'lucide-react'
import AdminCharts from '@/components/dashboard/AdminCharts'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik').select('*').eq('id', user.id).single()
  if (!pemilik || pemilik.role !== 'admin') redirect('/dashboard')

  // Aggregate stats
  const { count: totalPeternak } = await supabase
    .from('pemilik').select('*', { count: 'exact', head: true }).eq('role', 'peternak')

  const { count: totalTernak } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true })

  const { count: totalHidup } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true }).eq('status_hidup', true)

  const { count: totalMati } = await supabase
    .from('ternak').select('*', { count: 'exact', head: true }).eq('status_hidup', false)

  // Stats per desa
  const { data: statistikDesa } = await supabase
    .from('v_statistik_desa').select('*')

  // Stats per jenis for chart
  const { data: perJenis } = await supabase
    .from('ternak')
    .select('id_jenis, master_jenis_ternak(nama_jenis)')
    .eq('status_hidup', true)

  // Build chart data
  const jenisCounts: Record<string, number> = {}
  perJenis?.forEach((t: any) => {
    const nama = t.master_jenis_ternak?.nama_jenis
    if (nama) jenisCounts[nama] = (jenisCounts[nama] || 0) + 1
  })
  const chartData = Object.entries(jenisCounts).map(([name, value]) => ({ name, value }))

  // Per desa totals
  const goloMoriTotal = statistikDesa
    ?.filter((s) => s.alamat_desa === 'Golo Mori')
    .reduce((acc, s) => acc + (s.total || 0), 0) ?? 0
  const warlokaTotal = statistikDesa
    ?.filter((s) => s.alamat_desa === 'Warloka')
    .reduce((acc, s) => acc + (s.total || 0), 0) ?? 0

  const statsCards = [
    {
      label: 'Total Peternak',
      value: totalPeternak ?? 0,
      icon: Users,
      color: 'var(--color-primary-500)',
      href: '/admin/peternak',
    },
    {
      label: 'Total Ternak',
      value: totalTernak ?? 0,
      icon: List,
      color: 'var(--color-secondary-500)',
      href: '/ternak',
    },
    {
      label: 'Ternak Hidup',
      value: totalHidup ?? 0,
      icon: TrendingUp,
      color: 'var(--color-hidup)',
      href: '/ternak?status=hidup',
    },
    {
      label: 'Ternak Mati',
      value: totalMati ?? 0,
      icon: Tag,
      color: 'var(--color-mati)',
      href: '/ternak?status=mati',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-subtitle">Rekapitulasi populasi ternak Desa Golo Mori & Warloka</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="stats-card hover:opacity-90 transition-opacity">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stat.value.toLocaleString('id-ID')}
                  </p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}22`, color: stat.color }}
                >
                  <Icon size={18} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Per Desa Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { desa: 'Golo Mori', total: goloMoriTotal },
          { desa: 'Warloka', total: warlokaTotal },
        ].map(({ desa, total }) => (
          <Link
            key={desa}
            href={`/ternak?desa=${desa}`}
            className="card flex items-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(26,94,56,0.15)', color: 'var(--color-primary-400)' }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Desa {desa}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-400)' }}>
                {total.toLocaleString('id-ID')}
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  ekor
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <AdminCharts chartData={chartData} />
    </div>
  )
}
