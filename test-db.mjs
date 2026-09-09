import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

const env = dotenv.parse(fs.readFileSync('.env.local'))

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('notifications').select('*').limit(1)
  console.log("SELECT:", { data, error })
  
  const insert = await supabase.from('notifications').insert({
    title: "Test",
    message: "Test message",
    profile_id: null
  }).select()
  console.log("INSERT NULL:", insert)
}
run()
