import { useState } from 'react'
import { PhoneCallIcon } from 'lucide-react'

export function EmergencyButton() {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href="tel:08036798700"
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Emergency Call"
    >
      <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 blur-xl group-hover:bg-orange-500 group-hover:opacity-40 transition-all duration-500" />
      <div className="animate-pulse-ring absolute inset-0 rounded-full bg-red-500/30" />
      
      <div className={`relative flex items-center bg-gradient-emergency text-white rounded-full p-4 shadow-[0_8px_30px_rgba(239,68,68,0.5)] transition-all duration-300 ${hovered ? 'scale-105 shadow-[0_8px_40px_rgba(249,115,22,0.6)]' : 'scale-100'}`}>
        <PhoneCallIcon size={24} className={`transition-transform duration-300 ${hovered ? 'rotate-12' : 'rotate-0'}`} />
        
        <div className={`overflow-hidden transition-all duration-300 ${hovered ? 'max-w-[150px] ml-3 opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="font-bold whitespace-nowrap">Emergency Call</span>
        </div>
      </div>
    </a>
  )
}
