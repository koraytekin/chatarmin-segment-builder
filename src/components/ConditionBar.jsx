import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ConditionCard from './ConditionCard'
import LogicOperator from './LogicOperator'

function ConditionBar({
  conditions = [],
  onClearAll,
  onSave,
  onEditCondition,
  onDeleteCondition,
  onUpdateLogicOperator,
  onAddCondition,
  onSaveNewCondition,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [expandedCardId, setExpandedCardId] = useState(null)
  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const [canScrollMore, setCanScrollMore] = useState(false)
  
  const conditionCount = conditions.length
  const hasConditions = conditionCount > 0
  
  // Refs for scrolling
  const contentRef = useRef(null)
  const cardRefs = useRef({})

  // Track scroll position for fade gradients
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      setIsScrolledDown(scrollTop > 20)
      setCanScrollMore(scrollTop + clientHeight < scrollHeight - 20)
    }
  }, [])

  // Update scroll indicators on mount and content change
  useEffect(() => {
    handleScroll()
  }, [conditions.length, handleScroll])

  // Auto-scroll to expanded card
  useEffect(() => {
    if (expandedCardId && cardRefs.current[expandedCardId]) {
      // Small delay to allow the card to expand first
      const timer = setTimeout(() => {
        cardRefs.current[expandedCardId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [expandedCardId])

  // Auto-scroll to new conditions
  useEffect(() => {
    const newCondition = conditions.find((c) => c.isNew)
    if (newCondition && cardRefs.current[newCondition.id]) {
      const timer = setTimeout(() => {
        cardRefs.current[newCondition.id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [conditions])

  const handleExpandCard = (cardId) => {
    setExpandedCardId(cardId)
  }

  const handleCollapseCard = () => {
    setExpandedCardId(null)
  }

  // Check if there's already a new condition being edited
  const hasNewCondition = conditions.some((c) => c.isNew)

  const handleAddConditionClick = () => {
    // Prevent adding another new condition if one is already being edited
    if (hasNewCondition) {
      const existingNew = conditions.find((c) => c.isNew)
      if (existingNew) {
        setExpandedCardId(existingNew.id)
        // Scroll to the existing new condition
        cardRefs.current[existingNew.id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
      return
    }

    // Create a new blank condition with isNew flag
    const newCondition = {
      id: `manual-${Date.now()}`,
      field: '',
      operator: '',
      value: '',
      timeRange: null,
      logicOperator: 'AND',
      isNew: true,
    }
    onAddCondition?.(newCondition)
    setExpandedCardId(newCondition.id)
  }

  // Store ref for each condition card
  const setCardRef = useCallback((id) => (el) => {
    if (el) {
      cardRefs.current[id] = el
    }
  }, [])

  // Add Condition Button component
  const AddConditionButton = ({ className = '' }) => (
    <motion.button
      onClick={handleAddConditionClick}
      disabled={hasNewCondition}
      whileHover={hasNewCondition ? {} : { scale: 1.01 }}
      whileTap={hasNewCondition ? {} : { scale: 0.99 }}
      className={`w-full px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-medium bg-white border-2 border-dashed rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        hasNewCondition
          ? 'text-gray-300 border-gray-200 cursor-not-allowed'
          : 'text-gray-500 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-600'
      } ${className}`}
    >
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
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      {hasNewCondition ? 'Finish editing first' : 'Add Condition'}
    </motion.button>
  )

  const handleClearClick = () => {
    if (hasConditions) {
      setShowClearConfirm(true)
    }
  }

  const handleConfirmClear = () => {
    onClearAll?.()
    setShowClearConfirm(false)
  }

  const handleCancelClear = () => {
    setShowClearConfirm(false)
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col min-h-[600px]">
        {/* Section A - HEADER (fixed at top) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            Segment Conditions
          </h2>
          <motion.span
            key={conditionCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              hasConditions
                ? 'bg-primary-50 text-primary-600'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {conditionCount} {conditionCount === 1 ? 'condition' : 'conditions'}
          </motion.span>
        </div>

        {/* Section B - CONTENT (scrollable middle area) */}
        <div className="relative flex-1 min-h-0">
          {/* Top fade gradient - shows when scrolled down */}
          {hasConditions && isScrolledDown && (
            <div 
              className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />
          )}

          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="h-full max-h-[500px] overflow-y-auto scroll-smooth scrollbar-thin"
          >
            {hasConditions ? (
              <div className="p-4">
                <div className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {conditions.map((condition, index) => (
                      <motion.div
                        key={condition.id}
                        ref={setCardRef(condition.id)}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <ConditionCard
                          condition={condition}
                          onEdit={onEditCondition}
                          onDelete={onDeleteCondition}
                          onSaveNew={onSaveNewCondition}
                          isExpanded={expandedCardId === condition.id || condition.isNew}
                          onExpand={() => handleExpandCard(condition.id)}
                          onCollapse={handleCollapseCard}
                        />
                        {/* Logic Operator between cards (not after the last one) */}
                        <AnimatePresence>
                          {index < conditions.length - 1 && (
                            <motion.div
                              key={`logic-${condition.id}`}
                              initial={{ opacity: 0, y: -8, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.9 }}
                              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
                              className="relative py-2 flex justify-center"
                            >
                              <LogicOperator
                                value={condition.logicOperator || 'AND'}
                                onChange={(newOperator) => onUpdateLogicOperator?.(condition.id, newOperator)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Add Condition Button at bottom */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="mt-3"
                  >
                    <AddConditionButton />
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 px-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <path d="M3 6h18" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 max-w-[280px] mb-5">
                  No conditions yet. Use the chat on the left or add manually below.
                </p>
                
                {/* Add Condition Button in empty state */}
                <div className="w-full max-w-[240px]">
                  <AddConditionButton />
                </div>
              </div>
            )}
          </div>

          {/* Bottom fade gradient - shows when can scroll more */}
          {hasConditions && canScrollMore && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Section C - FOOTER (fixed at bottom) */}
        <div className="h-[88px] border-t border-gray-100 shrink-0 rounded-b-xl relative">
          <AnimatePresence mode="wait">
            {showClearConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full w-full bg-[#FEF2F2] flex flex-col items-center justify-center px-5 py-4 rounded-b-xl"
              >
                <p className="text-sm text-gray-700 text-center mb-3">
                  Remove all conditions? This cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleCancelClear}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClear}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full w-full bg-gray-50/50 flex items-center px-5 py-4 rounded-b-xl"
              >
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleClearClick}
                    disabled={!hasConditions}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Clear All
                  </button>
                  {(() => {
                    // Combined disabled logic for Save Segment button
                    const hasNoConditions = !hasConditions
                    const hasUnsavedCondition = hasNewCondition
                    const isSaveDisabled = hasNoConditions || hasUnsavedCondition
                    
                    // Determine tooltip message
                    const tooltipMessage = hasUnsavedCondition
                      ? 'Save or cancel the open condition first'
                      : 'Add at least one condition first'
                    
                    return (
                      <div className="relative flex-1 group">
                        <button
                          onClick={() => !isSaveDisabled && onSave?.()}
                          disabled={isSaveDisabled}
                          className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            isSaveDisabled
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                              : 'bg-primary-500 text-white cursor-pointer hover:bg-primary-600 hover:shadow-md'
                          }`}
                        >
                          Save Segment
                        </button>
                        {/* Tooltip - shows when disabled */}
                        {isSaveDisabled && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
                            {tooltipMessage}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default ConditionBar
