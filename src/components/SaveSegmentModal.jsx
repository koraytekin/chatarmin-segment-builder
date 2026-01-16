import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function SaveSegmentModal({ isOpen, conditions = [], onClose, onSave }) {
  const [segmentName, setSegmentName] = useState('')
  const inputRef = useRef(null)

  // Generate suggested name based on conditions
  const generateSuggestedName = useCallback(() => {
    if (conditions.length === 0) return 'New Segment'

    const firstCondition = conditions[0]
    const field = firstCondition.field?.toLowerCase() || ''
    const value = firstCondition.value || ''
    const timeRange = firstCondition.timeRange || ''

    if (field.includes('purchase')) {
      return `Customers ${firstCondition.operator === 'is' && value === 'None' ? 'without' : 'with'} purchase${timeRange ? ` in ${timeRange.toLowerCase()}` : ''}`
    }
    if (field.includes('email')) {
      return `Customers ${firstCondition.operator?.includes('not') ? 'without' : 'with'} email activity${timeRange ? ` ${timeRange.toLowerCase()}` : ''}`
    }
    if (field.includes('tag') || field.includes('vip')) {
      return `${value} customers`
    }
    if (field.includes('cart')) {
      return `Cart abandoners${value ? ` ${value}` : ''}`
    }
    if (field.includes('subscriber')) {
      return 'Newsletter subscribers'
    }
    if (field.includes('location')) {
      return `Customers in ${value}`
    }

    return `Segment with ${conditions.length} condition${conditions.length > 1 ? 's' : ''}`
  }, [conditions])

  // Generate mock audience size based on conditions
  const estimatedAudience = useCallback(() => {
    const base = 1000 + conditions.length * 500
    const variance = Math.floor(Math.random() * 2000)
    return Math.max(500, base + variance - 1000)
  }, [conditions])

  const [audienceSize] = useState(() => estimatedAudience())

  // Reset and set suggested name when modal opens
  useEffect(() => {
    if (isOpen) {
      setSegmentName(generateSuggestedName())
      // Focus input after a short delay for animation
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, generateSuggestedName])

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  const handleSave = () => {
    if (segmentName.trim()) {
      onSave?.(segmentName.trim())
      onClose?.()
    }
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && segmentName.trim()) {
      handleSave()
    }
  }

  const formatNumber = (num) => {
    return num.toLocaleString()
  }

  const isValid = segmentName.trim().length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Save Your Segment
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Segment Name Input */}
              <div>
                <label
                  htmlFor="segmentName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Segment name
                </label>
                <input
                  ref={inputRef}
                  id="segmentName"
                  type="text"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Enter segment name..."
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow duration-150 placeholder:text-gray-400"
                />
              </div>

              {/* Estimated Audience */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Estimated audience: ~{formatNumber(audienceSize)} contacts
                  </p>
                </div>
                <div className="relative group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400 cursor-help"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
                    This is an estimate based on your conditions
                  </div>
                </div>
              </div>

              {/* Conditions Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Conditions Summary ({conditions.length})
                </h3>
                <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg">
                  {conditions.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {conditions.map((condition, index) => (
                        <li
                          key={condition.id}
                          className="px-3 py-2.5"
                        >
                          <div className="flex items-start gap-2">
                            {/* Logic operator prefix (for 2nd condition onwards) */}
                            {index > 0 && (
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 ${
                                conditions[index - 1].logicOperator === 'OR' 
                                  ? 'bg-purple-100 text-purple-600' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {conditions[index - 1].logicOperator || 'AND'}
                              </span>
                            )}
                            {index === 0 && (
                              <span className="text-primary-500 mt-0.5">•</span>
                            )}
                            <div className="text-sm flex-1">
                              <span className="font-medium text-gray-900">
                                {condition.field}
                              </span>{' '}
                              <span className="text-gray-500">
                                {condition.operator}
                              </span>{' '}
                              <span className="text-gray-700">
                                {condition.value}
                              </span>
                              {condition.timeRange && (
                                <span className="text-gray-400 text-xs ml-1">
                                  ({condition.timeRange})
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      No conditions defined
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500"
              >
                Create Segment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SaveSegmentModal
