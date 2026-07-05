'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JenisTernak } from '@/types/database.types'
import { Plus, Trash2, Save, X, Edit2, CheckSquare } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const OPSI_KELAMIN_OPTIONS = ['Jantan', 'Betina', 'Campuran']

interface JenisTernakManagerProps {
  initialList: JenisTernak[]
}

export default function JenisTernakManager({ initialList }: JenisTernakManagerProps) {
  const [list, setList] = useState<JenisTernak[]>(initialList)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Add form state
  const [newNama, setNewNama] = useState('')
  const [newKategori, setNewKategori] = useState<'Mamalia' | 'Unggas'>('Mamalia')
  const [newOpsi, setNewOpsi] = useState<string[]>(['Jantan', 'Betina'])

  // Edit state
  const [editNama, setEditNama] = useState('')
  const [editKategori, setEditKategori] = useState<'Mamalia' | 'Unggas'>('Mamalia')
  const [editOpsi, setEditOpsi] = useState<string[]>([])

  const supabase = createClient()

  const handleAdd = () => {
    if (!newNama.trim() || newOpsi.length === 0) {
      setError('Nama dan opsi kelamin wajib diisi')
      return
    }
    setError(null)
    startTransition(async () => {
      const { data, error: dbError } = await supabase
        .from('master_jenis_ternak')
        .insert({ nama_jenis: newNama.trim(), opsi_kelamin: newOpsi, kategori: newKategori })
        .select()
        .single()

      if (dbError) { setError('Gagal menambahkan'); return }
      setList((prev) => [...prev, data])
      setNewNama(''); setNewOpsi(['Jantan', 'Betina']); setNewKategori('Mamalia')
      setShowAddForm(false)
    })
  }

  const startEdit = (jenis: JenisTernak) => {
    setEditingId(jenis.id)
    setEditNama(jenis.nama_jenis)
    setEditKategori(jenis.kategori)
    setEditOpsi(jenis.opsi_kelamin)
  }

  const handleUpdate = (id: number) => {
    if (!editNama.trim() || editOpsi.length === 0) { setError('Nama dan opsi kelamin wajib diisi'); return }
    setError(null)
    startTransition(async () => {
      const { error: dbError } = await supabase
        .from('master_jenis_ternak')
        .update({ nama_jenis: editNama.trim(), opsi_kelamin: editOpsi, kategori: editKategori })
        .eq('id', id)

      if (dbError) { setError('Gagal mengupdate'); return }
      setList((prev) => prev.map((j) => j.id === id
        ? { ...j, nama_jenis: editNama.trim(), opsi_kelamin: editOpsi, kategori: editKategori }
        : j))
      setEditingId(null)
    })
  }

  const handleToggleActive = (id: number, current: boolean) => {
    startTransition(async () => {
      await supabase.from('master_jenis_ternak').update({ is_active: !current }).eq('id', id)
      setList((prev) => prev.map((j) => j.id === id ? { ...j, is_active: !current } : j))
    })
  }

  const toggleOpsi = (opsi: string, current: string[], setter: (v: string[]) => void) => {
    setter(current.includes(opsi) ? current.filter((o) => o !== opsi) : [...current, opsi])
  }

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    setError(null)
    startTransition(async () => {
      const { error: dbError } = await supabase
        .from('master_jenis_ternak')
        .delete()
        .eq('id', deleteId)

      if (dbError) {
        // Usually fails because of foreign key constraint (ternak still exists for this jenis)
        setError('Gagal menghapus jenis ternak. Pastikan tidak ada data ternak yang menggunakan jenis ini.')
      } else {
        setList((prev) => prev.filter((j) => j.id !== deleteId))
      }
      setDeleteId(null)
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm ? (
        <div className="card border-2 border-green-600 bg-green-50/30">
          <h3 className="font-semibold text-sm text-gray-900 mb-4">Tambah Jenis Ternak Baru</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Nama Jenis</label>
              <input type="text" value={newNama} onChange={(e) => setNewNama(e.target.value)}
                placeholder="Contoh: Sapi Bali" className="form-input" disabled={isPending} />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select value={newKategori} onChange={(e) => setNewKategori(e.target.value as any)}
                className="form-input" disabled={isPending}>
                <option value="Mamalia">Mamalia</option>
                <option value="Unggas">Unggas</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Opsi Jenis Kelamin yang Tersedia</label>
            <div className="flex gap-2 flex-wrap">
              {OPSI_KELAMIN_OPTIONS.map((o) => (
                <label key={o} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm font-medium transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:text-green-700">
                  <input type="checkbox" checked={newOpsi.includes(o)} className="sr-only"
                    onChange={() => toggleOpsi(o, newOpsi, setNewOpsi)} />
                  {o}
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm" disabled={isPending}>
              Batal
            </button>
            <button onClick={handleAdd} className="btn btn-primary btn-sm" disabled={isPending}>
              Simpan Jenis
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary btn-sm">
          <Plus size={15} /> Tambah Jenis Ternak
        </button>
      )}

      {/* List */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nama Jenis</th>
              <th>Kategori</th>
              <th>Opsi Kelamin</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((jenis) => (
              <tr key={jenis.id} className={!jenis.is_active ? 'opacity-50' : ''}>
                <td>
                  {editingId === jenis.id ? (
                    <input value={editNama} onChange={(e) => setEditNama(e.target.value)}
                      className="form-input py-1 px-2 text-sm" style={{ width: '160px' }} disabled={isPending} />
                  ) : (
                    <span className="font-semibold text-gray-900">{jenis.nama_jenis}</span>
                  )}
                </td>
                <td>
                  {editingId === jenis.id ? (
                    <select value={editKategori} onChange={(e) => setEditKategori(e.target.value as any)}
                      className="form-input py-1 px-2 text-sm" style={{ width: '120px' }} disabled={isPending}>
                      <option value="Mamalia">Mamalia</option>
                      <option value="Unggas">Unggas</option>
                    </select>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                      {jenis.kategori}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === jenis.id ? (
                    <div className="flex gap-1 flex-wrap">
                      {OPSI_KELAMIN_OPTIONS.map((o) => (
                        <label key={o} className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border bg-white hover:bg-gray-50 text-xs font-medium transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:text-green-700">
                          <input type="checkbox" checked={editOpsi.includes(o)} className="sr-only"
                            onChange={() => toggleOpsi(o, editOpsi, setEditOpsi)} />
                          {o}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1.5 flex-wrap">
                      {jenis.opsi_kelamin.map((o) => (
                        <span key={o} className="text-xs px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 font-medium">
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <button onClick={() => handleToggleActive(jenis.id, jenis.is_active)}
                    className={`badge cursor-pointer hover:opacity-80 transition-opacity ${jenis.is_active ? 'badge-hidup' : 'badge-mati'}`}
                    disabled={isPending}>
                    {jenis.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="text-right">
                  {editingId === jenis.id ? (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm" disabled={isPending}>
                        Batal
                      </button>
                      <button onClick={() => handleUpdate(jenis.id)} className="btn btn-primary btn-sm" disabled={isPending}>
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(jenis)} className="btn btn-ghost btn-sm" disabled={isPending}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button 
                        onClick={() => setDeleteId(jenis.id)} 
                        className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isPending}
                        title="Hapus Jenis Ternak"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Jenis Ternak"
        description="Apakah Anda yakin ingin menghapus jenis ternak ini? Jika ada hewan ternak yang sudah didaftarkan menggunakan jenis ini, penghapusan akan dibatalkan otomatis oleh sistem."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isPending={isPending}
        confirmText="Hapus"
      />
    </div>
  )
}
