import { motion } from 'framer-motion'

function SuccessState({ segmentName, audienceSize, onClose, onCreateAnother }) {
  const formatNumber = (num) => {
    return num?.toLocaleString() || '0'
  }

  // Confetti particles
  const confettiColors = ['#10B981', '#2563EB', '#F59E0B', '#8B5CF6', '#EC4899']
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 4 + Math.random() * 6,
  }))

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px] p-8 overflow-hidden">
      {/* Confetti */}
      {confettiParticles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 1, 
            y: -20, 
            rotate: 0,
          }}
          animate={{ 
            opacity: 0, 
            y: 600,
            rotate: 360 * (particle.id % 2 === 0 ? 1 : -1),
          }}
          transition={{ 
            duration: particle.duration, 
            delay: particle.delay,
            ease: 'linear',
          }}
          className="absolute top-0 pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.id % 2 === 0 ? '50%' : '2px',
            left: `${particle.x}%`,
          }}
        />
      ))}

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
        aria-label="Close"
      >
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </motion.button>

      {/* Success Checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 15,
          delay: 0.1,
        }}
        className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center mb-6 shadow-lg shadow-success-500/30"
      >
        <motion.svg
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            d="M20 6 9 17l-5-5"
          />
        </motion.svg>
      </motion.div>

      {/* Success Message */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold text-gray-900 mb-2 text-center"
      >
        Segment Created!
      </motion.h2>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-gray-500 text-center mb-1"
      >
        Your segment is ready to use
      </motion.p>

      {/* Segment Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative group mb-3"
      >
        <p className="text-lg font-medium text-primary-600 text-center max-w-md truncate px-4">
          "{segmentName.length > 50 ? `${segmentName.slice(0, 50)}...` : segmentName}"
        </p>
        {segmentName.length > 50 && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none max-w-xs text-center z-10">
            {segmentName}
          </div>
        )}
      </motion.div>

      {/* Audience Size */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="flex items-center gap-2 text-gray-500 mb-8"
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Targeting ~{formatNumber(audienceSize)} contacts</span>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors duration-150 shadow-sm"
        >
          View Segment
        </button>
        <button
          onClick={onCreateAnother}
          className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
        >
          Create Another Segment
        </button>
      </motion.div>

      {/* Decorative Rings */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute w-[400px] h-[400px] rounded-full border-2 border-success-500 pointer-events-none"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.05 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute w-[550px] h-[550px] rounded-full border-2 border-success-500 pointer-events-none"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}

export default SuccessState
