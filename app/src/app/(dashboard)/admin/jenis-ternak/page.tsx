import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JenisTernakManager from '@/components/admin/JenisTernakManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Master Jenis Ternak' }

export default async function JenisTernakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'admin') redirect('/dashboard')

  const { data: jenisList } = await supabase
    .from('master_jenis_ternak')
    .select('*')
    .order('nama_jenis')

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Jenis Ternak</h1>
          <p className="page-subtitle">Kelola daftar jenis hewan dan opsi jenis kelamin</p>
        </div>
      </div>
      <JenisTernakManager initialList={jenisList ?? []} />
    </div>
  )
}
