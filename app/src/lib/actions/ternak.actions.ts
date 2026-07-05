'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ternakSchema, updateTernakSchema, getFirstZodError, formatUmur } from '@/lib/validations/schemas'
import { z } from 'zod'

// ──────────────────────────────────────────────
// TAMBAH TERNAK
// ──────────────────────────────────────────────
export async function tambahTernak(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const rawData = {
    jenis_penanda: formData.get('jenis_penanda') as string,
    identitas_penanda: formData.get('identitas_penanda') as string || null,
    id_jenis: formData.get('id_jenis'),
    fase: formData.get('fase') as string || null,
    jenis_kelamin: formData.get('jenis_kelamin') as string || null,
    umur_tahun: formData.get('umur_tahun'),
    umur_bulan: formData.get('umur_bulan'),
    berat_badan: formData.get('berat_badan'),
    status: 'hidup',
  }

  const parsed = ternakSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  const today = new Date()
  const tanggal_lahir = new Date(
    today.getFullYear() - parsed.data.umur_tahun,
    today.getMonth() - parsed.data.umur_bulan,
    today.getDate()
  ).toISOString().split('T')[0]

  // Determine owner
  let id_pemilik = user.id
  const req_id_pemilik = formData.get('id_pemilik') as string
  if (req_id_pemilik) {
    const { data: me } = await supabase.from('pemilik').select('role').eq('id', user.id).single()
    if (me && (me.role === 'admin' || me.role === 'superadmin')) {
      id_pemilik = req_id_pemilik
    }
  }

  const { error } = await supabase.from('ternak').insert({
    jenis_penanda: parsed.data.jenis_penanda,
    identitas_penanda: parsed.data.identitas_penanda,
    id_pemilik: id_pemilik,
    id_jenis: parsed.data.id_jenis,
    fase: parsed.data.fase,
    jenis_kelamin: parsed.data.jenis_kelamin,
    tanggal_lahir: tanggal_lahir,
    berat_badan: parsed.data.berat_badan ?? null,
    status: 'hidup',
  })

  if (error) {
    console.error('Tambah ternak error:', error)
    return { error: 'Gagal menambahkan ternak. Silakan coba lagi.' }
  }

  revalidatePath('/ternak')
  revalidatePath('/dashboard')
  return { success: true }
}

// ──────────────────────────────────────────────
// TAMBAH TERNAK BULK (Admin only)
// ──────────────────────────────────────────────
export async function tambahTernakBulk(dataArray: any[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  // Check admin
  const { data: me } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()
  if (!me || (me.role !== 'admin' && me.role !== 'superadmin')) {
    return { error: 'Akses ditolak: Hanya admin yang dapat mengimpor massal.' }
  }

  const validDataToInsert = []
  const today = new Date()

  for (let i = 0; i < dataArray.length; i++) {
    const rawData = dataArray[i]
    const parsed = ternakSchema.safeParse(rawData)
    
    if (!parsed.success) {
      return { error: `Baris ke-${i + 1} gagal validasi: ${getFirstZodError(parsed.error)}` }
    }

    if (!rawData.id_pemilik) {
      return { error: `Baris ke-${i + 1} gagal: NIK peternak tidak valid atau tidak ditemukan di sistem.` }
    }

    const tanggal_lahir = new Date(
      today.getFullYear() - parsed.data.umur_tahun,
      today.getMonth() - parsed.data.umur_bulan,
      today.getDate()
    ).toISOString().split('T')[0]

    validDataToInsert.push({
      jenis_penanda: parsed.data.jenis_penanda,
      identitas_penanda: parsed.data.identitas_penanda,
      id_pemilik: rawData.id_pemilik,
      id_jenis: parsed.data.id_jenis,
      fase: parsed.data.fase,
      jenis_kelamin: parsed.data.jenis_kelamin,
      tanggal_lahir: tanggal_lahir,
      berat_badan: parsed.data.berat_badan ?? null,
      status: 'hidup',
    })
  }

  if (validDataToInsert.length === 0) {
    return { error: 'Tidak ada data valid untuk disimpan.' }
  }

  const { error } = await supabase.from('ternak').insert(validDataToInsert)

  if (error) {
    console.error('Bulk insert error:', error)
    return { error: 'Terjadi kesalahan sistem saat menyimpan data massal.' }
  }

  revalidatePath('/ternak')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/peternak')
  return { success: true }
}

// ──────────────────────────────────────────────
// UPDATE TERNAK
// ──────────────────────────────────────────────
export async function updateTernak(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const rawData = {
    jenis_penanda: formData.get('jenis_penanda') as string,
    identitas_penanda: formData.get('identitas_penanda') as string || null,
    fase: formData.get('fase') as string || null,
    jenis_kelamin: formData.get('jenis_kelamin') as string || null,
    umur_tahun: formData.get('umur_tahun'),
    umur_bulan: formData.get('umur_bulan'),
    berat_badan: formData.get('berat_badan') as string || undefined,
    status: formData.get('status') as string,
  }

  const parsed = updateTernakSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  const today = new Date()
  const tanggal_lahir = new Date(
    today.getFullYear() - parsed.data.umur_tahun,
    today.getMonth() - parsed.data.umur_bulan,
    today.getDate()
  ).toISOString().split('T')[0]

  const { error } = await supabase
    .from('ternak')
    .update({
      jenis_penanda: parsed.data.jenis_penanda,
      identitas_penanda: parsed.data.identitas_penanda,
      fase: parsed.data.fase,
      jenis_kelamin: parsed.data.jenis_kelamin,
      tanggal_lahir: tanggal_lahir,
      berat_badan: parsed.data.berat_badan ?? null,
      status: parsed.data.status,
    })
    .eq('id', id)

  if (error) {
    return { error: 'Gagal mengupdate data ternak.' }
  }

  revalidatePath('/ternak')
  revalidatePath('/dashboard')
  revalidatePath(`/ternak/${id}/edit`)
  return { success: true }
}

// ──────────────────────────────────────────────
// HAPUS TERNAK (Admin & Owner)
// ──────────────────────────────────────────────
export async function hapusTernak(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('ternak')
    .delete()
    .eq('id', id)

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
