import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TernakTable from '@/components/ternak/TernakTable'
import TernakFilterBar from '@/components/ternak/TernakFilterBar'
import Pagination from '@/components/ui/Pagination'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import type { Metadata } from 'next'
import type { StatusTernak } from '@/types/database.types'

export const metadata: Metadata = { title: 'Daftar Ternak' }

interface SearchParams {
  search?: string
  desa?: string
  jenis?: string
  status?: string
  page?: string
  sortField?: string
  sortOrder?: string
}

export default async function TernakPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const itemsPerPage = 15

  let query = supabase.from('v_ternak_lengkap').select('*', { count: 'exact' })

  // Filters
  if (params.search) {
    query = query.or(`identitas_penanda.ilike.%${params.search}%,nik.ilike.%${params.search}%,nama_lengkap.ilike.%${params.search}%`)
  }
  if (params.desa) {
    query = query.eq('alamat_desa', params.desa)
  }
  if (params.jenis) {
    query = query.eq('nama_jenis', params.jenis)
  }
  if (params.status && ['hidup', 'mati', 'dijual'].includes(params.status)) {
    query = query.eq('status', params.status as StatusTernak)
  }

  // Handle Sorting
  const sortField = params.sortField || 'created_at'
  const sortOrder = params.sortOrder || 'desc'
  const ascending = sortOrder === 'asc'

  // Add pagination
  query = query
    .order(sortField, { ascending })
    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

  const { data: ternakList, count } = await query
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

  // Fetch jenis ternak for filter dropdown
  const { data: jenisList } = await supabase
    .from('master_jenis_ternak')
    .select('id, nama_jenis')
    .eq('is_active', true)

  return (
    <div className="space-y-4 max-w-full pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola Semua Ternak</h1>
          <p className="page-subtitle">
            Total {count ?? 0} ekor dari semua desa
          </p>
        </div>
        <Link href="/ternak/tambah" className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          Tambah Ternak
        </Link>
      </div>

      {/* Filter Bar */}
      <TernakFilterBar
        isAdmin={true}
        jenisList={jenisList ?? []}
        currentParams={params}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <TernakTable data={ternakList ?? []} isAdmin={true} currentPage={currentPage} itemsPerPage={itemsPerPage} />
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  )
}
