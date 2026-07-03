import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, MapPin, Phone, Hash } from 'lucide-react'
import TernakTable from '@/components/ternak/TernakTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik, error: pemilikError } = await supabase
    .from('pemilik')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Jika pemilik belum ada (trigger belum berjalan), tampilkan pesan bukan redirect loop
  if (!pemilik) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card text-center max-w-md">
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Akun Sedang Disiapkan
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Profil Anda sedang dibuat. Jika ini berlangsung lebih dari 1 menit, 
            hubungi admin atau coba logout dan login ulang.
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-disabled)' }}>
            User ID: {user!.id.substring(0, 8)}...
          </p>
        </div>
      </div>
    )
  }

  // Admin redirect to admin dashboard
  if (pemilik.role === 'admin') {
    redirect('/admin/dashboard')
  }

  // Fetch user's ternak
  const { data: ternakList } = await supabase
    .from('v_ternak_lengkap')
    .select('*')
    .eq('nik', pemilik.nik)
    .order('created_at', { ascending: false })

  const totalHidup = ternakList?.filter((t) => t.status_hidup).length ?? 0
  const totalMati = ternakList?.filter((t) => !t.status_hidup).length ?? 0

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-800), var(--color-primary-700))',
          border: '1px solid var(--color-primary-600)',
        }}
      >
        <div className="relative z-10">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Halo, {pemilik.nama_lengkap.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-primary-300)' }}>
            Pantau dan kelola data ternak Anda di sini.
          </p>
        </div>
        <div
          className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
          style={{ background: 'var(--color-primary-400)' }}
        />
      </div>

      {/* Profile Card + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile */}
        <div className="card md:col-span-2">
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Profil Pemilik
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Hash size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>NIK:</span>
              <span className="font-mono font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {pemilik.nik}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-primary)' }}>
                {pemilik.alamat_detail}, Desa {pemilik.alamat_desa}, Kec. {pemilik.alamat_kec}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          <div className="stats-card">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Total Ternak
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
              {ternakList?.length ?? 0}
            </p>
          </div>
          <div className="stats-card">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Hidup / Mati
            </p>
            <p className="text-2xl font-bold mt-1">
              <span style={{ color: 'var(--color-hidup)' }}>{totalHidup}</span>
              <span style={{ color: 'var(--color-text-disabled)' }}> / </span>
              <span style={{ color: 'var(--color-mati)' }}>{totalMati}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Ternak Table */}
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">Daftar Ternak</h2>
            <p className="page-subtitle">Semua hewan ternak yang terdaftar atas nama Anda</p>
          </div>
          <Link href="/ternak/tambah" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            Tambah Ternak
          </Link>
        </div>
        <TernakTable data={ternakList ?? []} isAdmin={false} />
      </div>
    </div>
  )
}
