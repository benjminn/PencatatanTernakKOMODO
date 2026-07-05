'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function changeUserRole(userId: string, newRole: 'peternak' | 'admin') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  // Pastikan yang request adalah superadmin
  const { data: me } = await supabase
    .from('pemilik')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!me || me.role !== 'superadmin') {
    return { error: 'Akses ditolak: Hanya superadmin yang dapat mengubah role.' }
  }

  // Jangan izinkan mengubah role sendiri
  if (user.id === userId) {
    return { error: 'Tidak dapat mengubah role akun sendiri.' }
  }

  const { error } = await supabase
    .from('pemilik')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error changing role:', error)
    return { error: 'Gagal mengubah role. Pastikan Anda memiliki akses.' }
  }

  revalidatePath('/admin/kelola-admin')
  revalidatePath('/admin/peternak')
  return { success: true }
}
