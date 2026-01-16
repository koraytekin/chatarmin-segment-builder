import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Field options with icons, descriptions, and field type
const FIELD_OPTIONS = [
  { 
    value: 'Shopify Purchase', 
    label: 'Shopify Purchase', 
    icon: '🛍️', 
    description: 'Customer purchase activity',
    type: 'datetime'
  },
  { 
    value: 'Email Received', 
    label: 'Email Received', 
    icon: '📧', 
    description: 'Email engagement',
    type: 'datetime'
  },
  { 
    value: 'Customer Tag', 
    label: 'Customer Tag', 
    icon: '🏷️', 
    description: 'Customer labels and categories',
    type: 'text'
  },
  { 
    value: 'Cart Value', 
    label: 'Cart Value', 
    icon: '🛒', 
    description: 'Shopping cart amount',
    type: 'numeric'
  },
  { 
    value: 'Customer Status', 
    label: 'Customer Status', 
    icon: '👤', 
    description: 'Account status',
    type: 'text'
  },
  { 
    value: 'Last Activity', 
    label: 'Last Activity', 
    icon: '📅', 
    description: 'Recent interactions',
    type: 'datetime'
  },
  { 
    value: 'Location', 
    label: 'Location', 
    icon: '📍', 
    description: 'Customer geographic location',
    type: 'text'
  },
  { 
    value: 'Newsletter Subscriber', 
    label: 'Newsletter Subscriber', 
    icon: '📬', 
    description: 'Email subscription status',
    type: 'text'
  },
  { 
    value: 'Cart Abandoned', 
    label: 'Cart Abandoned', 
    icon: '🛒', 
    description: 'Abandoned shopping cart',
    type: 'text'
  },
]

// Operator options by field type
const OPERATORS_BY_TYPE = {
  text: [
    { value: 'is', label: 'is' },
    { value: 'is not', label: 'is not' },
    { value: 'contains', label: 'contains' },
    { value: 'does not contain', label: 'does not contain' },
  ],
  numeric: [
    { value: 'equals', label: 'equals' },
    { value: 'greater than', label: 'greater than' },
    { value: 'less than', label: 'less than' },
    { value: 'between', label: 'between' },
  ],
  datetime: [
    { value: 'in last', label: 'in last' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'is none', label: 'is none (no activity)' },
  ],
  default: [
    { value: 'is', label: 'is' },
    { value: 'is not', label: 'is not' },
    { value: 'contains', label: 'contains' },
    { value: 'greater than', label: 'greater than' },
    { value: 'less than', label: 'less than' },
  ],
}

// Default operators for each field type
const DEFAULT_OPERATORS = {
  'Shopify Purchase': 'in last',
  'Email Received': 'in last',
  'Customer Tag': 'contains',
  'Cart Value': 'greater than',
  'Customer Status': 'is',
  'Last Activity': 'in last',
  'Location': 'is',
  'Newsletter Subscriber': 'is',
  'Cart Abandoned': 'is',
}

// Default time ranges for datetime fields
const DEFAULT_TIME_RANGES = {
  'Shopify Purchase': 'Last 30 days',
  'Email Received': 'Last 7 days',
  'Last Activity': 'Last 30 days',
}

const TIME_RANGE_OPTIONS = [
  { value: 'Last 7 days', label: 'Last 7 days' },
  { value: 'Last 30 days', label: 'Last 30 days' },
  { value: 'Last 60 days', label: 'Last 60 days' },
  { value: 'Last 90 days', label: 'Last 90 days' },
  { value: 'All time', label: 'All time' },
]

// Helper to get field type
const getFieldType = (fieldValue) => {
  const field = FIELD_OPTIONS.find((f) => f.value === fieldValue)
  return field?.type || 'default'
}

// Helper to get operators for a field
const getOperatorsForField = (fieldValue) => {
  const type = getFieldType(fieldValue)
  return OPERATORS_BY_TYPE[type] || OPERATORS_BY_TYPE.default
}

// Helper to check if field needs time range
const fieldNeedsTimeRange = (fieldValue) => {
  const type = getFieldType(fieldValue)
  return type === 'datetime'
}

// Helper to check if value is required
const valueIsRequired = (operator) => {
  return operator !== 'is none'
}

// Value input configurations
const getValueConfig = (fieldValue, operator) => {
  if (operator === 'is none') {
    return { disabled: true, type: 'text', prefix: '', placeholder: 'Not required', helperText: '' }
  }
  
  if (fieldValue === 'Cart Value') {
    return { disabled: false, type: 'number', prefix: '$', placeholder: '100', helperText: 'Enter cart amount' }
  }
  
  if (fieldValue === 'Customer Tag') {
    return { disabled: false, type: 'text', prefix: '', placeholder: 'VIP, Premium, etc.', helperText: 'Use tags like VIP, Premium' }
  }
  
  if (fieldValue === 'Customer Status') {
    return { disabled: false, type: 'text', prefix: '', placeholder: 'Active, Inactive, etc.', helperText: '' }
  }
  
  if (fieldValue === 'Location') {
    return { disabled: false, type: 'text', prefix: '', placeholder: 'United States, Canada, etc.', helperText: 'Enter country or region' }
  }
  
  if (fieldValue === 'Newsletter Subscriber' || fieldValue === 'Cart Abandoned') {
    return { disabled: false, type: 'text', prefix: '', placeholder: 'True, False', helperText: '' }
  }
  
  return { disabled: false, type: 'text', prefix: '', placeholder: 'Enter value...', helperText: '' }
}

