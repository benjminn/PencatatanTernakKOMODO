'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JenisTernak } from '@/types/database.types'
import { Plus, Trash2, Save, X, Edit2, CheckSquare } from 'lucide-react'

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

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 rounded-lg text-sm"
          style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--color-mati)' }}>
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm ? (
        <div className="card border-2" style={{ borderColor: 'var(--color-primary-600)' }}>
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Tambah Jenis Ternak Baru
          </h3>
          <div className="space-y-3">
            <input type="text" value={newNama} onChange={(e) => setNewNama(e.target.value)}
              placeholder="Nama jenis hewan" className="form-input" disabled={isPending} />
            <div>
              <label className="form-label">Kategori</label>
              <select value={newKategori} onChange={(e) => setNewKategori(e.target.value as any)}
                className="form-input" disabled={isPending}>
                <option value="Mamalia">Mamalia</option>
                <option value="Unggas">Unggas</option>
              </select>
            </div>
            <div>
              <label className="form-label">Opsi Jenis Kelamin</label>
              <div className="flex gap-2 flex-wrap">
                {OPSI_KELAMIN_OPTIONS.map((o) => (
                  <label key={o} className="flex items-center gap-1.5 text-sm cursor-pointer px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: newOpsi.includes(o) ? 'var(--color-primary-500)' : 'var(--color-bg-border)',
                      background: newOpsi.includes(o) ? 'rgba(26,94,56,0.2)' : 'transparent',
                      color: newOpsi.includes(o) ? 'var(--color-primary-300)' : 'var(--color-text-muted)' }}>
                    <input type="checkbox" checked={newOpsi.includes(o)} className="accent-green-600"
                      onChange={() => toggleOpsi(o, newOpsi, setNewOpsi)} />
                    {o}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm" disabled={isPending}>
                <X size={14} /> Batal
              </button>
              <button onClick={handleAdd} className="btn btn-primary btn-sm" disabled={isPending}>
                <Plus size={14} /> Simpan
              </button>
            </div>
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
              <tr key={jenis.id} style={{ opacity: jenis.is_active ? 1 : 0.5 }}>
                <td>
                  {editingId === jenis.id ? (
                    <input value={editNama} onChange={(e) => setEditNama(e.target.value)}
                      className="form-input py-1 px-2 text-sm" style={{ width: '160px' }} disabled={isPending} />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {jenis.nama_jenis}
                    </span>
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
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                      {jenis.kategori}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === jenis.id ? (
                    <div className="flex gap-1">
                      {OPSI_KELAMIN_OPTIONS.map((o) => (
                        <label key={o} className="flex items-center gap-1 text-xs cursor-pointer px-2 py-1 rounded border"
                          style={{ borderColor: editOpsi.includes(o) ? 'var(--color-primary-500)' : 'var(--color-bg-border)',
                            color: editOpsi.includes(o) ? 'var(--color-primary-300)' : 'var(--color-text-muted)' }}>
                          <input type="checkbox" checked={editOpsi.includes(o)} className="accent-green-600"
                            onChange={() => toggleOpsi(o, editOpsi, setEditOpsi)} />
                          {o}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1 flex-wrap">
                      {jenis.opsi_kelamin.map((o) => (
                        <span key={o} className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'rgba(45,138,100,0.15)', color: 'var(--color-primary-400)' }}>
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <button onClick={() => handleToggleActive(jenis.id, jenis.is_active)}
                    className={`badge cursor-pointer ${jenis.is_active ? 'badge-hidup' : 'badge-mati'}`}
                    disabled={isPending}>
                    {jenis.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td>
                  {editingId === jenis.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm" disabled={isPending}>
                        <X size={13} />
                      </button>
                      <button onClick={() => handleUpdate(jenis.id)} className="btn btn-primary btn-sm" disabled={isPending}>
                        <Save size={13} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(jenis)} className="btn btn-ghost btn-sm" disabled={isPending}>
                      <Edit2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
