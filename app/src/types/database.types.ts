export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      master_jenis_ternak: {
        Row: {
          id: number
          nama_jenis: string
          opsi_kelamin: string[]
          kategori: 'Mamalia' | 'Unggas'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          nama_jenis: string
          opsi_kelamin?: string[]
          kategori: 'Mamalia' | 'Unggas'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          nama_jenis?: string
          opsi_kelamin?: string[]
          kategori?: 'Mamalia' | 'Unggas'
          is_active?: boolean
          created_at?: string
        }
      }
      pemilik: {
        Row: {
          id: string
          nik: string
          nama_lengkap: string
          alamat_kec: string
          alamat_desa: string
          alamat_detail: string
          role: 'peternak' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          nik: string
          nama_lengkap: string
          alamat_kec: string
          alamat_desa: string
          alamat_detail: string
          role?: 'peternak' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          nik?: string
          nama_lengkap?: string
          alamat_kec?: string
          alamat_desa?: string
          alamat_detail?: string
          role?: 'peternak' | 'admin'
          created_at?: string
        }
      }
      ternak: {
        Row: {
          no_eartag: string
          id_pemilik: string
          id_jenis: number
          jenis_kelamin: string
          umur: string | null
          berat_badan: number | null
          status_hidup: boolean
          updated_at: string
          created_at: string
        }
        Insert: {
          no_eartag: string
          id_pemilik: string
          id_jenis: number
          jenis_kelamin: string
          umur?: string | null
          berat_badan?: number | null
          status_hidup?: boolean
          updated_at?: string
          created_at?: string
        }
        Update: {
          no_eartag?: string
          id_pemilik?: string
          id_jenis?: number
          jenis_kelamin?: string
          umur?: string | null
          berat_badan?: number | null
          status_hidup?: boolean
          updated_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      v_ternak_lengkap: {
        Row: {
          no_eartag: string
          jenis_kelamin: string
          umur: string | null
          berat_badan: number | null
          status_hidup: boolean
          updated_at: string
          created_at: string
          nama_jenis: string
          kategori: string
          nik: string
          nama_lengkap: string
          alamat_desa: string
          alamat_kec: string
          alamat_detail: string
        }
      }
      v_statistik_desa: {
        Row: {
          alamat_desa: string
          nama_jenis: string
          kategori: string
          jumlah_hidup: number
          jumlah_mati: number
          jumlah_jantan: number
          jumlah_betina: number
          jumlah_campuran: number
          total: number
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Pemilik = Tables<'pemilik'>
export type Ternak = Tables<'ternak'>
export type JenisTernak = Tables<'master_jenis_ternak'>
export type TernakLengkap = Database['public']['Views']['v_ternak_lengkap']['Row']
export type StatistikDesa = Database['public']['Views']['v_statistik_desa']['Row']
