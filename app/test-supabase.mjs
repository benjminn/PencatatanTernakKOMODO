// Test koneksi Supabase langsung
// Jalankan: node test-supabase.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Baca .env.local manual
const envContent = readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) env[key.trim()] = vals.join('=').trim()
})

const url = env['NEXT_PUBLIC_SUPABASE_URL']
const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

console.log('URL:', url)
console.log('KEY (first 30 chars):', key?.substring(0, 30) + '...')
console.log('')

if (!url || !key) {
  console.error('❌ URL atau KEY tidak ditemukan di .env.local!')
  process.exit(1)
}

const supabase = createClient(url, key)

console.log('🔄 Testing signUp...')
try {
  const { data, error } = await supabase.auth.signUp({
    email: 'test123@test.com',
    password: 'testpassword123',
  })

  if (error) {
    console.error('❌ signUp error:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ signUp berhasil:', JSON.stringify(data, null, 2))
    // Cleanup - sign out
    await supabase.auth.signOut()
  }
} catch (err) {
  console.error('❌ Exception:', err.message)
  console.error(err)
}

console.log('')
console.log('🔄 Testing DB query (master_jenis_ternak)...')
try {
  const { data, error } = await supabase.from('master_jenis_ternak').select('*').limit(3)
  if (error) {
    console.error('❌ DB error:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ DB OK, sample data:', JSON.stringify(data, null, 2))
  }
} catch (err) {
  console.error('❌ Exception:', err.message)
}
