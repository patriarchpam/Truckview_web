import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field, Input, Select } from '../../components/ui/Field'
import { Car, Plus } from 'lucide-react'
import { vehicleMakes } from '../../data/vehicleMakes'
import { useNavigate } from 'react-router-dom'

export function CustomerVehicles() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [addCarOpen, setAddCarOpen] = useState(false)
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [savedVehicles, setSavedVehicles] = useState<any[]>([])

  useEffect(() => {
    if (user?.profileId) {
      const stored = localStorage.getItem(`vehicles_${user.profileId}`)
      if (stored) {
        setSavedVehicles(JSON.parse(stored))
      }
    }
  }, [user])

  const handleSaveCar = () => {
    if (!selectedMake || !selectedModel || !year || !user) return

    const newVehicle = {
      id: Date.now().toString(),
      make: selectedMake,
      model: selectedModel,
      year,
      color,
      details: `${selectedMake} ${selectedModel} ${year} ${color ? '- ' + color : ''}`
    }

    const updated = [...savedVehicles, newVehicle]
    setSavedVehicles(updated)
    localStorage.setItem(`vehicles_${user.profileId}`, JSON.stringify(updated))
    
    setAddCarOpen(false)
    setSelectedMake('')
    setSelectedModel('')
    setYear('')
    setColor('')
  }

  const handleBookWithCar = (carDetails: string) => {
    navigate(`/book?car=${encodeURIComponent(carDetails)}`)
  }

  if (!user) return null

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">My Vehicles</h1>
          <p className="text-muted">Manage your garage</p>
        </div>
        <Button onClick={() => setAddCarOpen(true)}>
          <Plus size={16} className="mr-2" /> Add Vehicle
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {savedVehicles.length === 0 ? (
          <div className="sm:col-span-2 bg-surface p-8 rounded-xl border border-line text-center text-muted">
            You haven't added any vehicles yet.
            <div className="mt-4">
              <Button variant="outline" onClick={() => setAddCarOpen(true)}>Add your first car</Button>
            </div>
          </div>
        ) : (
          savedVehicles.map(car => (
            <div key={car.id} className="bg-surface p-5 rounded-xl border border-line shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                  <Car size={20} className="text-muted" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-lg">{car.year} {car.make} {car.model}</h3>
                  {car.color && <p className="text-sm text-muted">{car.color}</p>}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleBookWithCar(car.details)}>
                Book Service
              </Button>
            </div>
          ))
        )}
      </div>

      <Modal open={addCarOpen} onClose={() => setAddCarOpen(false)} title="Add Vehicle to Garage">
        <div className="grid gap-4 py-4">
          <Field label="Make" required>
            <Select value={selectedMake} onChange={e => { setSelectedMake(e.target.value); setSelectedModel('') }}>
              <option value="">Select Make...</option>
              {Object.keys(vehicleMakes).map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </Select>
          </Field>
          
          <Field label="Model" required>
            <Select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedMake}>
              <option value="">Select Model...</option>
              {selectedMake && (vehicleMakes as any)[selectedMake].map((model: string) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" required>
              <Input type="number" min="1990" max={new Date().getFullYear() + 1} value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2018" />
            </Field>
            <Field label="Color (Optional)">
              <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Silver" />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setAddCarOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCar} disabled={!selectedMake || !selectedModel || !year}>Save Vehicle</Button>
        </div>
      </Modal>
    </div>
  )
}
