export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StatusTernak = 'hidup' | 'mati' | 'dijual'

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
        Relationships: []
      }
      pemilik: {
        Row: {
          id: string
          nik: string
          nama_lengkap: string
          alamat_kec: string
          alamat_desa: string
          alamat_detail: string
          role: 'peternak' | 'admin' | 'superadmin'
          created_at: string
        }
        Insert: {
          id: string
          nik: string
          nama_lengkap: string
          alamat_kec: string
          alamat_desa: string
          alamat_detail: string
          role?: 'peternak' | 'admin' | 'superadmin'
          created_at?: string
        }
        Update: {
          id?: string
          nik?: string
          nama_lengkap?: string
          alamat_kec?: string
          alamat_desa?: string
          alamat_detail?: string
          role?: 'peternak' | 'admin' | 'superadmin'
          created_at?: string
        }
        Relationships: []
      }
      ternak: {
        Row: {
          id: string
          jenis_penanda: string
          identitas_penanda: string | null
          id_pemilik: string
          id_jenis: number
          fase: string | null
          jenis_kelamin: string | null
          tanggal_lahir: string | null
          berat_badan: number | null
          status: StatusTernak
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          jenis_penanda: string
          identitas_penanda?: string | null
          id_pemilik: string
          id_jenis: number
          fase?: string | null
          jenis_kelamin?: string | null
          tanggal_lahir?: string | null
          berat_badan?: number | null
          status?: StatusTernak
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          jenis_penanda?: string
          identitas_penanda?: string | null
          id_pemilik?: string
          id_jenis?: number
          fase?: string | null
          jenis_kelamin?: string | null
          tanggal_lahir?: string | null
          berat_badan?: number | null
          status?: StatusTernak
          updated_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ternak_id_jenis_fkey"
            columns: ["id_jenis"]
            isOneToOne: false
            referencedRelation: "master_jenis_ternak"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ternak_id_pemilik_fkey"
            columns: ["id_pemilik"]
            isOneToOne: false
            referencedRelation: "pemilik"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      v_ternak_lengkap: {
        Row: {
          id: string
          jenis_penanda: string
          identitas_penanda: string | null
          fase: string | null
          jenis_kelamin: string | null
          tanggal_lahir: string | null
          umur: string | null
          berat_badan: number | null
          status: StatusTernak
          updated_at: string
          created_at: string
          nama_jenis: string
          kategori: string
          id_pemilik: string
          nik: string
          nama_lengkap: string
          alamat_desa: string
          alamat_kec: string
          alamat_detail: string
        }
        Relationships: []
      }
      v_statistik_desa: {
        Row: {
          alamat_desa: string
          nama_jenis: string
          kategori: string
          jumlah_hidup: number
          jumlah_mati: number
          jumlah_dijual: number
          jumlah_jantan: number
          jumlah_betina: number
          jumlah_campuran: number
          total: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
