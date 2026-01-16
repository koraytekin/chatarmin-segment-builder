const EXAMPLE_PROMPTS = [
  "Customers who purchased in last 30 days",
  "VIP customers without email this month",
  "Cart abandoners over $100",
]

function EmptyState({ onExampleClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-6 shadow-sm">
        <span className="text-3xl" role="img" aria-label="sparkles">
          ✨
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Describe your segment in plain language
      </h2>

      {/* Subheading */}
      <p className="text-gray-500 text-center mb-8 max-w-sm">
        I'll build the conditions for you. Try an example below:
      </p>

      {/* Example Pills */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onExampleClick?.(prompt)}
            className="group relative px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-left text-gray-700 font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors duration-200">
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
                  className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="text-sm">{prompt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmptyState
