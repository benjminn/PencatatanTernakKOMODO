import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, MapPin, Hash, Calendar, Trash2 } from 'lucide-react'
import DeletePeternakButton from '@/components/admin/DeletePeternakButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Data Peternak' }

export default async function AdminPeternakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'admin') redirect('/dashboard')

  const { data: peternak } = await supabase
    .from('pemilik')
    .select('*')
    .eq('role', 'peternak')
    .order('created_at', { ascending: false })

  // Count ternak per pemilik
  const { data: ternakCounts } = await supabase
    .from('ternak')
    .select('id_pemilik')

  const countMap: Record<string, number> = {}
  ternakCounts?.forEach((t) => {
    countMap[t.id_pemilik] = (countMap[t.id_pemilik] || 0) + 1
  })

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Peternak</h1>
          <p className="page-subtitle">
            {peternak?.length ?? 0} peternak terdaftar
          </p>
        </div>
        <Link href="/admin/peternak/tambah" className="btn btn-primary btn-sm">
          <UserPlus size={15} />
          Tambah Peternak
        </Link>
      </div>

      {/* Table */}
      {peternak && peternak.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Peternak</th>
                <th>NIK</th>
                <th>Desa</th>
                <th>Detail Alamat</th>
                <th>Jml Ternak</th>
                <th>Terdaftar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {peternak.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--color-primary-600)', color: 'white' }}
                      >
                        {p.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {p.nama_lengkap}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {p.nik}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {p.alamat_desa}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {p.alamat_detail}
                  </td>
                  <td>
                    <Link
                      href={`/ternak?search=${p.nik}`}
                      className="font-bold hover:underline"
                      style={{ color: 'var(--color-primary-400)' }}
                    >
                      {countMap[p.id] ?? 0} ekor
                    </Link>
                  </td>
                  <td className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(p.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <DeletePeternakButton peternakId={p.id} namaPeternak={p.nama_lengkap} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="text-5xl">👤</div>
            <p className="font-medium mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Belum ada peternak terdaftar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
