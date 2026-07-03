'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ternakSchema, updateTernakSchema, getFirstZodError } from '@/lib/validations/schemas'

// ──────────────────────────────────────────────
// TAMBAH TERNAK
// ──────────────────────────────────────────────
export async function tambahTernak(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const rawData = {
    no_eartag: formData.get('no_eartag') as string,
    id_jenis: formData.get('id_jenis'),        // z.coerce.number handles conversion
    jenis_kelamin: formData.get('jenis_kelamin') as string,
    umur: formData.get('umur') as string || undefined,
    berat_badan: formData.get('berat_badan'),  // z.preprocess handles conversion
    status_hidup: true,
  }

  const parsed = ternakSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  // Check eartag uniqueness
  const { data: existing } = await supabase
    .from('ternak')
    .select('no_eartag')
    .eq('no_eartag', parsed.data.no_eartag)
    .maybeSingle()

  if (existing) {
    return { error: `No. Eartag "${parsed.data.no_eartag}" sudah digunakan. Gunakan nomor yang berbeda.` }
  }

  const { error } = await supabase.from('ternak').insert({
    no_eartag: parsed.data.no_eartag,
    id_pemilik: user.id,
    id_jenis: parsed.data.id_jenis,
    jenis_kelamin: parsed.data.jenis_kelamin,
    umur: parsed.data.umur || null,
    berat_badan: parsed.data.berat_badan ?? null,
    status_hidup: true,
  })

  if (error) {
    console.error('Tambah ternak error:', error)
    return { error: 'Gagal menambahkan ternak. Silakan coba lagi.' }
  }

  revalidatePath('/ternak')
  return { success: true }
}

// ──────────────────────────────────────────────
// UPDATE TERNAK
// ──────────────────────────────────────────────
export async function updateTernak(eartag: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const rawData = {
    umur: formData.get('umur') as string || undefined,
    berat_badan: formData.get('berat_badan') as string || undefined,
    status_hidup: formData.get('status_hidup') === 'true',
  }

  const parsed = updateTernakSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  const { error } = await supabase
    .from('ternak')
    .update({
      umur: parsed.data.umur || null,
      berat_badan: parsed.data.berat_badan ?? null,
      status_hidup: parsed.data.status_hidup,
    })
    .eq('no_eartag', eartag)

  if (error) {
    return { error: 'Gagal mengupdate data ternak.' }
  }

  revalidatePath('/ternak')
  revalidatePath(`/ternak/${eartag}/edit`)
  return { success: true }
}

// ──────────────────────────────────────────────
// HAPUS TERNAK (Admin only)
// ──────────────────────────────────────────────
export async function hapusTernak(eartag: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('ternak')
    .delete()
    .eq('no_eartag', eartag)

  if (error) {
    return { error: 'Gagal menghapus data ternak.' }
  }

  revalidatePath('/ternak')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ──────────────────────────────────────────────
// GET TERNAK LIST (for current user)
// ──────────────────────────────────────────────
export async function getTernakByUser() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Tidak terautentikasi' }

  const { data, error } = await supabase
    .from('v_ternak_lengkap')
    .select('*')
    .eq('nik', (await supabase.from('pemilik').select('nik').eq('id', user.id).single()).data?.nik ?? '')
    .order('created_at', { ascending: false })

  return { data, error: error?.message }
}
