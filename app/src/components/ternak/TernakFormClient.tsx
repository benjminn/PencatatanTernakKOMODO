'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { tambahTernak, updateTernak } from '@/lib/actions/ternak.actions'
import { parseTanggalLahirToUmur } from '@/lib/validations/schemas'
import type { JenisTernak, StatusTernak } from '@/types/database.types'
import { Loader2, Save, Heart, XCircle, DollarSign, Mars, Venus, Dna, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface TernakFormClientProps {
  jenisList: JenisTernak[]
  mode: 'tambah' | 'edit'
  initialData?: {
    id: string
    jenis_penanda: string
    identitas_penanda: string | null
    id_jenis: number
    fase: string | null
    jenis_kelamin: string | null
    tanggal_lahir: string | null
    berat_badan: number | null
    status: StatusTernak
  }
  adminIdPemilik?: string
}

const STATUS_OPTIONS = [
  { value: 'hidup', label: 'Hidup', icon: Heart, activeClass: 'border-green-600 bg-green-50 text-green-700 ring-2 ring-green-600/20' },
  { value: 'mati', label: 'Mati', icon: XCircle, activeClass: 'border-red-500 bg-red-50 text-red-600 ring-2 ring-red-500/20' },
  { value: 'dijual', label: 'Dijual', icon: DollarSign, activeClass: 'border-amber-500 bg-amber-50 text-amber-600 ring-2 ring-amber-500/20' },
] as const

export default function TernakFormClient({ jenisList, mode, initialData, adminIdPemilik }: TernakFormClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [selectedJenis, setSelectedJenis] = useState<JenisTernak | null>(
    initialData ? jenisList.find((j) => j.id === initialData.id_jenis) ?? null : null
  )

  const parsedUmur = parseTanggalLahirToUmur(initialData?.tanggal_lahir ?? null)
  const [fase, setFase] = useState<string | null>(initialData?.fase ?? null)
  const [jenisKelamin, setJenisKelamin] = useState<string | null>(initialData?.jenis_kelamin ?? null)
  const [status, setStatus] = useState<StatusTernak>(initialData?.status ?? 'hidup')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let result = mode === 'tambah'
        ? await tambahTernak(formData)
        : await updateTernak(initialData!.id, formData)

      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(mode === 'tambah' ? 'Ternak berhasil ditambahkan!' : 'Data ternak berhasil diperbarui!')
        router.push('/ternak')
      }
    })
  }

  const opsiKelamin = selectedJenis?.opsi_kelamin ?? []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {adminIdPemilik && <input type="hidden" name="id_pemilik" value={adminIdPemilik} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* --- KOLOM KIRI: IDENTIFIKASI --- */}
        <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-gray-100">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><Dna size={18} strokeWidth={2.5} /></div>
            <h3 className="font-semibold text-gray-800">Identifikasi Hewan</h3>
          </div>

          {/* Penanda */}
          <div className="space-y-2">
            <label className="form-label">
              Identitas Penanda <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all bg-white">
              <select
                name="jenis_penanda"
                className="py-2.5 px-3 bg-gray-50 text-sm border-0 border-b sm:border-b-0 sm:border-r border-gray-300 focus:outline-none focus:ring-0 w-full sm:w-[150px] shrink-0 font-medium text-gray-700"
                required
                disabled={isPending}
                defaultValue={initialData?.jenis_penanda ?? 'Eartag'}
              >
                <option value="Eartag">Eartag</option>
                <option value="Potong Telinga">Potong Telinga</option>
                <option value="Hidung">Hidung</option>
                <option value="Kalung">Kalung Biasa</option>
                <option value="Kalung Bell">Kalung Bell</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <input
                name="identitas_penanda"
                type="text"
                placeholder="Kode / Warna (Contoh: GM-001/ Telinga Kanan/ Merah) (opsional)"
                className="py-2.5 px-3 w-full text-sm border-0 focus:outline-none focus:ring-0 flex-1 bg-transparent"
                disabled={isPending}
                defaultValue={initialData?.identitas_penanda ?? ''}
              />
            </div>
          </div>

          {/* Jenis Hewan */}
          <div>
            <label htmlFor="id_jenis" className="form-label">
              Jenis Hewan <span className="text-red-500">*</span>
            </label>
            <select
              id="id_jenis" name="id_jenis" className="form-input"
              required disabled={mode === 'edit' || isPending}
              defaultValue={initialData?.id_jenis ?? ''}
              onChange={(e) => {
                const jenis = jenisList.find((j) => j.id === parseInt(e.target.value))
                setSelectedJenis(jenis ?? null)
              }}
            >
              <option value="">Pilih jenis hewan...</option>
              {jenisList.map((j) => (
                <option key={j.id} value={j.id}>{j.nama_jenis}</option>
              ))}
            </select>
          </div>

          {/* Fase Ternak */}
          <div>
            <label className="form-label flex justify-between items-center">
              <span>Fase Kehidupan</span>
              <span className="text-gray-400 text-xs font-normal">Opsional</span>
            </label>
            <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl border border-gray-200/60">
              {['Indukan', 'Pejantan', 'Anakan'].map((f) => (
                <label
                  key={f}
                  className="flex-1 flex items-center justify-center cursor-pointer px-2 py-2 rounded-lg transition-all text-sm font-semibold text-gray-600 has-[:checked]:bg-white has-[:checked]:text-green-700 has-[:checked]:shadow-sm"
                >
                  <input
                    type="radio" name="fase" value={f}
                    checked={fase === f}
                    onChange={(e) => {
                      const val = e.target.value
                      setFase(val)
                      if (val === 'Indukan') setJenisKelamin('Betina')
                      if (val === 'Pejantan') setJenisKelamin('Jantan')
                    }}
                    disabled={isPending}
                    className="sr-only"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="form-label flex justify-between items-center">
              <span>Jenis Kelamin</span>
              <span className="text-gray-400 text-xs font-normal">Opsional</span>
            </label>
            {opsiKelamin.length > 0 ? (
              <div className="flex gap-3">
                {opsiKelamin.map((opsi) => (
                  <label
                    key={opsi}
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:text-green-700"
                  >
                    <input
                      type="radio" name="jenis_kelamin" value={opsi}
                      checked={jenisKelamin === opsi}
                      onChange={() => setJenisKelamin(opsi)}
                      disabled={mode === 'edit' || isPending}
                      className="sr-only"
                    />
                    {opsi === 'Jantan' && <Mars size={18} className="text-blue-500 opacity-80" />}
                    {opsi === 'Betina' && <Venus size={18} className="text-pink-500 opacity-80" />}
                    {opsi}
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-sm py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 flex items-center gap-2">
                Pilih jenis hewan terlebih dahulu
              </div>
            )}
          </div>
        </div>

        {/* --- KOLOM KANAN: FISIK & STATUS --- */}
        <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Info size={18} strokeWidth={2.5} /></div>
            <h3 className="font-semibold text-gray-800">Detail Fisik & Status</h3>
          </div>

          {/* Umur */}
          <div>
            <label className="form-label">Umur Hewan (Saat ini)</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select name="umur_tahun" className="form-input pl-4 appearance-none" disabled={isPending} defaultValue={parsedUmur.tahun}>
                  {Array.from({ length: 31 }, (_, i) => <option key={i} value={i}>{i} tahun</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-semibold uppercase">Thn</div>
              </div>
              <div className="relative">
                <select name="umur_bulan" className="form-input pl-4 appearance-none" disabled={isPending} defaultValue={parsedUmur.bulan}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} bulan</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-semibold uppercase">Bln</div>
              </div>
            </div>
          </div>

          {/* Berat Badan */}
          <div>
            <label htmlFor="berat_badan" className="form-label">Berat Badan (Estimasi)</label>
            <div className="relative">
              <input
                id="berat_badan" name="berat_badan" type="number" step="0.1" min="0"
                placeholder="0.0"
                className="form-input pr-12 text-lg font-medium"
                disabled={isPending}
                defaultValue={initialData?.berat_badan ?? ''}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold uppercase">kg</span>
            </div>
          </div>

          {/* Status */}
          {mode === 'edit' && (
            <div className="pt-2">
              <label className="form-label">Status Ternak</label>
              <input type="hidden" name="status" value={status} />
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = status === opt.value
                  return (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setStatus(opt.value as StatusTernak)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-xs font-semibold
                        ${isSelected ? opt.activeClass : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Icon size={22} strokeWidth={isSelected ? 2.5 : 2} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
        <button type="button" onClick={() => router.back()} className="btn btn-ghost w-full sm:w-auto px-6" disabled={isPending}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary w-full sm:w-auto px-8 shadow-md" disabled={isPending}>
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
          ) : (
            <><Save size={18} /> {mode === 'tambah' ? 'Simpan Ternak Baru' : 'Simpan Perubahan'}</>
          )}
        </button>
      </div>
    </form>
  )
}
