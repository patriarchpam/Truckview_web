import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vvrrjuxewaugmqmlmoht.supabase.co'
// Need the service key to bypass RLS and query system tables, but I don't want to use it if I don't have to.
// The user provided the service role key earlier!
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cnJqdXhld2F1Z21xbWxtb2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYxMDY5NSwiZXhwIjoyMTAyMTg2Njk1fQ.Up1-5TlaO8QC8X2zi4bKXgl7yfjtiDIm6Hx1A2sYTIA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_policies') // We don't have this RPC. 
  // Let's just try to do an insert into bookings as anon, but properly creating a profile first, to see if the real app flow works!
}

async function testRealFlow() {
  const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cnJqdXhld2F1Z21xbWxtb2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MTA2OTUsImV4cCI6MjEwMjE4NjY5NX0.skNn-kpYv9pFPL4uuvWnsTTbkafSv1DmhkIE7RL4wMI')
  
  // 1. Create a profile
  const { data: profile, error: pErr } = await anonClient.from('profiles').insert({
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    phone: '123'
  }).select().single()
  
  if (pErr) {
    console.error("Profile Error:", pErr.message)
    return
  }
  
  console.log("Profile created:", profile.id)
  
  // 2. Insert Booking
  const { error: bErr } = await anonClient.from('bookings').insert({
    id: `test-${Date.now()}`,
    reference: `TV-TEST-${Date.now()}`,
    profile_id: profile.id,
    vehicle_type_id: 'vt-sedan',
    vehicle_details: 'Test',
    service_id: 'svc-oil',
    date: '2026-08-20',
    time: '10:00',
    location: 'Test',
    status: 'pending'
  })
  
  if (bErr) {
    console.error("Booking Error:", bErr.message)
  } else {
    console.log("SUCCESS! Booking created.")
  }
}

testRealFlow()
