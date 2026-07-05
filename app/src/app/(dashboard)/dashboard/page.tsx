import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, MapPin, Hash } from 'lucide-react'
import TernakTable from '@/components/ternak/TernakTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik').select('*, master_desa(nama_desa, kecamatan)').eq('id', user.id).single()

  if (!pemilik) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card text-center max-w-md">
          <div className="text-4xl mb-3">⏳</div>
          <h2 className="font-bold text-lg text-gray-900 mb-2">Akun Sedang Disiapkan</h2>
          <p className="text-sm text-gray-500 mb-3">
            Profil Anda sedang dibuat. Jika lebih dari 1 menit, coba logout dan login ulang.
          </p>
          <p className="text-xs font-mono text-gray-400">
            ID: {user.id.substring(0, 8)}...
          </p>
        </div>
      </div>
    )
  }

  if (pemilik.role === 'admin' || pemilik.role === 'superadmin') {
    redirect('/admin/dashboard')
  }

  const { data: ternakList } = await supabase
    .from('v_ternak_lengkap').select('*')
    .eq('nik', pemilik.nik)
    .order('created_at', { ascending: false })

  const totalHidup = ternakList?.filter((t) => t.status === 'hidup').length ?? 0
  const totalMati = ternakList?.filter((t) => t.status === 'mati').length ?? 0
  const totalDijual = ternakList?.filter((t) => t.status === 'dijual').length ?? 0
  
  const ternakHidup = ternakList?.filter(t => t.status === 'hidup') ?? []
  const jenisCount = ternakHidup.reduce((acc, curr) => {
    acc[curr.nama_jenis] = (acc[curr.nama_jenis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 max-w-full pb-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #166534, #15803d)', color: 'white' }}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h18"/><path d="M12 2v20"/><path d="M12 7l-5-5-5 5"/><path d="M12 17l5 5 5-5"/></svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {pemilik.nama_lengkap.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base mt-2 text-green-100 max-w-2xl leading-relaxed">
            Selamat datang di Dashboard Peternak. Pantau kondisi ternak Anda, cetak kartu kepemilikan, dan kelola data ternak dengan mudah.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 relative z-10 shrink-0">
          <Link href="/ternak/tambah" className="btn bg-white text-green-800 hover:bg-green-50 shadow-sm rounded-xl py-3 px-5 w-full md:w-auto">
            <PlusCircle size={18} /> Tambah Ternak
          </Link>
          <Link href="/kartu-ternak" className="btn bg-green-700/50 hover:bg-green-700/70 border border-green-500/30 text-white backdrop-blur-sm rounded-xl py-3 px-5 w-full md:w-auto">
            Cetak Kartu
          </Link>
        </div>
      </div>

      {/* Profil & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Kolom Kiri: Profil & Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Profil */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden flex-1 flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={16} /></span>
                Profil Pemilik
              </h2>
              <Link href="/profil" className="text-xs text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded-md">
                Edit
              </Link>
            </div>
            <div className="space-y-5 text-sm mt-5 flex-1">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="text-lg font-bold text-gray-900 leading-snug">{pemilik.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">NIK</p>
                <p className="text-base font-mono text-gray-900 font-semibold tracking-wider">{pemilik.nik}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Alamat</p>
                <p className="text-base text-gray-850 font-medium leading-relaxed">
                  {pemilik.alamat_detail}
                </p>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                  Desa {pemilik.master_desa?.nama_desa || '...'}, Kec. {pemilik.master_desa?.kecamatan || '...'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 relative z-10">Total Ternak</p>
              <div className="flex items-end gap-1.5 relative z-10">
                <span className="text-3xl font-extrabold text-gray-900 leading-none">{ternakList?.length ?? 0}</span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium mb-0.5">Ekor</span>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <p className="text-[10px] sm:text-xs font-bold text-green-600 uppercase tracking-wider mb-1 relative z-10">Hidup</p>
              <div className="flex items-end gap-1.5 relative z-10">
                <span className="text-3xl font-extrabold text-green-700 leading-none">{totalHidup}</span>
                <span className="text-xs sm:text-sm text-green-600/70 font-medium mb-0.5">Ekor</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <p className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-wider mb-1 relative z-10">Mati</p>
              <div className="flex items-end gap-1.5 relative z-10">
                <span className="text-3xl font-extrabold text-red-600 leading-none">{totalMati}</span>
                <span className="text-xs sm:text-sm text-red-500/70 font-medium mb-0.5">Ekor</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <p className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider mb-1 relative z-10">Dijual</p>
              <div className="flex items-end gap-1.5 relative z-10">
                <span className="text-3xl font-extrabold text-amber-600 leading-none">{totalDijual}</span>
                <span className="text-xs sm:text-sm text-amber-600/70 font-medium mb-0.5">Ekor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tabel Ternak */}
        <div className="lg:col-span-9 flex flex-col">
          {/* Tabel Ternak Terkini */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Daftar Ternak</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(ternakList?.length ?? 0) > 5 ? "Menampilkan 5 ternak terbaru Anda" : "Menampilkan semua ternak Anda"}
                </p>
              </div>
            </div>
            <div className="p-5 overflow-x-auto flex-1">
              <TernakTable data={(ternakList ?? []).slice(0, 5)} isAdmin={false} hideKelamin={true} />
              
              {(ternakList?.length ?? 0) > 5 && (
                <div className="mt-4 text-center pt-2">
                  <Link href="/ternak" className="inline-flex items-center justify-center text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors">
                    Lihat Semua {ternakList?.length} Ternak &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
