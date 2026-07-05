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
    .from('pemilik').select('*').eq('id', user.id).single()

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

  return (
    <div className="space-y-6 max-w-full pb-8">
      {/* Welcome */}
      <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #166534, #15803d)', color: 'white' }}>
        <h1 className="text-lg font-bold">
          Selamat datang, {pemilik.nama_lengkap.split(' ')[0]}!
        </h1>
        <p className="text-sm mt-0.5 text-green-200">
          Pantau dan kelola data ternak Anda di sini.
        </p>
      </div>

      {/* Info + Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile snippet */}
        <div className="card sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-900">Profil Pemilik</h2>
            <Link href="/profil" className="text-xs text-green-700 font-medium hover:underline">
              Edit →
            </Link>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Hash size={14} className="text-gray-400" />
              <span>NIK:</span>
              <span className="font-mono font-semibold text-gray-900">{pemilik.nik}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <span>{pemilik.alamat_detail}, Desa {pemilik.alamat_desa}, Kec. {pemilik.alamat_kec}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-card">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Ternak</p>
          <p className="text-2xl font-bold text-gray-900">{ternakList?.length ?? 0}</p>
        </div>
        <div className="stats-card">
          <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
          <div className="flex gap-3 text-sm font-semibold mt-1">
            <span className="text-green-600">{totalHidup} hidup</span>
            <span className="text-red-500">{totalMati} mati</span>
            <span className="text-amber-600">{totalDijual} dijual</span>
          </div>
        </div>
      </div>

      {/* Ternak */}
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">Daftar Ternak</h2>
            <p className="page-subtitle">Semua hewan ternak atas nama Anda</p>
          </div>
          <Link href="/ternak/tambah" className="btn btn-primary">
            <PlusCircle size={16} /> Tambah
          </Link>
        </div>
        <TernakTable data={ternakList ?? []} isAdmin={false} />
      </div>
    </div>
  )
}
