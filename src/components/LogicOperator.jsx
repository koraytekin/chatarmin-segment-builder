import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const OPERATORS = [
  { value: 'AND', label: 'AND', bgColor: 'bg-blue-100', textColor: 'text-blue-600', hoverBg: 'hover:bg-blue-200' },
  { value: 'OR', label: 'OR', bgColor: 'bg-purple-100', textColor: 'text-purple-600', hoverBg: 'hover:bg-purple-200' },
]

function LogicOperator({ value = 'AND', onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentOperator = OPERATORS.find((op) => op.value === value) || OPERATORS[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (newValue) => {
    if (newValue !== value) {
      onChange?.(newValue)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative flex items-center justify-center py-1" ref={dropdownRef}>
      {/* Connecting line above */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-px h-3 bg-gray-200" />
      
      <div className="relative z-10">
        {/* Pill button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            transition-all duration-150 shadow-sm border
            ${currentOperator.bgColor} ${currentOperator.textColor}
            ${value === 'AND' ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-200' : 'border-purple-200 hover:border-purple-300 hover:bg-purple-200'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 ${value === 'AND' ? 'focus:ring-blue-500' : 'focus:ring-purple-500'}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {currentOperator.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[80px]"
              role="listbox"
            >
              {OPERATORS.map((op) => (
                <button
                  key={op.value}
                  onClick={() => handleSelect(op.value)}
                  className={`
                    w-full px-4 py-2 text-xs font-semibold text-left
                    transition-colors duration-100
                    ${op.value === value ? `${op.bgColor} ${op.textColor}` : 'text-gray-700 hover:bg-gray-50'}
                  `}
                  role="option"
                  aria-selected={op.value === value}
                >
                  {op.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connecting line below */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-px h-3 bg-gray-200" />
    </div>
  )
}

export default LogicOperator
