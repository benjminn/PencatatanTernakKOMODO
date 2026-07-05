'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getWilayahData() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('master_desa')
    .select('id, kecamatan, nama_desa')
    .order('kecamatan')
    .order('nama_desa')
    
  if (error || !data || data.length === 0) {
    // Robust Fallback in case master_desa table does not exist or has no rows
    const fallbackData = {
      kecamatanList: ['Komodo'],
      wilayahData: {
        'Komodo': [
          { id: '00000000-0000-0000-0000-000000000001', nama_desa: 'Golo Mori' }, 
          { id: '00000000-0000-0000-0000-000000000002', nama_desa: 'Warloka' }
        ]
      },
      rawData: []
    }
    return fallbackData
  }

  const wilayahData: Record<string, { id: string, nama_desa: string }[]> = {}
  data.forEach((row) => {
    if (!wilayahData[row.kecamatan]) {
      wilayahData[row.kecamatan] = []
    }
    wilayahData[row.kecamatan].push({ id: row.id, nama_desa: row.nama_desa })
  })

  return {
    kecamatanList: Object.keys(wilayahData).sort(),
    wilayahData,
    rawData: data
  }
}

export async function tambahDesa(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check admin
  const { data: me } = await supabase.from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) return { error: 'Forbidden' }

  const kecamatan = formData.get('kecamatan') as string
  const nama_desa = formData.get('nama_desa') as string

  if (!kecamatan || !nama_desa) return { error: 'Kecamatan dan Nama Desa wajib diisi' }

  const { error } = await supabase
    .from('master_desa')
    .insert({
      kecamatan: kecamatan.trim(),
      nama_desa: nama_desa.trim()
    })

  if (error) {
    if (error.code === '23505') return { error: 'Desa tersebut sudah ada di kecamatan ini.' }
    return { error: error.message }
  }

  revalidatePath('/admin/lokasi')
  return { success: true }
}

export async function hapusDesa(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check admin
  const { data: me } = await supabase.from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) return { error: 'Forbidden' }

  const { error } = await supabase.from('master_desa').delete().eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/admin/lokasi')
  return { success: true }
}
