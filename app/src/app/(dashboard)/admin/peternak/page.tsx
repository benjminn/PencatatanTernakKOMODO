import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Users, Eye, Edit } from 'lucide-react'
import DeletePeternakButton from '@/components/admin/DeletePeternakButton'
import PeternakFilterBar from '@/components/admin/PeternakFilterBar'
import Pagination from '@/components/ui/Pagination'
import SortableHeader from '@/components/ui/SortableHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Data Peternak' }

export default async function AdminPeternakPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; desa?: string; page?: string; sortField?: string; sortOrder?: string; limit?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const itemsPerPage = parseInt(params.limit || '15', 10)

  let query = supabase
    .from('pemilik')
    .select('*, master_desa!inner(nama_desa)', { count: 'exact' })
    .eq('role', 'peternak')

  if (params.search) {
    query = query.or(`nama_lengkap.ilike.%${params.search}%,nik.ilike.%${params.search}%`)
  }
  if (params.desa) {
    query = query.eq('master_desa.nama_desa', params.desa)
  }

  // Handle Sorting
  const sortField = params.sortField || 'created_at'
  const sortOrder = params.sortOrder || 'desc'
  const ascending = sortOrder === 'asc'

  // Add pagination & sorting
  query = query
    .order(sortField, { ascending })
    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

  // Run queries in parallel
  const [{ data: peternak, count }, { data: ternakCounts }] = await Promise.all([
    query,
    supabase.from('ternak').select('id_pemilik'),
  ])
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

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

      <PeternakFilterBar currentParams={params} />

      {peternak && peternak.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12 text-center">No.</th>
                <th><SortableHeader label="Nama Peternak" field="nama_lengkap" /></th>
                <th><SortableHeader label="NIK" field="nik" /></th>
                <th>Desa</th>
                <th>Detail Alamat</th>
                <th>Ternak</th>
                <th><SortableHeader label="Terdaftar" field="created_at" /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {peternak.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-center font-medium text-gray-500">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-green-100 text-green-800 shrink-0">
                        {p.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <Link href={`/admin/peternak/${p.id}`} className="font-semibold text-blue-600 hover:underline">
                        {p.nama_lengkap}
                      </Link>
                    </div>
                  </td>
                  <td><code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{p.nik}</code></td>
                  <td className="text-gray-700">{p.master_desa?.nama_desa || '...'}</td>
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
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/peternak/${p.id}`} className="btn btn-ghost btn-sm">
                        <Eye size={13} /> Detail
                      </Link>
                      <Link href={`/admin/peternak/${p.id}/edit`} className="btn btn-ghost btn-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                        <Edit size={13} /> Edit
                      </Link>
                      <DeletePeternakButton peternakId={p.id} namaPeternak={p.nama_lengkap} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
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
