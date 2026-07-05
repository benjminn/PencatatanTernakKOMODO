import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, Edit, Printer } from 'lucide-react'
import TernakTable from '@/components/ternak/TernakTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detail Peternak' }

export default async function AdminPeternakDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  const { data: peternak } = await supabase
    .from('pemilik').select('*, master_desa(nama_desa, kecamatan)').eq('id', id).single()

  if (!peternak) {
    return (
      <div className="max-w-4xl pb-8 text-center pt-10">
        <p className="text-gray-500">Peternak tidak ditemukan.</p>
        <Link href="/admin/peternak" className="text-blue-600 hover:underline mt-2 inline-block">Kembali</Link>
      </div>
    )
  }

  const { data: ternakList } = await supabase
    .from('v_ternak_lengkap')
    .select('*')
    .eq('nik', peternak.nik)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-full pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/peternak" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Detail Peternak</h1>
          <p className="page-subtitle">Informasi profil dan seluruh ternak milik peternak</p>
        </div>
      </div>

      {/* Profil Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
              {peternak.nama_lengkap.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{peternak.nama_lengkap}</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <code className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">{peternak.nik}</code>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                <span>Desa {peternak.master_desa?.nama_desa || '...'}, Kec. {peternak.master_desa?.kecamatan || '...'}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500 italic max-w-md">{peternak.alamat_detail}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href={`/kartu-ternak?nik=${peternak.nik}`} className="btn btn-ghost border border-gray-200">
              <Printer size={16} /> Cetak Kartu
            </Link>
            <Link href={`/admin/peternak/${peternak.id}/edit`} className="btn btn-primary">
              <Edit size={16} /> Edit Profil
            </Link>
          </div>
        </div>
      </div>

      {/* Ternak List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          Daftar Ternak ({ternakList?.length || 0})
        </h3>
        <TernakTable data={ternakList || []} isAdmin={true} hideKelamin={false} />
      </div>

    </div>
  )
}
