import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TernakTable from '@/components/ternak/TernakTable'
import TernakFilterBar from '@/components/ternak/TernakFilterBar'
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
}

export default async function TernakPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik').select('*').eq('id', user.id).single()
  if (!pemilik) redirect('/login')

  const isAdmin = pemilik.role === 'admin'
  const params = await searchParams

  let query = supabase.from('v_ternak_lengkap').select('*')

  // Non-admin: only own livestock
  if (!isAdmin) {
    query = query.eq('nik', pemilik.nik)
  }

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

  const { data: ternakList } = await query.order('created_at', { ascending: false })

  // Fetch jenis ternak for filter dropdown
  const { data: jenisList } = await supabase
    .from('master_jenis_ternak')
    .select('id, nama_jenis')
    .eq('is_active', true)

  return (
    <div className="space-y-4 max-w-full pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAdmin ? 'Semua Data Ternak' : 'Ternak Saya'}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? `Total ${ternakList?.length ?? 0} ekor dari semua desa`
              : `Total ${ternakList?.length ?? 0} ekor terdaftar atas nama Anda`}
          </p>
        </div>
        <Link href="/ternak/tambah" className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          Tambah Ternak
        </Link>
      </div>

      {/* Filter Bar */}
      <TernakFilterBar
        isAdmin={isAdmin}
        jenisList={jenisList ?? []}
        currentParams={params}
      />

      {/* Table */}
      <TernakTable data={ternakList ?? []} isAdmin={isAdmin} />
    </div>
  )
}
