import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanup() {
  const { data: profiles, error } = await supabase.from('profiles').select('*')
  if (error) throw error

  const emailMap = new Map<string, string[]>()
  for (const p of profiles) {
    if (!emailMap.has(p.email)) {
      emailMap.set(p.email, [])
    }
    emailMap.get(p.email)!.push(p.id)
  }

  for (const [email, ids] of emailMap.entries()) {
    if (ids.length > 1) {
      // Keep the first one, delete the rest
      const [keep, ...deleteIds] = ids
      console.log(`Email ${email} has duplicates. Keeping ${keep}, deleting ${deleteIds.length} others.`)
      
      for (const id of deleteIds) {
        // First delete their bookings to satisfy foreign key constraints
        await supabase.from('bookings').delete().eq('profile_id', id)
        const { error } = await supabase.from('profiles').delete().eq('id', id)
        if (error) {
          console.error(`Failed to delete profile ${id}:`, error.message)
        } else {
          console.log(`Deleted duplicate profile ${id}`)
        }
      }
    }
  }
  console.log('Cleanup complete.')
}

cleanup().catch(console.error)
