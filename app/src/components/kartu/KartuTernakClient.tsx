'use client'

import { useRef, useState, useEffect } from 'react'
import { Printer, Download, Loader2 } from 'lucide-react'
import type { Pemilik, TernakLengkap } from '@/types/database.types'

interface KartuTernakClientProps {
  pemilik: Pemilik
  ternakList: TernakLengkap[]
  isAdmin?: boolean
  pemilikList?: Pemilik[]
}

import { useRouter } from 'next/navigation'

// Helper Custom Combobox Component
function PeternakCombobox({ pemilikList, onSelect, defaultValue }: { pemilikList: any[], onSelect: (nik: string) => void, defaultValue: string }) {
  const [query, setQuery] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = pemilikList.filter(p => 
    `${p.nama_lengkap} ${p.nik} ${p.alamat_desa}`.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 50)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="form-input bg-white border-green-300 focus:border-green-500 focus:ring-green-500/20 w-full placeholder:text-gray-400 font-medium"
        placeholder="Ketik nama atau NIK..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setIsOpen(true)
        }}
      />
      {isOpen && (
        <ul className="absolute z-50 w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 max-h-72 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(p => (
            <li 
              key={p.id}
              className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              onClick={() => {
                setQuery(`${p.nama_lengkap} - Desa ${p.alamat_desa}`)
                setIsOpen(false)
                onSelect(p.nik)
              }}
            >
              <div className="font-bold text-gray-900">{p.nama_lengkap}</div>
              <div className="text-xs text-gray-500 mt-0.5"><span className="font-mono">{p.nik}</span> • Desa {p.alamat_desa}</div>
            </li>
          )) : (
            <li className="px-4 py-4 text-sm text-gray-500 text-center italic">Tidak ada hasil ditemukan.</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function KartuTernakClient({ pemilik, ternakList, isAdmin, pemilikList }: KartuTernakClientProps) {
  const router = useRouter()
  const kartuRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!kartuRef.current) return
    setIsGenerating(true)

    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const jsPDF = (await import('jspdf')).default

      const canvas = await html2canvas(kartuRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Use landscape A4 if card is wider
      const pdfOrientation = imgWidth > imgHeight ? 'l' : 'p'
      const pdf = new jsPDF(pdfOrientation, 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth,
        (pdfHeight - 20) / imgHeight
      )
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      const x = (pdfWidth - finalWidth) / 2
      const y = 10

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
      pdf.save(`Kartu_Ternak_${pemilik.nama_lengkap.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Gagal membuat PDF. Silakan coba lagi.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="pb-8 w-full">
      {/* ACTION BAR — hidden on print */}
      <div className="print:hidden mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Kartu Kepemilikan Ternak</h1>
            <p className="page-subtitle">Generate dan cetak kartu kepemilikan ternak Anda</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="btn btn-ghost btn-sm">
              <Printer size={16} /> Cetak
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm" disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> Membuat PDF...</>
              ) : (
                <><Download size={16} /> Download PDF</>
              )}
            </button>
          </div>
        </div>
        {ternakList.length === 0 && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
            Anda belum memiliki ternak berstatus hidup. Kartu akan kosong.
          </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* ADMIN SEARCH BAR - SIDEBAR */}
        {isAdmin && pemilikList && (
          <div className="w-full xl:w-80 shrink-0 print:hidden xl:sticky xl:top-8 bg-gradient-to-br from-green-50 to-emerald-50/50 p-5 rounded-2xl border border-green-200 shadow-sm">
            <div className="mb-4">
              <h2 className="text-green-900 font-extrabold text-lg flex items-center gap-2">
                Pilih Peternak
              </h2>
              <p className="text-xs text-green-700/80 mt-1">Cari peternak untuk mencetak kartu miliknya (Khusus Admin)</p>
            </div>
            
            <PeternakCombobox 
              pemilikList={pemilikList} 
              defaultValue={`${pemilik.nama_lengkap} - Desa ${pemilik.alamat_desa}`}
              onSelect={(nik) => {
                if (nik !== pemilik.nik) {
                  router.push(`/kartu-ternak?nik=${nik}`)
                }
              }} 
            />
          </div>
        )}

        {/* MAIN CARD AREA */}
        <div className="flex-1 w-full min-w-0">

          {/* === THE CARD (printable area) === */}
          <div ref={kartuRef} className={`kartu-ternak-printable bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-4xl ${!isAdmin ? 'mx-auto' : ''}`}>
        
        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white px-6 sm:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
              <img
                src="/logo/6311a9ed51648_300x300.webp"
                alt="Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-widest text-green-200">
                Pemerintah Kabupaten Manggarai Barat
              </p>
              <p className="text-[0.6rem] sm:text-[0.7rem] uppercase tracking-wider text-green-300/90 mt-0.5">
                Dinas Peternakan dan Kesehatan Hewan
              </p>
              <h2 className="text-base sm:text-lg font-bold mt-1 tracking-wide">
                KARTU KEPEMILIKAN TERNAK
              </h2>
            </div>
          </div>
        </div>

        {/* ── INFO PEMILIK ── */}
        <div className="px-6 sm:px-8 py-5 bg-gray-50/50 border-b border-gray-200">
          <p className="text-[0.65rem] uppercase tracking-widest text-gray-400 font-bold mb-3">
            Keterangan Hak Milik
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            <InfoRow label="Nama Pemilik" value={pemilik.nama_lengkap} />
            <InfoRow label="NIK" value={pemilik.nik} mono />
            <InfoRow label="Desa / Kelurahan" value={pemilik.alamat_desa} />
            <InfoRow label="Kecamatan" value={pemilik.alamat_kec} />
            <InfoRow label="Alamat Detail" value={pemilik.alamat_detail} fullWidth />
          </div>
        </div>

        {/* ── TABEL TERNAK ── */}
        <div className="px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400 font-bold">
              Daftar Ternak (Status: Hidup)
            </p>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              {ternakList.length} ekor
            </span>
          </div>

          {ternakList.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-10">No</th>
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Jenis</th>
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Fase</th>
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Kelamin</th>
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Penanda</th>
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Umur</th>
                    <th className="px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Berat</th>
                  </tr>
                </thead>
                <tbody>
                  {ternakList.map((t, i) => (
                    <tr key={t.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-3 py-2.5 text-gray-500 font-mono text-xs border-b border-gray-100">{i + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800 border-b border-gray-100">{t.nama_jenis}</td>
                      <td className="px-3 py-2.5 text-gray-600 border-b border-gray-100">{t.fase || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-600 border-b border-gray-100">{t.jenis_kelamin || '—'}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100">
                        <span className="text-gray-500 text-xs">{t.jenis_penanda}:</span>{' '}
                        <span className="font-medium text-gray-700">{t.identitas_penanda || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 border-b border-gray-100 whitespace-nowrap">{t.umur || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-800 font-semibold border-b border-gray-100 text-right whitespace-nowrap">
                        {t.berat_badan ? `${t.berat_badan} kg` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              Belum ada ternak yang terdaftar
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50/50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
            <p>Dicetak pada: <span className="font-semibold text-gray-500">{tanggalCetak}</span></p>
            <p className="text-[0.6rem]">Dokumen ini di-generate secara otomatis oleh Sistem Pencatatan Ternak Kec. Komodo</p>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-dashed border-gray-300">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-12">Kepala Dinas Peternakan dan<br />Kesehatan Hewan</p>
              <div className="border-b border-gray-400 w-40 mx-auto mb-1"></div>
              <p className="text-xs text-gray-500">NIP. ................................</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-12">Petugas / Lurah / Kepala Desa</p>
              <div className="border-b border-gray-400 w-40 mx-auto mb-1"></div>
              <p className="text-xs text-gray-500">NIP. ................................</p>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Helper component for info rows */
function InfoRow({ label, value, mono, fullWidth }: { label: string; value: string; mono?: boolean; fullWidth?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs text-gray-500 shrink-0 w-28 sm:w-32">{label}</span>
      <span className="text-xs text-gray-400">:</span>
      <span className={`text-sm font-semibold text-gray-800 ${mono ? 'font-mono tracking-wide' : ''}`}>
        {value}
      </span>
    </div>
  )
}
