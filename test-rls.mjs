import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vvrrjuxewaugmqmlmoht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cnJqdXhld2F1Z21xbWxtb2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MTA2OTUsImV4cCI6MjEwMjE4NjY5NX0.skNn-kpYv9pFPL4uuvWnsTTbkafSv1DmhkIE7RL4wMI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLS() {
  console.log("Testing RLS Policy for Bookings...")
  const { data, error } = await supabase.from('bookings').insert({
    id: `test-${Date.now()}`,
    reference: `TV-TEST-${Date.now()}`,
    profile_id: '00000000-0000-0000-0000-000000000000',
    vehicle_type_id: 'vt-sedan',
    vehicle_details: 'Test Vehicle',
    service_id: 'svc-oil',
    date: '2026-08-20',
    time: '10:00',
    location: 'Test',
    status: 'pending'
  })
  
  if (error) {
    console.error("RLS Error:", error.message)
  } else {
    console.log("RLS Success! Inserted booking.")
  }
}

testRLS()
