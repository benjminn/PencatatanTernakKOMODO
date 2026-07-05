'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, User, MapPin, ExternalLink } from 'lucide-react'
import type { TernakLengkap } from '@/types/database.types'

type PemilikData = {
  id: string
  nik: string
  nama_lengkap: string
  alamat_desa: string
}

interface PeternakOverviewListProps {
  pemilikList: PemilikData[]
  ternakList: TernakLengkap[]
}

export default function PeternakOverviewList({ pemilikList, ternakList }: PeternakOverviewListProps) {
  // Local state for expanded rows
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Pre-process data
  const peternakMap = pemilikList.map((p) => {
    const ternaknya = ternakList.filter(t => t.nik === p.nik)
    const hidup = ternaknya.filter(t => t.status === 'hidup')
    const mati = ternaknya.filter(t => t.status === 'mati')
    const dijual = ternaknya.filter(t => t.status === 'dijual')

    const countByJenis = (list: TernakLengkap[]) => {
      const counts: Record<string, number> = {}
      list.forEach(t => {
        counts[t.nama_jenis] = (counts[t.nama_jenis] || 0) + 1
      })
      return counts
    }

    return {
      ...p,
      hidupCounts: countByJenis(hidup),
      matiCounts: countByJenis(mati),
      dijualCounts: countByJenis(dijual),
      totalHidup: hidup.length,
      totalMati: mati.length,
      totalDijual: dijual.length,
    }
  })

  return (
    <div className="space-y-4">
      {peternakMap.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          Belum ada data peternak.
        </div>
      ) : (
        peternakMap.map((p) => {
          const isExpanded = expandedId === p.id
          return (
            <div key={p.id} className={`bg-white rounded-2xl border transition-all ${isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-blue-200 shadow-sm'}`}>
              
              {/* Header Row (Always Visible) */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(p.id)}
              >
                {/* Peternak Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{p.nama_lengkap}</h3>
                    <div className="flex items-center text-xs text-gray-500 gap-3 mt-1">
                      <span className="font-mono">{p.nik}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {p.alamat_desa}</span>
                    </div>
                  </div>
                </div>

                {/* Living Livestock Summary */}
                <div className="flex items-center gap-3">
                  {p.totalHidup === 0 ? (
                    <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full border border-gray-200">Belum ada ternak hidup</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(p.hidupCounts).map(([jenis, count]) => (
                        <div key={jenis} className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl">
                          <span className="text-xs font-semibold text-green-800">{jenis}</span>
                          <span className="bg-white text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expandable Content (Mati & Dijual) */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Riwayat Ternak (Mati / Dijual)</p>
                    <Link href={`/admin/peternak/${p.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-colors">
                      <ExternalLink size={14} /> Lihat Profil Lengkap
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mati */}
                    <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex items-start gap-4">
                      <div className="w-1 bg-red-500 rounded-full h-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-red-600 uppercase">Mati</span>
                          <span className="text-sm font-extrabold text-red-700">{p.totalMati} <span className="text-xs font-medium text-red-500/70">ekor</span></span>
                        </div>
                        {p.totalMati > 0 ? (
                           <div className="flex flex-wrap gap-1">
                             {Object.entries(p.matiCounts).map(([jenis, count]) => (
                               <span key={jenis} className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-100">{jenis}: {count}</span>
                             ))}
                           </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Tidak ada catatan kematian</span>
                        )}
                      </div>
                    </div>

                    {/* Dijual */}
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm flex items-start gap-4">
                      <div className="w-1 bg-amber-500 rounded-full h-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-600 uppercase">Dijual</span>
                          <span className="text-sm font-extrabold text-amber-700">{p.totalDijual} <span className="text-xs font-medium text-amber-500/70">ekor</span></span>
                        </div>
                        {p.totalDijual > 0 ? (
                           <div className="flex flex-wrap gap-1">
                             {Object.entries(p.dijualCounts).map(([jenis, count]) => (
                               <span key={jenis} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">{jenis}: {count}</span>
                             ))}
                           </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Tidak ada catatan penjualan</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
