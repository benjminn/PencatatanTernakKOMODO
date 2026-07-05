'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import TernakFormClient from '@/components/ternak/TernakFormClient'
import { tambahTernakBulk } from '@/lib/actions/ternak.actions'
import { UploadCloud, FileText, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react'
import type { JenisTernak, Pemilik } from '@/types/database.types'

interface TernakFormAdminProps {
  jenisList: JenisTernak[]
  pemilikList: Pemilik[]
}

export default function TernakFormAdmin({ jenisList, pemilikList }: TernakFormAdminProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'satuan' | 'massal'>('satuan')
  const [selectedPemilik, setSelectedPemilik] = useState<string>('')
  
  // CSV State
  const [isPending, startTransition] = useTransition()
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvError, setCsvError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError(null)
    setCsvData([])
    setUploadSuccess(false)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0)
        
        if (rows.length < 2) {
          throw new Error('File CSV kosong atau tidak memiliki baris data.')
        }

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase())
        
        // Expected headers mapping
        const parsedRows = []
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',').map(c => c.trim())
          const rowData: any = {}
          
          headers.forEach((h, idx) => {
            rowData[h] = cols[idx]
          })

          let nik = (rowData['nik'] || '').trim()
          
          // Handle scientific notation (e.g., 3.27701E+15) from Excel CSV exports
          if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(nik)) {
            const num = Number(nik)
            if (!isNaN(num)) {
              nik = num.toFixed(0)
            }
          }

          const pemilikObj = pemilikList.find(p => p.nik === nik)
          
          const namaJenis = rowData['jenis hewan'] || rowData['jenis_hewan'] || ''
          const jenisObj = jenisList.find(j => j.nama_jenis.toLowerCase() === namaJenis.toLowerCase())

          let rowError = null
          if (!pemilikObj) rowError = 'NIK Peternak tidak ditemukan'
          else if (!jenisObj) rowError = `Jenis hewan "${namaJenis}" tidak ada`

          parsedRows.push({
            id_pemilik: pemilikObj?.id || '',
            nik: nik,
            nama_jenis: namaJenis,
            jenis_penanda: rowData['jenis penanda'] || rowData['jenis_penanda'] || 'Eartag',
            identitas_penanda: rowData['eartag'] || rowData['kode eartag'] || rowData['identitas_penanda'] || '',
            id_jenis: jenisObj?.id.toString() || '',
            fase: rowData['fase'] || '',
            jenis_kelamin: rowData['kelamin'] || rowData['jenis_kelamin'] || '',
            umur_tahun: rowData['umur tahun'] || rowData['umur_tahun'] || '0',
            umur_bulan: rowData['umur bulan'] || rowData['umur_bulan'] || '0',
            berat_badan: rowData['berat'] || rowData['berat badan'] || rowData['berat_badan'] || '0',
            error: rowError
          })
        }
        
        setCsvData(parsedRows)
      } catch (err: any) {
        setCsvError(err.message || 'Gagal memproses file CSV. Pastikan format sesuai.')
      }
    }
    reader.readAsText(file)
  }

  const handleRowChange = (index: number, field: string, value: string) => {
    const newData = [...csvData]
    let targetValue = value

    if (field === 'nik') {
      targetValue = value.trim()
      if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(targetValue)) {
        const num = Number(targetValue)
        if (!isNaN(num)) {
          targetValue = num.toFixed(0)
        }
      }
    }

    newData[index][field] = targetValue

    // Re-validate row if NIK or jenis changes
    if (field === 'nik') {
      const pemilikObj = pemilikList.find(p => p.nik === targetValue)
      newData[index].id_pemilik = pemilikObj?.id || ''
      if (!pemilikObj) newData[index].error = 'NIK Peternak tidak ditemukan'
      else newData[index].error = null
    } else if (field === 'nama_jenis') {
      const jenisObj = jenisList.find(j => j.nama_jenis.toLowerCase() === value.toLowerCase())
      newData[index].id_jenis = jenisObj?.id.toString() || ''
      if (!jenisObj) newData[index].error = `Jenis hewan "${value}" tidak ada`
      else newData[index].error = null
    }

    setCsvData(newData)
  }

  const handleBulkSubmit = () => {
    const hasError = csvData.some(row => row.error)
    if (hasError) {
      setCsvError('Masih terdapat baris yang error (warna merah). Harap perbaiki sebelum menyimpan.')
      return
    }

    if (csvData.length === 0) return

    setCsvError(null)
    startTransition(async () => {
      // Clean up format before sending
      const dataToSend = csvData.map(row => ({
        id_pemilik: row.id_pemilik,
        jenis_penanda: row.jenis_penanda,
        identitas_penanda: row.identitas_penanda,
        id_jenis: row.id_jenis,
        fase: row.fase,
        jenis_kelamin: row.jenis_kelamin,
        umur_tahun: parseInt(row.umur_tahun) || 0,
        umur_bulan: parseInt(row.umur_bulan) || 0,
        berat_badan: parseFloat(row.berat_badan) || undefined
      }))

      const result = await tambahTernakBulk(dataToSend)
      if (result?.error) {
        setCsvError(result.error)
      } else {
        setUploadSuccess(true)
        setTimeout(() => {
          router.push(`/admin/ternak`)
        }, 1500)
      }
    })
  }

  const downloadTemplate = () => {
    const headers = "NIK, Jenis Penanda, Eartag, Jenis Hewan, Fase, Kelamin, Umur Tahun, Umur Bulan, Berat\n"
    const sample = "3277011234567890, Eartag, S-001, Sapi, Pejantan, Jantan, 2, 5, 350.5\n3277011234567890, Potong Telinga, , Kambing, Indukan, Betina, 1, 0, 40"
    const blob = new Blob([headers + sample], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_ternak_massal.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Tabs Mode */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button 
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'satuan' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('satuan')}
        >
          Input Satuan (Form)
        </button>
        <button 
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'massal' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('massal')}
        >
          Input Massal (Import CSV)
        </button>
      </div>

      {/* Content Satuan */}
      {activeTab === 'satuan' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-green-200 shadow-sm bg-green-50/30">
            <label className="form-label text-green-900 font-bold mb-3 block">
              1. Pilih Pemilik / Peternak Tujuan <span className="text-red-500">*</span>
            </label>
            <select 
              className="form-input bg-white border-green-300 focus:border-green-500 focus:ring-green-500/20"
              value={selectedPemilik}
              onChange={(e) => setSelectedPemilik(e.target.value)}
            >
              <option value="">-- Ketik atau pilih nama peternak --</option>
              {pemilikList.map(p => (
                <option key={p.id} value={p.id}>{p.nama_lengkap} (NIK: {p.nik}) - Desa {p.alamat_desa}</option>
              ))}
            </select>
          </div>
          
          <div className={`transition-opacity duration-300 ${!selectedPemilik ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <TernakFormClient jenisList={jenisList} mode="tambah" adminIdPemilik={selectedPemilik} />
          </div>
        </div>
      )}

      {/* Content Massal */}
      {activeTab === 'massal' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <UploadCloud size={48} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unggah File CSV</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Masukkan ratusan data ternak dari berbagai pemilik sekaligus menggunakan NIK.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button type="button" onClick={downloadTemplate} className="btn btn-ghost border border-gray-200 text-gray-700">
                <Download size={16} /> Unduh Template CSV
              </button>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  onClick={(e) => (e.currentTarget.value = '')}
                />
                <div className="btn btn-primary bg-blue-600 hover:bg-blue-700 border-blue-600">
                  <FileText size={16} /> Pilih File CSV
                </div>
              </div>
            </div>
          </div>

          {csvError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{csvError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-3">
              <CheckCircle size={18} className="shrink-0" />
              <span className="font-semibold">Berhasil menyimpan {csvData.length} data ternak massal! Mengalihkan...</span>
            </div>
          )}

          {csvData.length > 0 && !uploadSuccess && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <p className="font-bold text-gray-800">Cek & Edit Data ({csvData.length} baris)</p>
                <button 
                  onClick={handleBulkSubmit}
                  disabled={isPending}
                  className="btn btn-primary btn-sm px-6"
                >
                  {isPending ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : 'Simpan Semua Data'}
                </button>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Validasi</th>
                      <th className="px-3 py-2 font-semibold">NIK Pemilik</th>
                      <th className="px-3 py-2 font-semibold">Jenis Hewan</th>
                      <th className="px-3 py-2 font-semibold">Fase</th>
                      <th className="px-3 py-2 font-semibold">Kelamin</th>
                      <th className="px-3 py-2 font-semibold">Umur (Thn)</th>
                      <th className="px-3 py-2 font-semibold">Berat (Kg)</th>
                      <th className="px-3 py-2 font-semibold">Penanda / Eartag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {csvData.map((row, i) => (
                      <tr key={i} className={`hover:bg-gray-50 ${row.error ? 'bg-red-50/50' : ''}`}>
                        <td className="px-3 py-2">
                          {row.error ? (
                            <span className="text-red-600 text-xs font-bold" title={row.error}>ERROR</span>
                          ) : (
                            <span className="text-green-600 text-xs font-bold">OK</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" className={`form-input py-1 px-2 text-xs w-44 ${row.error?.includes('NIK') ? 'border-red-500 bg-red-50' : ''}`} value={row.nik} onChange={(e) => handleRowChange(i, 'nik', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" className={`form-input py-1 px-2 text-xs w-28 ${row.error?.includes('Jenis') ? 'border-red-500 bg-red-50' : ''}`} value={row.nama_jenis} onChange={(e) => handleRowChange(i, 'nama_jenis', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" className="form-input py-1 px-2 text-xs w-28" value={row.fase} onChange={(e) => handleRowChange(i, 'fase', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" className="form-input py-1 px-2 text-xs w-24" value={row.jenis_kelamin} onChange={(e) => handleRowChange(i, 'jenis_kelamin', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" className="form-input py-1 px-2 text-xs w-20" value={row.umur_tahun} onChange={(e) => handleRowChange(i, 'umur_tahun', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" className="form-input py-1 px-2 text-xs w-20" value={row.berat_badan} onChange={(e) => handleRowChange(i, 'berat_badan', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <input type="text" className="form-input py-1 px-2 text-xs w-28" value={row.jenis_penanda} onChange={(e) => handleRowChange(i, 'jenis_penanda', e.target.value)} placeholder="Jenis" />
                            <input type="text" className="form-input py-1 px-2 text-xs w-28" value={row.identitas_penanda} onChange={(e) => handleRowChange(i, 'identitas_penanda', e.target.value)} placeholder="Eartag" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
