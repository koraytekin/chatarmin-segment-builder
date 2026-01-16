import {
  mockPatterns,
  fallbackResponse,
  removalResponses,
} from '../data/mockResponses'

/**
 * Check if message contains any keyword from a keyword group
 */
const matchesKeywordGroup = (message, keywordGroup) => {
  const lowerMessage = message.toLowerCase()
  return keywordGroup.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))
}

/**
 * Check if message matches all keyword groups in a pattern
 */
const matchesPattern = (message, pattern) => {
  return pattern.keywords.every((keywordGroup) => matchesKeywordGroup(message, keywordGroup))
}

/**
 * Find the best matching pattern for a message
 * Patterns with more keyword groups are prioritized (more specific matches)
 */
const findMatchingPattern = (message) => {
  // Sort patterns by number of keyword groups (most specific first)
  const sortedPatterns = [...mockPatterns].sort(
    (a, b) => b.keywords.length - a.keywords.length
  )

  for (const pattern of sortedPatterns) {
    if (matchesPattern(message, pattern)) {
      return pattern
    }
  }

  return null
}

/**
 * Detect logic operator (AND/OR) from user's natural language
 * @param {string} message - User's message
 * @returns {'AND' | 'OR'} - The detected logic operator
 */
const detectLogicOperator = (message) => {
  const lowerMessage = message.toLowerCase().trim()

  // OR LOGIC indicators - check these first as they're more specific
  const orIndicators = [
    /^or\s/,                    // starts with "or "
    /\bor customers\b/,         // "or customers who..."
    /\bor anyone\b/,            // "or anyone with..."
    /\bor those\b/,             // "or those who..."
    /\bor people\b/,            // "or people who..."
    /\bor users\b/,             // "or users who..."
    /\bplus customers\b/,       // "plus customers who..."
    /\bplus anyone\b/,          // "plus anyone who..."
    /\balso include\b/,         // "also include..."
    /\bincluding those\b/,      // "including those..."
    /\binclude also\b/,         // "include also..."
    /\beither.*or\b/,           // "either...or"
    /\balternatively\b/,        // "alternatively..."
  ]

  for (const pattern of orIndicators) {
    if (pattern.test(lowerMessage)) {
      return 'OR'
    }
  }

  // Default to AND for everything else (including neutral or AND-specific phrases)
  return 'AND'
}

/**
 * Check if user wants to remove a condition
 */
const isRemovalRequest = (message) => {
  const lowerMessage = message.toLowerCase()
  return (
    lowerMessage.includes('remove') ||
    lowerMessage.includes('delete') ||
    lowerMessage.includes('cancel') ||
    lowerMessage.includes('undo')
  )
}

/**
 * Find which condition to remove based on message keywords
 */
const findConditionToRemove = (message, existingConditions) => {
  const lowerMessage = message.toLowerCase()

  const keywordToFieldMap = {
    purchase: 'Shopify Purchase',
    bought: 'Shopify Purchase',
    email: 'Email Received',
    vip: 'Customer Tag',
    cart: ['Cart Value', 'Cart Abandoned'],
    location: 'Location',
    subscriber: 'Newsletter Subscriber',
    newsletter: 'Newsletter Subscriber',
  }

  for (const [keyword, fields] of Object.entries(keywordToFieldMap)) {
    if (lowerMessage.includes(keyword)) {
      const fieldsArray = Array.isArray(fields) ? fields : [fields]
      return existingConditions.filter((cond) => fieldsArray.includes(cond.field))
    }
  }

  // If no specific keyword, remove the last condition
  if (existingConditions.length > 0) {
    return [existingConditions[existingConditions.length - 1]]
  }

  return []
}

/**
 * Check if user wants to add to existing conditions
 */
const isAdditionRequest = (message) => {
  const lowerMessage = message.toLowerCase()
  return (
    lowerMessage.startsWith('also') ||
    lowerMessage.startsWith('and ') ||
    lowerMessage.startsWith('or ') ||
    lowerMessage.includes('add ') ||
    lowerMessage.includes('include ')
  )
}

/**
 * Generate unique condition IDs and add logic operator
 */
const generateUniqueConditions = (conditions, logicOperator = 'AND') => {
  const timestamp = Date.now()
  return conditions.map((cond, index) => ({
    ...cond,
    id: `${cond.id}-${timestamp}-${index}`,
    logicOperator: cond.logicOperator || logicOperator,
  }))
}

/**
 * Parse user input and return AI response with conditions
 * @param {string} message - User's message
 * @param {array} existingConditions - Current conditions in the segment
 * @returns {{ aiResponse: string, newConditions: array, removedConditions: array, updatePreviousLogic: string | null }}
 */
export const parseUserInput = (message, existingConditions = []) => {
  const trimmedMessage = message.trim()

  // Detect logic operator from user's message
  const detectedLogic = detectLogicOperator(trimmedMessage)
  const hasExistingConditions = existingConditions.length > 0

  // Handle removal requests
  if (isRemovalRequest(trimmedMessage)) {
    const conditionsToRemove = findConditionToRemove(trimmedMessage, existingConditions)

    if (conditionsToRemove.length > 0) {
      const randomResponse =
        removalResponses[Math.floor(Math.random() * removalResponses.length)]
      return {
        aiResponse: randomResponse,
        newConditions: [],
        removedConditions: conditionsToRemove,
        updatePreviousLogic: null,
      }
    }

    return {
      aiResponse: "No matching condition found to remove. Try specifying which condition (e.g., 'remove the purchase condition').",
      newConditions: [],
      removedConditions: [],
      updatePreviousLogic: null,
    }
  }

  // Find matching pattern
  const matchedPattern = findMatchingPattern(trimmedMessage)

  if (matchedPattern) {
    // Check if any of the new conditions already exist
    const newConditions = matchedPattern.conditions.filter((newCond) => {
      return !existingConditions.some(
        (existing) =>
          existing.field === newCond.field && existing.operator === newCond.operator
      )
    })

    if (newConditions.length === 0) {
      return {
        aiResponse: "That condition already exists. Try adding a different one or edit the existing condition.",
        newConditions: [],
        removedConditions: [],
        updatePreviousLogic: null,
      }
    }

    // Build response with logic operator context
    let aiResponse = matchedPattern.aiResponse
    
    // Add logic context to response when adding to existing conditions with OR
    if (hasExistingConditions && detectedLogic === 'OR') {
      aiResponse = aiResponse.replace(/^Added:/, 'Added with OR:')
    }

    return {
      aiResponse,
      newConditions: generateUniqueConditions(newConditions, 'AND'), // New conditions default to AND for their *next* connection
      removedConditions: [],
      // If there are existing conditions, tell parent to update the LAST existing condition's logic operator
      updatePreviousLogic: hasExistingConditions ? detectedLogic : null,
    }
  }

  // No match found
  return {
    aiResponse: fallbackResponse.aiResponse,
    newConditions: [],
    removedConditions: [],
    updatePreviousLogic: null,
  }
}

export default parseUserInput
