// Daftar wilayah yang tersedia di sistem
// Tambahkan kecamatan/desa baru di sini jika diperlukan

export const WILAYAH_DATA: Record<string, string[]> = {
  Komodo: ['Golo Mori', 'Warloka', 'Warloka Pesisir'],
}

export const KECAMATAN_LIST = Object.keys(WILAYAH_DATA)

export function getDesaByKecamatan(kecamatan: string): string[] {
  return WILAYAH_DATA[kecamatan] ?? []
}
