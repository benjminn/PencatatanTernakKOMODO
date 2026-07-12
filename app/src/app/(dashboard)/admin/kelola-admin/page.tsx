import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import RoleManagerClient from '@/components/admin/RoleManagerClient'
import KelolaAdminFilterBar from '@/components/admin/KelolaAdminFilterBar'
import Pagination from '@/components/ui/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Hak Akses' }

export default async function KelolaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  
  if (!me || me.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const itemsPerPage = 15

  let query = supabase
    .from('pemilik')
    .select('*, master_desa(nama_desa)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(`nama_lengkap.ilike.%${params.search}%,nik.ilike.%${params.search}%`)
  }

  query = query.range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

  const { data: allUsers, count } = await query
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

  return (
    <div className="space-y-6 max-w-full pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={24} /> Kelola Hak Akses
          </h1>
          <p className="page-subtitle">
            Halaman khusus Super Admin untuk mengelola hak akses pengguna
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl p-4 border border-red-200 bg-red-50">
        <h2 className="font-bold text-red-700 mb-1">Area Berbahaya (Danger Zone)</h2>
        <p className="text-sm text-red-600">
          Pengguna yang diangkat menjadi Admin akan memiliki akses untuk melihat, mengedit, dan menghapus seluruh data ternak di semua desa. Pastikan Anda hanya memberikan akses ini kepada petugas yang berwenang.
        </p>
      </div>

      <KelolaAdminFilterBar currentParams={params} />

      {allUsers && allUsers.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-12 text-center">No.</th>
                  <th>Pengguna</th>
                  <th>NIK</th>
                  <th>Desa</th>
                  <th>Terdaftar</th>
                  <th>Role & Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-center font-medium text-gray-500">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-green-100 text-green-800 shrink-0">
                          {p.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{p.nama_lengkap}</span>
                      </div>
                    </td>
                    <td><code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{p.nik}</code></td>
                    <td className="text-gray-700">{p.master_desa?.nama_desa || '...'}</td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <RoleManagerClient userId={p.id} currentRole={p.role} userName={p.nama_lengkap} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {allUsers.map((p) => (
              <div key={p.id} className="mobile-card block">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-green-100 text-green-800 shrink-0">
                      {p.nama_lengkap.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.nama_lengkap}</p>
                      <code className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">{p.nik}</code>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-3 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <p className="text-xs text-gray-400">Desa</p>
                    <p className="text-gray-700">{p.master_desa?.nama_desa || '...'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Terdaftar</p>
                    <p className="text-gray-700">{new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <RoleManagerClient userId={p.id} currentRole={p.role} userName={p.nama_lengkap} />
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p className="font-medium text-gray-500">
              {params.search ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna terdaftar'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
