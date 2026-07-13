import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key: string) => {
  const match = envFile.match(new RegExp(`${key}=(.*)`))
  return match ? match[1].trim() : ''
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceKey)

async function checkUsers() {
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Auth Error:', authError)
    return
  }

  const { data: pemilikData, error: pemilikError } = await supabase.from('pemilik').select('*')
  if (pemilikError) {
    console.error('Pemilik Error:', pemilikError)
    return
  }

  let inconsistencies = 0
  
  for (const p of pemilikData) {
    const authUser = authUsers.users.find(u => u.id === p.id)
    if (!authUser) {
      console.log(`❌ ERROR: User ${p.nama_lengkap} (NIK: "${p.nik}") exists in 'pemilik' but NOT in 'auth.users'`)
      inconsistencies++
      continue
    }

    const expectedEmail = `${p.nik}@ternak.local`
    if (authUser.email !== expectedEmail) {
      console.log(`⚠️ WARNING: User ${p.nama_lengkap} (NIK: "${p.nik}") has auth email '${authUser.email}' but expected '${expectedEmail}'`)
      inconsistencies++
    }
  }

  console.log(`Total inconsistencies found: ${inconsistencies}`)
}

checkUsers()
