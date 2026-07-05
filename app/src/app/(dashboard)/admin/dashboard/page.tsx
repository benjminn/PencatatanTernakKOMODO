import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, List, TrendingUp, MapPin, DollarSign, Skull, ShieldCheck, Activity } from 'lucide-react'
import AdminCharts from '@/components/dashboard/AdminCharts'
import PeternakOverviewList from '@/components/admin/PeternakOverviewList'
import type { Metadata } from 'next'
import { formatDateShort } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('pemilik').select('*').eq('id', user.id).single()
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) redirect('/dashboard')

  // Fetch Pemilik List (Peternak)
  const { data: rawPeternakList } = await supabase
    .from('pemilik').select('*, master_desa(nama_desa)').eq('role', 'peternak')
    
  const peternakList = rawPeternakList?.map(p => ({
    ...p,
    alamat_desa: p.master_desa?.nama_desa || '...'
  })) || []
    
  // Fetch Admin Count
  const { count: totalAdmin } = await supabase
    .from('pemilik').select('*', { count: 'exact', head: true }).in('role', ['admin', 'superadmin'])

  // Fetch All Ternak
  const { data: ternakListLengkap } = await supabase
    .from('v_ternak_lengkap').select('*')
    
  const totalTernak = ternakListLengkap?.length || 0
  const totalHidup = ternakListLengkap?.filter(t => t.status === 'hidup').length || 0
  const totalMati = ternakListLengkap?.filter(t => t.status === 'mati').length || 0
  const totalDijual = ternakListLengkap?.filter(t => t.status === 'dijual').length || 0

  // Statistik Desa
  const { data: statistikDesa } = await supabase.from('v_statistik_desa').select('*')
  const goloMoriTotal = statistikDesa
    ?.filter((s) => s.alamat_desa === 'Golo Mori')
    .reduce((acc, s) => acc + (s.total || 0), 0) ?? 0
  const warlokaTotal = statistikDesa
    ?.filter((s) => s.alamat_desa === 'Warloka')
    .reduce((acc, s) => acc + (s.total || 0), 0) ?? 0

  // Chart Data
  const jenisCounts: Record<string, number> = {}
  ternakListLengkap?.filter(t => t.status === 'hidup').forEach(t => {
    jenisCounts[t.nama_jenis] = (jenisCounts[t.nama_jenis] || 0) + 1
  })
  const chartData = Object.entries(jenisCounts).map(([name, value]) => ({ name, value }))
  
  // Recent Activities
  const recentActivities = [...(ternakListLengkap || [])]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8 max-w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-subtitle">Pusat kendali dan rekapitulasi data ternak Desa Golo Mori & Warloka</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Kolom Kiri Utama */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Section: Statistik Pengguna & Ternak */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Statistik Global</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Users */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peternak</p>
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><Users size={16} /></div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{peternakList?.length || 0}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck size={16} /></div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{totalAdmin ?? 0}</p>
              </div>
              {/* Ternak */}
              <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-between hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Ternak Hidup</p>
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><TrendingUp size={16} /></div>
                </div>
                <p className="text-3xl font-extrabold text-green-700">{totalHidup}</p>
              </div>
            </div>
          </section>

          {/* Section: Daftar Kepemilikan Peternak */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Rincian Kepemilikan Peternak</h2>
                <p className="text-xs text-gray-500">Klik baris peternak untuk melihat riwayat mati & dijual.</p>
              </div>
              <Link href="/admin/peternak" className="text-sm font-semibold text-blue-600 hover:underline">
                Kelola Akun &rarr;
              </Link>
            </div>
            <PeternakOverviewList pemilikList={peternakList || []} ternakList={ternakListLengkap || []} />
          </section>

        </div>

        {/* Kolom Kanan (Sidebar Analytics) */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Distribusi Desa */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Sebaran Desa</h2>
            <div className="space-y-3">
              {[
                { desa: 'Golo Mori', total: goloMoriTotal },
                { desa: 'Warloka', total: warlokaTotal },
              ].map(({ desa, total }) => {
                const percentage = totalTernak > 0 ? Math.round((total / totalTernak) * 100) : 0
                return (
                  <div key={desa} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-green-50/50 w-0 group-hover:w-full transition-all duration-500 ease-out z-0" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-700">
                        <MapPin size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-gray-900">Desa {desa}</p>
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{percentage}%</span>
                        </div>
                        <p className="text-sm text-gray-500">{total.toLocaleString('id-ID')} ekor terdaftar</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Chart */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Komposisi Jenis Ternak</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <AdminCharts chartData={chartData} />
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Aktivitas Terkini
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${act.status === 'hidup' ? 'bg-green-500' : act.status === 'mati' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="capitalize">{act.nama_jenis}</span> ({act.jenis_penanda}) diperbarui
                    </p>
                    <p className="text-xs text-gray-500">
                      Oleh <span className="font-semibold text-gray-700">{act.nama_lengkap}</span> • {formatDateShort(act.updated_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
