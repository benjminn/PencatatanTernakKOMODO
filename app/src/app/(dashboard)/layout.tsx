import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: pemilik } = await supabase
    .from('pemilik')
    .select('*')
    .eq('id', user.id)
    .single()

  // Jika pemilik tidak ada, kita tetap render layout,
  // biar dashboard/page.tsx yang menampilkan pesan "Akun Sedang Disiapkan"
  // Kalau kita redirect('/login') di sini, akan jadi infinite loop (middleware redirect kembali ke dashboard)
  
  // Default values untuk Sidebar dan Navbar jika pemilik belum ter-create
  const role = pemilik?.role || 'peternak'
  const namaPemilik = pemilik?.nama_lengkap || 'Pengguna Baru'
  const safePemilik = pemilik || { 
    id: user.id, 
    nik: '---', 
    nama_lengkap: namaPemilik, 
    role, 
    alamat_desa: '---', 
    alamat_kec: '---', 
    alamat_detail: '---' 
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — hidden on mobile */}
      <Sidebar role={safePemilik.role as any} namaPemilik={safePemilik.nama_lengkap} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar pemilik={safePemilik as any} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
