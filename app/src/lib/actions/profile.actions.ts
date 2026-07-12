'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, getFirstZodError } from '@/lib/validations/schemas'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { nikToEmail } from '@/lib/utils'

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

export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Semua kolom wajib diisi.' }
  }
  if (newPassword.length < 6) {
    return { error: 'Password baru minimal 6 karakter.' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' }
  }

  // Verify current password by trying to sign in
  const { data: pemilik } = await supabase
    .from('pemilik').select('nik').eq('id', user.id).single()

  if (!pemilik) return { error: 'Data pengguna tidak ditemukan.' }

  const authClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const email = nikToEmail(pemilik.nik)
  const { error: signInError } = await authClient.auth.signInWithPassword({
    email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Password lama salah. Silakan coba lagi.' }
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    console.error('Change password error:', updateError)
    return { error: 'Gagal mengubah password. Silakan coba lagi.' }
  }

  return { success: true }
}

// Admin-only: Reset password peternak ke default "123456"
export async function resetUserPassword(targetUserId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  // Cek role admin/superadmin
  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()

  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) {
    return { error: 'Akses ditolak.' }
  }

  // Jangan izinkan reset password sendiri
  if (user.id === targetUserId) {
    return { error: 'Tidak dapat mereset password akun sendiri.' }
  }

  // Gunakan service role key untuk update password user lain
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Konfigurasi server tidak lengkap (service role key).' }
  }

  const adminClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: '123456',
  })

  if (error) {
    console.error('Reset password error:', error)
    return { error: 'Gagal mereset password. Silakan coba lagi.' }
  }

  return { success: true }
}
