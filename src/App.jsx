import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatInterface from './components/ChatInterface'
import ConditionBar from './components/ConditionBar'
import SaveSegmentModal from './components/SaveSegmentModal'
import SuccessState from './components/SuccessState'
import Toast from './components/Toast'

function App() {
  const [conditions, setConditions] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedSegment, setSavedSegment] = useState(null)
  const [chatKey, setChatKey] = useState(0)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  const handleAddConditions = useCallback((newConditions) => {
    if (!newConditions || newConditions.length === 0) return
    setConditions((prev) => [...prev, ...newConditions])
  }, [])

  const handleRemoveConditions = useCallback((conditionIds) => {
    if (!conditionIds || conditionIds.length === 0) return
    setConditions((prev) => prev.filter((c) => !conditionIds.includes(c.id)))
  }, [])

  const handleClearAll = () => {
    setConditions([])
    showToast('All conditions cleared', 'success')
  }

  const handleSaveSegment = () => {
    if (conditions.length === 0) {
      showToast('Add conditions before saving', 'error')
      return
    }
    setShowSaveModal(true)
  }

  const handleCloseSaveModal = () => {
    setShowSaveModal(false)
  }

  const handleConfirmSave = (segmentName) => {
    const audienceSize = 500 + Math.floor(Math.random() * 4500)

    const segment = {
      name: segmentName,
      conditions: [...conditions],
      audienceSize,
      createdAt: new Date(),
    }

    setSavedSegment(segment)
    setShowSaveModal(false)
  }

  const handleCloseSuccess = () => {
    setSavedSegment(null)
  }

  const handleCreateAnother = () => {
    setSavedSegment(null)
    setConditions([])
    setChatKey((prev) => prev + 1)
  }

  const handleEditCondition = (updatedCondition) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === updatedCondition.id ? updatedCondition : c))
    )
    showToast('Condition updated', 'success')
  }

  const handleDeleteCondition = (conditionId) => {
    setConditions((prev) => prev.filter((c) => c.id !== conditionId))
    showToast('Condition removed', 'success')
  }

  const handleUpdateLogicOperator = (conditionId, newOperator) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === conditionId ? { ...c, logicOperator: newOperator } : c))
    )
  }

  const handleAddManualCondition = (newCondition) => {
    setConditions((prev) => [...prev, newCondition])
  }

  const handleSaveNewCondition = (savedCondition) => {
    // Update the condition in state (remove isNew flag, update values)
    setConditions((prev) =>
      prev.map((c) => (c.id === savedCondition.id ? { ...savedCondition, isNew: false } : c))
    )
    showToast('Condition added', 'success')
  }

  // Show success state if segment was saved
  if (savedSegment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <div className="w-9 h-9 rounded-full bg-success-100 flex items-center justify-center">
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
                  className="text-success-600"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Segment Created
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Success State */}
        <main className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <SuccessState
              segmentName={savedSegment.name}
              audienceSize={savedSegment.audienceSize}
              onClose={handleCloseSuccess}
              onCreateAnother={handleCreateAnother}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
              aria-label="Go back"
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
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Create Segment
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* Left Column - Chat Interface (60%) */}
          <div className="lg:col-span-3 flex">
            <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <ChatInterface
                key={chatKey}
                conditions={conditions}
                onAddConditions={handleAddConditions}
                onRemoveConditions={handleRemoveConditions}
                onUpdateLogicOperator={handleUpdateLogicOperator}
              />
            </div>
          </div>

          {/* Right Column - Conditions Panel (40%) */}
          <div className="lg:col-span-2 flex">
            <ConditionBar
              conditions={conditions}
              onClearAll={handleClearAll}
              onSave={handleSaveSegment}
              onEditCondition={handleEditCondition}
              onDeleteCondition={handleDeleteCondition}
              onUpdateLogicOperator={handleUpdateLogicOperator}
              onAddCondition={handleAddManualCondition}
              onSaveNewCondition={handleSaveNewCondition}
            />
          </div>
        </div>
      </main>

      {/* Save Segment Modal */}
      <SaveSegmentModal
        isOpen={showSaveModal}
        conditions={conditions}
        onClose={handleCloseSaveModal}
        onSave={handleConfirmSave}
      />

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
