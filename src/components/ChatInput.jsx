import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Describe your segment...',
}) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const textareaRef = useRef(null)
  const charCount = value.length
  const showCharCount = charCount > 200
  const isWarning = charCount > 300
  const canSend = value.trim().length > 0 && !disabled

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus()
    }
  }, [disabled])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const lineHeight = 24
      const maxHeight = lineHeight * 4
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [value])

  const handleSend = () => {
    if (canSend) {
      onSend?.(value.trim())
      setValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } else if (!disabled && value.trim().length === 0) {
      // Shake animation for empty input
      setShake(true)
      setTimeout(() => setShake(false), 500)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 transition-all duration-200 focus-within:shadow-md focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100">
      <div className="flex items-end gap-3">
        {/* Textarea */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '96px' }}
          />
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={disabled}
          animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 ${
            canSend
              ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95 shadow-sm hover:shadow'
              : disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer'
          }`}
          aria-label="Send message"
        >
          {disabled ? (
            <svg
              className="w-5 h-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Character Count */}
      {showCharCount && (
        <div className="flex justify-end mt-2 pr-1">
          <span
            className={`text-xs transition-colors duration-150 ${
              isWarning ? 'text-error-500 font-medium' : 'text-gray-400'
            }`}
          >
            {charCount} characters
          </span>
        </div>
      )}
    </div>
  )
}

export default ChatInput
