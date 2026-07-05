'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, getFirstZodError } from '@/lib/validations/schemas'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const rawData = {
    nama_lengkap: formData.get('nama_lengkap') as string,
    id_desa: formData.get('id_desa') as string,
    alamat_detail: formData.get('alamat_detail') as string,
  }

  const parsed = profileSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  const { error } = await supabase
    .from('pemilik')
    .update({
      nama_lengkap: parsed.data.nama_lengkap,
      id_desa: parsed.data.id_desa,
      alamat_detail: parsed.data.alamat_detail,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Update profile error:', error)
    return { error: 'Gagal mengupdate profil. Silakan coba lagi.' }
  }

  revalidatePath('/profil')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}
