import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Users } from 'lucide-react'
import DeletePeternakButton from '@/components/admin/DeletePeternakButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Data Peternak' }

export default async function AdminPeternakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  const { data: peternak } = await supabase
    .from('pemilik').select('*').eq('role', 'peternak').order('created_at', { ascending: false })

  const { data: ternakCounts } = await supabase.from('ternak').select('id_pemilik')
  const countMap: Record<string, number> = {}
  ternakCounts?.forEach((t) => { countMap[t.id_pemilik] = (countMap[t.id_pemilik] || 0) + 1 })

  return (
    <div className="space-y-4 max-w-full pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Peternak</h1>
          <p className="page-subtitle">{peternak?.length ?? 0} peternak terdaftar</p>
        </div>
        <Link href="/admin/peternak/tambah" className="btn btn-primary btn-sm">
          <UserPlus size={15} /> Tambah Peternak
        </Link>
      </div>

      {peternak && peternak.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Peternak</th>
                <th>NIK</th>
                <th>Desa</th>
                <th>Detail Alamat</th>
                <th>Ternak</th>
                <th>Terdaftar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {peternak.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-green-100 text-green-800 shrink-0">
                        {p.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{p.nama_lengkap}</span>
                    </div>
                  </td>
                  <td><code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{p.nik}</code></td>
                  <td className="text-gray-700">{p.alamat_desa}</td>
                  <td className="text-xs text-gray-500 max-w-[200px] truncate" title={p.alamat_detail}>
                    {p.alamat_detail}
                  </td>
                  <td>
                    <Link
                      href={`/ternak?search=${p.nik}`}
                      className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors"
                    >
                      {countMap[p.id] ?? 0} ekor
                    </Link>
                  </td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="text-right">
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
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="font-medium text-gray-600">Belum ada peternak terdaftar</p>
          </div>
        </div>
      )}
    </div>
  )
}
