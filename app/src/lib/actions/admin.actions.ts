'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getFirstZodError } from '@/lib/validations/schemas'

const updatePeternakSchema = z.object({
  nik: z.string().min(16, 'NIK minimal 16 karakter').max(16, 'NIK maksimal 16 karakter'),
  nama_lengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  alamat_desa: z.string().min(1, 'Desa wajib diisi'),
  alamat_kec: z.string().min(1, 'Kecamatan wajib diisi'),
  alamat_detail: z.string().min(5, 'Detail alamat terlalu singkat'),
})

export async function updatePeternakAsAdmin(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  // Check admin
  const { data: me } = await supabase
    .from('pemilik')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) {
    return { error: 'Akses ditolak: Hanya admin yang dapat mengedit peternak.' }
  }

  const rawData = {
    nik: formData.get('nik'),
    nama_lengkap: formData.get('nama_lengkap'),
    alamat_desa: formData.get('alamat_desa'),
    alamat_kec: formData.get('alamat_kec'),
    alamat_detail: formData.get('alamat_detail'),
  }

  const parsed = updatePeternakSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  // Cek apakah NIK sudah dipakai oleh peternak lain
  const { data: existingUser } = await supabase
    .from('pemilik')
    .select('id')
    .eq('nik', parsed.data.nik)
    .neq('id', id)
    .maybeSingle()

  if (existingUser) {
    return { error: 'NIK tersebut sudah didaftarkan pada akun lain.' }
  }

  const { error } = await supabase
    .from('pemilik')
    .update({
      nik: parsed.data.nik,
      nama_lengkap: parsed.data.nama_lengkap,
      alamat_desa: parsed.data.alamat_desa,
      alamat_kec: parsed.data.alamat_kec,
      alamat_detail: parsed.data.alamat_detail,
    })
    .eq('id', id)

  if (error) {
    console.error('Update Peternak Error:', error)
    return { error: 'Gagal memperbarui data peternak.' }
  }

  revalidatePath('/admin/peternak')
  revalidatePath(`/admin/peternak/${id}`)
  revalidatePath(`/admin/peternak/${id}/edit`)
  return { success: true }
}

export async function hapusPeternak(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: me } = await supabase
    .from('pemilik')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) {
    return { error: 'Akses ditolak.' }
  }

  const { error } = await supabase
    .from('pemilik')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Gagal menghapus data peternak.' }
  }

  revalidatePath('/admin/peternak')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
