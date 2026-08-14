import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const payload = {
    id: "test-id-123",
    name: "Test Service",
    description: "test",
    price: 1000,
    duration: 60,
    // details: undefined
    image: "",
    vehicle_type_ids: ["vt-sedan"],
    active: true
  };
  console.log("Upserting:", payload)
  const { error } = await supabase.from('services').upsert(payload)
  console.log("Error:", error)
}
run()
