import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KartuTernakClient from '@/components/kartu/KartuTernakClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kartu Kepemilikan Ternak' }

export default async function KartuTernakPage({
  searchParams,
}: {
  searchParams: Promise<{ nik?: string }>
}) {
  const { nik } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cek apakah user yang login adalah admin
  const { data: currentUser } = await supabase
    .from('pemilik')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  let query = supabase.from('pemilik').select('*, master_desa(nama_desa, kecamatan)')
  
  if (nik && !isAdmin) {
    redirect('/kartu-ternak') // Paksa hilangkan NIK dari URL jika bukan admin
  }

  if (nik && isAdmin) {
    query = query.eq('nik', nik)
  } else {
    query = query.eq('id', user.id)
  }

  const { data: rawPemilik } = await query.single()

  if (!rawPemilik) {
    return (
      <div className="empty-state">
        <p className="text-lg font-semibold">Peternak tidak ditemukan</p>
        <p className="text-sm text-gray-500 mt-1">Hubungi admin atau periksa kembali data Anda.</p>
      </div>
    )
  }

  const pemilik = {
    ...rawPemilik,
    alamat_desa: rawPemilik.master_desa?.nama_desa || '...',
    alamat_kec: rawPemilik.master_desa?.kecamatan || '...'
  }

  const { data: ternakList } = await supabase
    .from('v_ternak_lengkap')
    .select('*')
    .eq('id_pemilik', pemilik.id)
    .eq('status', 'hidup')
    .order('nama_jenis')

  let pemilikList: any[] = []
  if (isAdmin) {
    const { data: pList } = await supabase
      .from('pemilik')
      .select('*, master_desa(nama_desa, kecamatan)')
      .eq('role', 'peternak')
      .order('nama_lengkap')
    pemilikList = (pList ?? []).map(p => ({
      ...p,
      alamat_desa: p.master_desa?.nama_desa || '...',
      alamat_kec: p.master_desa?.kecamatan || '...'
    }))
  }

  return (
    <KartuTernakClient
      pemilik={pemilik}
      ternakList={ternakList ?? []}
      isAdmin={isAdmin}
      pemilikList={pemilikList}
    />
  )
}
