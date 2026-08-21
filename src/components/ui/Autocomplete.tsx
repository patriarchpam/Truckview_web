import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Autocomplete({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  disabled = false,
  className = '',
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearch(value)
  }, [value])

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // Revert search back to actual value if they click away
        setSearch(value)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  const handleSelect = (opt: string) => {
    onChange(opt)
    setSearch(opt)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    onChange(val) // Update value immediately to support custom user-defined make/model
    if (!isOpen) setIsOpen(true)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-muted focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted">
          <Search size={16} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg ring-1 ring-black/5 scrollbar-thin">
          {filteredOptions.length === 0 ? (
            <div className="py-2.5 px-4 text-sm text-muted">
              Press enter to use "{search}"
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2 ${
                  value.toLowerCase() === opt.toLowerCase()
                    ? 'bg-accent-50/50 text-accent-600 font-medium dark:bg-accent-900/10'
                    : 'text-ink-soft'
                }`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