function ConditionCard({ condition, onEdit, onDelete, isExpanded, onExpand, onCollapse, onSaveNew }) {
  const { id, field, operator, value, timeRange, isNew } = condition
  const [editValues, setEditValues] = useState({
    field: field || '',
    operator: operator || '',
    value: value || '',
    timeRange: timeRange || '',
  })
  const [touched, setTouched] = useState({
    field: false,
    operator: false,
    value: false,
  })
  const [error, setError] = useState('')
  const cardRef = useRef(null)
  const operatorRef = useRef(null)
  const valueRef = useRef(null)

  // Reset edit values when condition changes or when expanding
  useEffect(() => {
    if (isExpanded) {
      setEditValues({
        field: field || '',
        operator: operator || '',
        value: value || '',
        timeRange: timeRange || '',
      })
      setTouched({ field: false, operator: false, value: false })
      setError('')
    }
  }, [isExpanded, field, operator, value, timeRange])

  // Handle ESC key to collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        handleCancel()
      }
    }
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  // Determine border color based on field type
  const getBorderColor = () => {
    const fieldLower = (isExpanded ? editValues.field : field || '').toLowerCase()
    if (fieldLower.includes('purchase') || fieldLower.includes('cart')) {
      return 'border-l-primary-500'
    }
    if (fieldLower.includes('email')) {
      return 'border-l-purple-500'
    }
    if (fieldLower.includes('tag') || fieldLower.includes('customer') || fieldLower.includes('status')) {
      return 'border-l-success-500'
    }
    if (fieldLower.includes('activity')) {
      return 'border-l-amber-500'
    }
    return 'border-l-gray-400'
  }

  // Validation
  const valueConfig = getValueConfig(editValues.field, editValues.operator)
  const needsValue = valueIsRequired(editValues.operator)
  const needsTimeRange = fieldNeedsTimeRange(editValues.field)
  
  const fieldError = touched.field && !editValues.field
  const operatorError = touched.operator && !editValues.operator
  const valueError = touched.value && needsValue && !editValues.value && !valueConfig.disabled

  const isValid = 
    editValues.field.trim() !== '' && 
    editValues.operator.trim() !== '' && 
    (!needsValue || valueConfig.disabled || editValues.value.trim() !== '')

  const handleSave = () => {
    setTouched({ field: true, operator: true, value: true })
    
    if (!isValid) {
      setError('Please fill in all required fields')
      return
    }
    
    const updatedCondition = {
      ...condition,
      field: editValues.field,
      operator: editValues.operator,
      value: valueConfig.disabled ? '' : editValues.value,
      timeRange: needsTimeRange ? (editValues.timeRange || 'Last 30 days') : null,
      isNew: false, // Remove isNew flag on save
    }
    
    // Use different callback for new vs existing conditions
    if (isNew) {
      onSaveNew?.(updatedCondition)
    } else {
      onEdit?.(updatedCondition)
    }
    onCollapse?.()
  }

  const handleCancel = () => {
    // If it's a new condition, delete it completely
    if (isNew) {
      onDelete?.(id)
      return
    }
    
    // For existing conditions, just restore original values and collapse
    setEditValues({
      field: field || '',
      operator: operator || '',
      value: value || '',
      timeRange: timeRange || '',
    })
    setTouched({ field: false, operator: false, value: false })
    setError('')
    onCollapse?.()
  }

  const handleEditClick = () => {
    onExpand?.()
  }

  const handleFieldChange = (newField) => {
    const defaultOp = DEFAULT_OPERATORS[newField] || ''
    const defaultTimeRange = DEFAULT_TIME_RANGES[newField] || ''
    
    setEditValues((prev) => ({
      ...prev,
      field: newField,
      operator: defaultOp,
      timeRange: defaultTimeRange,
    }))
    setTouched((prev) => ({ ...prev, field: true }))
    if (error) setError('')
    
    // Focus operator dropdown after field selection
    setTimeout(() => operatorRef.current?.focus(), 100)
  }

  const handleOperatorChange = (newOperator) => {
    setEditValues((prev) => ({ ...prev, operator: newOperator }))
    setTouched((prev) => ({ ...prev, operator: true }))
    if (error) setError('')
    
    // Focus value input after operator selection (if value is needed)
    if (valueIsRequired(newOperator)) {
      setTimeout(() => valueRef.current?.focus(), 100)
    }
  }

  const handleInputChange = (key, val) => {
    setEditValues((prev) => ({ ...prev, [key]: val }))
    setTouched((prev) => ({ ...prev, [key]: true }))
    if (error) setError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSave()
    }
  }

  // Get current operators based on selected field
  const currentOperators = getOperatorsForField(editValues.field)

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-lg border ${getBorderColor()} border-l-[3px] transition-all duration-300 ${
        isExpanded
          ? isNew 
            ? 'bg-[#EFF6FF] border-primary-300 shadow-lg ring-2 ring-primary-100' // New condition: more prominent
            : 'bg-[#EFF6FF] border-primary-200 shadow-md' // Existing condition being edited
          : 'bg-white border-gray-200 hover:shadow-md hover:scale-[1.02] cursor-default'
      }`}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          /* Expanded Edit Mode */
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4"
          >
            {/* Delete Button - Top Right */}
            <button
              onClick={() => onDelete?.(id)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-error-500 hover:bg-error-50 transition-colors duration-150"
              aria-label="Delete condition"
              tabIndex={5}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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

            {/* Form Fields */}
            <div className="space-y-4 pr-8">
              {/* Field */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Field
                </label>
                <select
                  value={editValues.field}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, field: true }))}
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150 ${
                    fieldError ? 'border-error-500 bg-error-50' : 'border-gray-200'
                  }`}
                  tabIndex={1}
                  aria-label="Select field type"
                  aria-invalid={fieldError}
                >
                  <option value="">Select a field...</option>
                  {FIELD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
                {fieldError && (
                  <p className="text-xs text-error-500 mt-1">This field is required</p>
                )}
                {editValues.field && !fieldError && (
                  <p className="text-xs text-gray-400 mt-1">
                    {FIELD_OPTIONS.find((f) => f.value === editValues.field)?.description}
                  </p>
                )}
              </div>

              {/* Operator */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Operator
                </label>
                <select
                  ref={operatorRef}
                  value={editValues.operator}
                  onChange={(e) => handleOperatorChange(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, operator: true }))}
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150 ${
                    operatorError ? 'border-error-500 bg-error-50' : 'border-gray-200'
                  }`}
                  tabIndex={2}
                  aria-label="Select operator"
                  aria-invalid={operatorError}
                >
                  <option value="">Select an operator...</option>
                  {currentOperators.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {operatorError && (
                  <p className="text-xs text-error-500 mt-1">This field is required</p>
                )}
              </div>

              {/* Value */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Value
                </label>
                <div className="relative">
                  {valueConfig.prefix && !valueConfig.disabled && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      {valueConfig.prefix}
                    </span>
                  )}
                  <input
                    ref={valueRef}
                    type={valueConfig.type}
                    value={editValues.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, value: true }))}
                    onKeyDown={handleKeyDown}
                    placeholder={valueConfig.placeholder}
                    disabled={valueConfig.disabled}
                    className={`w-full py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150 placeholder:text-gray-400 ${
                      valueConfig.prefix ? 'pl-7 pr-3' : 'px-3'
                    } ${
                      valueError ? 'border-error-500 bg-error-50' : 'border-gray-200'
                    } ${
                      valueConfig.disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                    }`}
                    tabIndex={3}
                    aria-label="Enter value"
                    aria-invalid={valueError}
                  />
                </div>
                {valueError && (
                  <p className="text-xs text-error-500 mt-1">This field is required</p>
                )}
                {valueConfig.helperText && !valueError && !valueConfig.disabled && (
                  <p className="text-xs text-gray-400 mt-1">{valueConfig.helperText}</p>
                )}
              </div>

              {/* Time Range - Only show for datetime fields */}
              {needsTimeRange && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    Time Range
                  </label>
                  <select
                    value={editValues.timeRange}
                    onChange={(e) => handleInputChange('timeRange', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150"
                    tabIndex={4}
                    aria-label="Select time range"
                  >
                    {TIME_RANGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2 bg-error-50 border border-error-200 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-error-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  <p className="text-xs text-error-600 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  tabIndex={6}
                >
                  {isNew ? 'Discard' : 'Cancel'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isValid}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isNew 
                      ? 'bg-success-500 hover:bg-success-600 disabled:hover:bg-success-500 focus:ring-success-500'
                      : 'bg-primary-500 hover:bg-primary-600 disabled:hover:bg-primary-500 focus:ring-primary-500'
                  }`}
                  tabIndex={7}
                >
                  {isNew ? 'Add Condition' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Collapsed View Mode */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4"
          >
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handleEditClick}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                aria-label="Edit condition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
              <button
                onClick={() => onDelete?.(id)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-error-500 hover:bg-error-50 transition-colors duration-150"
                aria-label="Delete condition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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

            {/* Content */}
            <div className="pr-16">
              {/* Field Name with Icon */}
              <h3 className="text-sm font-semibold text-gray-900 leading-tight flex items-center gap-1.5">
                <span className="text-base">
                  {FIELD_OPTIONS.find((f) => f.value === field)?.icon || '📋'}
                </span>
                {field || 'Untitled Condition'}
              </h3>

              {/* Operator + Value */}
              {(operator || value) && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-gray-400">{operator}</span>{' '}
                  <span className="text-gray-600 font-medium">{value}</span>
                </p>
              )}

              {/* Time Range */}
              {timeRange && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {timeRange}
                </p>
              )}

              {/* Empty state indicator */}
              {!field && !operator && !value && (
                <p className="text-xs text-gray-400 mt-1 italic">
                  Click to configure
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConditionCard
