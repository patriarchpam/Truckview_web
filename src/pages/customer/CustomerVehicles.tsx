import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Field'
import { Autocomplete } from '../../components/ui/Autocomplete'
import { Car, Plus, Edit2, Trash2 } from 'lucide-react'
import { vehicleMakes } from '../../data/vehicleMakes'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { toast } from 'sonner'

export function CustomerVehicles() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [carModalOpen, setCarModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form fields
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  
  const [savedVehicles, setSavedVehicles] = useState<any[]>([])
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const makes = Object.keys(vehicleMakes)

  // Fetch models whenever selectedMake changes
  useEffect(() => {
    if (!selectedMake) {
      setModels([])
      return
    }
    const makeId = `vt-${selectedMake.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    api.getVehicleModels(makeId)
      .then(setModels)
      .catch(() => {
        // static fallback
        const key = Object.keys(vehicleMakes).find(k => k.toLowerCase() === selectedMake.toLowerCase())
        setModels(key ? (vehicleMakes as any)[key] : [])
      })
  }, [selectedMake])

  // Load vehicles from backend or local storage fallback
  const loadVehicles = async () => {
    if (!user?.profileId) return
    setLoading(true)
    try {
      const data = await api.getSavedVehicles(user.profileId)
      setSavedVehicles(data)
    } catch {
      // fallback
      const stored = localStorage.getItem(`vehicles_${user.profileId}`)
      if (stored) {
        setSavedVehicles(JSON.parse(stored))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [user])

  const handleSaveCar = async () => {
    if (!selectedMake || !selectedModel || !year || !user?.profileId) return

    const vehicleData = {
      id: editId || undefined,
      profileId: user.profileId,
      make: selectedMake,
      model: selectedModel,
      year: parseInt(year),
      color: color || undefined,
      plateNumber: plateNumber || undefined
    }

    try {
      await api.saveVehicle(vehicleData)
      toast.success(editId ? 'Vehicle updated successfully!' : 'Vehicle added to garage!')
      await loadVehicles()
      closeModal()
    } catch (err: any) {
      // Local storage fallback if database fails
      console.warn("DB save failed, falling back to local storage:", err.message)
      const fallbackId = editId || Date.now().toString()
      const newVehicle = {
        id: fallbackId,
        make: selectedMake,
        model: selectedModel,
        year: parseInt(year),
        color,
        plateNumber,
        details: `${selectedMake} ${selectedModel} ${year}${plateNumber ? ' - ' + plateNumber : ''}`
      }

      let updated
      if (editId) {
        updated = savedVehicles.map(v => v.id === editId ? newVehicle : v)
      } else {
        updated = [...savedVehicles, newVehicle]
      }

      setSavedVehicles(updated)
      localStorage.setItem(`vehicles_${user.profileId}`, JSON.stringify(updated))
      toast.success('Vehicle saved locally!')
      closeModal()
    }
  }

  const handleEdit = (car: any) => {
    setEditId(car.id)
    setSelectedMake(car.make)
    setSelectedModel(car.model)
    setYear(car.year.toString())
    setColor(car.color || '')
    setPlateNumber(car.plateNumber || '')
    setCarModalOpen(true)
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return

    try {
      await api.deleteVehicle(id)
      toast.success('Vehicle removed.')
      await loadVehicles()
    } catch {
      // Local storage fallback
      if (user?.profileId) {
        const updated = savedVehicles.filter(v => v.id !== id)
        setSavedVehicles(updated)
        localStorage.setItem(`vehicles_${user.profileId}`, JSON.stringify(updated))
        toast.success('Vehicle removed locally.')
      }
    }
  }

  const closeModal = () => {
    setCarModalOpen(false)
    setEditId(null)
    setSelectedMake('')
    setSelectedModel('')
    setYear('')
    setColor('')
    setPlateNumber('')
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
        <Button onClick={() => setCarModalOpen(true)}>
          <Plus size={16} className="mr-2" /> Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted">Loading garage...</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {savedVehicles.length === 0 ? (
            <div className="sm:col-span-2 bg-surface p-8 rounded-xl border border-line text-center text-muted">
              You haven't added any vehicles yet.
              <div className="mt-4">
                <Button variant="outline" onClick={() => setCarModalOpen(true)}>Add your first vehicle</Button>
              </div>
            </div>
          ) : (
            savedVehicles.map(car => (
              <div key={car.id} className="bg-surface p-5 rounded-xl border border-line shadow-sm flex flex-col justify-between gap-4 group hover:border-accent-300 transition-all duration-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                      <Car size={20} className="text-accent-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-lg">{car.year} {car.make} {car.model}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {car.color && <span className="text-xs text-muted font-medium bg-surface-2 px-2 py-0.5 rounded-full">{car.color}</span>}
                        {car.plateNumber && <span className="text-xs text-accent-600 font-semibold bg-accent-50 dark:bg-accent-950/20 px-2 py-0.5 rounded-full uppercase">{car.plateNumber}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(car)} className="p-1.5 text-muted hover:text-ink hover:bg-surface-2 rounded-lg transition-colors" title="Edit Vehicle">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleRemove(car.id)} className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors" title="Remove Vehicle">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-center group-hover:bg-accent-500 group-hover:text-white group-hover:border-accent-500 transition-all" onClick={() => handleBookWithCar(car.details)}>
                  Book Service
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      <Modal open={carModalOpen} onClose={closeModal} title={editId ? "Edit Vehicle" : "Add Vehicle to Garage"}>
        <div className="grid gap-4 py-4">
          <Field label="Make" required>
            <Autocomplete 
              value={selectedMake} 
              onChange={val => { setSelectedMake(val); setSelectedModel('') }} 
              options={makes}
              placeholder="e.g. Toyota"
            />
          </Field>
          
          <Field label="Model" required>
            <Autocomplete 
              value={selectedModel} 
              onChange={setSelectedModel} 
              options={models}
              placeholder="e.g. Camry"
              disabled={!selectedMake}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" required>
              <Input type="number" min="1990" max={new Date().getFullYear() + 1} value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2019" />
            </Field>
            <Field label="Color (Optional)">
              <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Black" />
            </Field>
          </div>
          
          <Field label="Plate Number (Optional)" hint="e.g. ABC-123-XY">
            <Input value={plateNumber} onChange={e => setPlateNumber(e.target.value)} placeholder="e.g. ABC-123-XY" className="uppercase" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSaveCar} disabled={!selectedMake || !selectedModel || !year}>
            {editId ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
