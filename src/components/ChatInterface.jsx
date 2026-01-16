import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import LoadingState from './LoadingState'
import EmptyState from './EmptyState'
import ChatInput from './ChatInput'
import { parseUserInput } from '../utils/aiParser'

function ChatInterface({ conditions = [], onAddConditions, onRemoveConditions, onUpdateLogicOperator }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Handle scroll position to show/hide top fade
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current
      setIsScrolledDown(scrollTop > 20)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const getRandomDelay = () => {
    // Random delay between 1.2 and 1.8 seconds for natural feel
    return 1200 + Math.random() * 600
  }

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI thinking with natural delay
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay()))

    // Parse user input and get AI response
    const { aiResponse, newConditions, removedConditions, updatePreviousLogic } = parseUserInput(
      text.trim(),
      conditions
    )

    // Update conditions via parent callbacks
    if (removedConditions && removedConditions.length > 0) {
      const removedIds = removedConditions.map((c) => c.id)
      onRemoveConditions?.(removedIds)
    } else if (newConditions && newConditions.length > 0) {
      // If there are existing conditions and we detected a logic operator,
      // update the LAST existing condition's logic operator before adding new ones
      if (updatePreviousLogic && conditions.length > 0) {
        const lastConditionId = conditions[conditions.length - 1].id
        onUpdateLogicOperator?.(lastConditionId, updatePreviousLogic)
      }
      onAddConditions?.(newConditions)
    }

    // Add AI response
    const aiMessage = {
      id: `ai-${Date.now()}`,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMessage])
    setIsLoading(false)
  }

  const handleExampleClick = (exampleText) => {
    handleSendMessage(exampleText)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Message History Area */}
      <div className="relative flex-1 min-h-0">
        {/* Top fade gradient - shows when scrolled down */}
        {hasMessages && isScrolledDown && (
          <div 
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />
        )}
        
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full max-h-[500px] overflow-y-auto scroll-smooth scrollbar-thin"
        >
          {hasMessages ? (
            <div className="p-5 space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1 && !isLoading}
                />
              ))}
              {isLoading && <LoadingState />}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          ) : (
            <EmptyState onExampleClick={handleExampleClick} />
          )}
        </div>

        {/* Bottom fade gradient - shows when there's more content below */}
        {hasMessages && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Chat Input */}
      <div className="h-[88px] p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center">
        <div className="flex-1">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Describe conditions to add..."
          />
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
