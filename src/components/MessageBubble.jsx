import { motion } from 'framer-motion'

function MessageBubble({ message, isLatest = false }) {
  const { text, sender, timestamp } = message
  const isUser = sender === 'user'

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const bubbleContent = (
    <div
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 border border-gray-200'
        }`}
      >
        {isUser ? (
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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <span role="img" aria-label="AI">✨</span>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 leading-relaxed ${
            isUser
              ? 'bg-primary-500 text-white rounded-2xl rounded-br-md'
              : 'bg-[#F3F4F6] text-gray-800 rounded-2xl rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-400 mt-1.5 px-1">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  )

  if (isLatest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {bubbleContent}
      </motion.div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {bubbleContent}
    </div>
  )
}

export default MessageBubble
