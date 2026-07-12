import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import StatistikDashboard from '@/components/admin/StatistikDashboard'

export const metadata: Metadata = { title: 'Dasbor Statistik' }

export default async function AdminStatistikPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if admin
  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) redirect('/dashboard')

  // Fetch all ternak data (we want everything for statistics)
  // We use select('*') without pagination because we need the full dataset for charts.
  // In a very large scale application (100k+ rows), this should be aggregated in SQL view.
  // But for this scale, client-side aggregation after fetching is totally fine and interactive.
  // Run queries in parallel
  const [{ data: ternakData }, { count: peternakCount }] = await Promise.all([
    supabase.from('v_ternak_lengkap').select('*'),
    supabase.from('pemilik').select('*', { count: 'exact', head: true }).eq('role', 'peternak'),
  ])

  return (
    <div className="w-full pb-8">
      <StatistikDashboard 
        ternakData={ternakData ?? []} 
        peternakCount={peternakCount ?? 0}
      />
    </div>
  )
}
