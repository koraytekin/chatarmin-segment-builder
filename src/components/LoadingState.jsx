import { motion } from 'framer-motion'

function LoadingState() {
  const dotVariants = {
    initial: { scale: 0.8, opacity: 0.4 },
    animate: { scale: 1, opacity: 1 },
  }

  const dotTransition = (delay) => ({
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
    delay,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex justify-start"
    >
      <div className="flex items-end gap-2.5">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <span role="img" aria-label="AI" className="text-sm">
            ✨
          </span>
        </div>

        {/* Loading Bubble */}
        <div className="flex flex-col items-start">
          <div className="bg-[#F3F4F6] rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Analyzing your segment</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    transition={dotTransition(index * 0.15)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingState
