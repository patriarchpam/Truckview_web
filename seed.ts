import { createClient } from '@supabase/supabase-js'
import { vehicleTypes, services } from './src/data/mockData.js'

// Need to load env vars for supabase url/key
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seed() {
  console.log("Seeding vehicle types...")
  for (const vt of vehicleTypes) {
    const { error } = await supabase.from('vehicle_types').upsert({
      id: vt.id,
      name: vt.name,
      description: vt.description,
      image: vt.image,
      active: vt.active
    })
    if (error) console.error("Error upserting vt", vt.id, error.message)
  }

  console.log("Seeding services...")
  for (const s of services) {
    const { error } = await supabase.from('services').upsert({
      id: s.id,
      name: s.name,
      description: s.description,
      details: s.details,
      price: s.price,
      duration: s.duration,
      image: s.image,
      vehicle_type_ids: s.vehicleTypeIds,
      active: s.active
    })
    if (error) console.error("Error upserting service", s.id, error.message)
  }

  console.log("Done")
}

seed()
