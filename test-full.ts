import { api } from './src/lib/api.ts'

async function testFullFlow() {
  try {
    const res = await api.createBooking({
      customer: { name: 'Full Flow Test', email: `test${Date.now()}@flow.com`, phone: '123' },
      vehicleTypeId: 'vt-sedan',
      vehicleDetails: 'Test',
      serviceId: 'svc-oil',
      date: '2026-08-20',
      time: '14:00',
      location: 'Test',
      notes: ''
    })
    console.log("SUCCESS:", res.booking.id)
  } catch (err) {
    console.error("ERROR:", err)
  }
}

testFullFlow()
