import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KartuTernakClient from '@/components/kartu/KartuTernakClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kartu Kepemilikan Ternak' }

export default async function KartuTernakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!pemilik) {
    return (
      <div className="empty-state">
        <p className="text-lg font-semibold">Akun belum terdaftar</p>
        <p className="text-sm text-gray-500 mt-1">Hubungi admin untuk mendaftarkan data Anda.</p>
      </div>
    )
  }

  const { data: ternakList } = await supabase
    .from('v_ternak_lengkap')
    .select('*')
    .eq('id_pemilik', user.id)
    .eq('status', 'hidup')
    .order('nama_jenis')

  return (
    <KartuTernakClient
      pemilik={pemilik}
      ternakList={ternakList ?? []}
    />
  )
}
