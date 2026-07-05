import { createClient } from '@/lib/supabase/server'
import LokasiClient from '@/components/admin/LokasiClient'
import { MapPin } from 'lucide-react'

export const metadata = {
  title: 'Kelola Lokasi & Wilayah',
}

export default async function AdminLokasiPage() {
  const supabase = await createClient()
  
  // Fetch wilayah data
  const { data: desaData } = await supabase
    .from('master_desa')
    .select('*')
    .order('kecamatan')
    .order('nama_desa')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={24} className="text-indigo-600" />
            Kelola Lokasi & Wilayah
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan atau hapus kecamatan dan desa operasional pencatatan ternak.
          </p>
        </div>
      </div>

      <LokasiClient initialData={desaData || []} />
    </div>
  )
}
