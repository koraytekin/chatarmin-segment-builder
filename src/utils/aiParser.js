import {
  mockPatterns,
  fallbackResponse,
  removalResponses,
} from '../data/mockResponses'

// ============================================
// CONSTANTS & MAPPINGS
// ============================================

// Country abbreviation expansions
const COUNTRY_ABBREVIATIONS = {
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'us': 'United States',
  'u.s.': 'United States',
  'usa': 'United States',
  'u.s.a.': 'United States',
  'uae': 'United Arab Emirates',
  'eu': 'Europe',
}

// Regional expansions
const REGIONAL_GROUPS = {
  'europe': 'United Kingdom, Germany, France, Spain, Italy, Netherlands',
  'eu': 'United Kingdom, Germany, France, Spain, Italy, Netherlands',
  'asia': 'Japan, China, India, Singapore, South Korea, Thailand',
  'north america': 'United States, Canada, Mexico',
  'south america': 'Brazil, Argentina, Chile, Colombia',
  'middle east': 'United Arab Emirates, Saudi Arabia, Israel, Qatar',
  'oceania': 'Australia, New Zealand',
  'apac': 'Japan, China, India, Singapore, Australia, South Korea',
}

// Time range normalizations
const TIME_RANGE_MAPPINGS = {
  'yesterday': 'Last 1 day',
  'today': 'Last 1 day',
  'last day': 'Last 1 day',
  'past day': 'Last 1 day',
  'this week': 'Last 7 days',
  'last week': 'Last 7 days',
  'past week': 'Last 7 days',
  '7 days': 'Last 7 days',
  'a week': 'Last 7 days',
  'one week': 'Last 7 days',
  '1 week': 'Last 7 days',
  'two weeks': 'Last 14 days',
  '2 weeks': 'Last 14 days',
  'this month': 'Last 30 days',
  'last month': 'Last 30 days',
  'past month': 'Last 30 days',
  '30 days': 'Last 30 days',
  'a month': 'Last 30 days',
  'one month': 'Last 30 days',
  '1 month': 'Last 30 days',
  'two months': 'Last 60 days',
  '2 months': 'Last 60 days',
  '60 days': 'Last 60 days',
  'three months': 'Last 90 days',
  '3 months': 'Last 90 days',
  '90 days': 'Last 90 days',
  'quarter': 'Last 90 days',
  'last quarter': 'Last 90 days',
  'six months': 'Last 180 days',
  '6 months': 'Last 180 days',
  'half year': 'Last 180 days',
  'this year': 'Last 365 days',
  'last year': 'Last 365 days',
  'past year': 'Last 365 days',
  'a year': 'Last 365 days',
  'one year': 'Last 365 days',
  '1 year': 'Last 365 days',
  '365 days': 'Last 365 days',
}

// Field synonyms
const FIELD_SYNONYMS = {
  // Customer Tag synonyms
  'vip': { field: 'Customer Tag', value: 'VIP' },
  'premium': { field: 'Customer Tag', value: 'Premium' },
  'gold': { field: 'Customer Tag', value: 'Gold' },
  'loyal': { field: 'Customer Tag', value: 'Loyal' },
  'high-value': { field: 'Customer Tag', value: 'VIP' },
  'high value': { field: 'Customer Tag', value: 'VIP' },
  
  // Newsletter/Subscriber synonyms
  'subscriber': { field: 'Newsletter Subscriber', value: 'True' },
  'subscribed': { field: 'Newsletter Subscriber', value: 'True' },
  'newsletter': { field: 'Newsletter Subscriber', value: 'True' },
}

// Purchase action words
const PURCHASE_KEYWORDS = ['purchased', 'bought', 'ordered', 'shopped', 'purchase', 'buy', 'order']

// Email action words
const EMAIL_KEYWORDS = ['emailed', 'email', 'sent email', 'contacted', 'messaged']

// Location prepositions
const LOCATION_PREPOSITIONS = ['from', 'in', 'located in', 'based in', 'living in', 'residing in']

// Negation keywords
const NEGATION_KEYWORDS = ['not', 'exclude', 'except', 'filter out', 'excluding', 'without', "don't", "doesn't", "haven't", "hasn't", "didn't"]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Expand country abbreviations to full names
 */
const expandAbbreviation = (input) => {
  const lower = input.toLowerCase().trim()
  return COUNTRY_ABBREVIATIONS[lower] || input.trim()
}

/**
 * Expand regional groups to country lists
 */
const expandRegion = (input) => {
  const lower = input.toLowerCase().trim()
  return REGIONAL_GROUPS[lower] || null
}

/**
 * Parse multiple locations from input (handles /, comma, "or", "and")
 */
const parseMultipleLocations = (input) => {
  // Split by common delimiters: /, comma, "or", "and"
  const parts = input
    .split(/\s*[\/,]\s*|\s+or\s+|\s+and\s+/i)
    .map(p => p.trim())
    .filter(p => p.length > 0)
  
  const expandedParts = []
  
  for (const part of parts) {
    // Check if it's a region
    const regionExpansion = expandRegion(part)
    if (regionExpansion) {
      // For regions, we'll use the region name directly
      expandedParts.push(part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    } else {
      // Expand abbreviations
      expandedParts.push(expandAbbreviation(part))
    }
  }
  
  return expandedParts
}

/**
 * Extract location from input using various patterns
 */
const extractLocation = (input) => {
  const lowerInput = input.toLowerCase()
  
  // Patterns for location extraction
  const patterns = [
    // "from UK/Europe" or "from UK, Europe"
    /(?:from|in|located in|based in|living in|residing in)\s+([A-Za-z\/,\s]+?)(?:\s+who|\s+that|\s+and|\s+or\s+(?!customers|users|people)|$)/i,
    // "[country] customers" or "[country] users"
    /([A-Za-z\/,\s]+?)\s+(?:customers|users|people|members)/i,
    // "customers in/from [country]"
    /(?:customers|users|people|members)\s+(?:from|in)\s+([A-Za-z\/,\s]+?)(?:\s+who|\s+that|$)/i,
  ]
  
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match && match[1]) {
      const locationStr = match[1].trim()
      // Filter out common non-location words
      const nonLocationWords = ['who', 'that', 'with', 'without', 'have', 'has', 'had', 'vip', 'premium', 'gold', 'loyal']
      const cleaned = locationStr.split(/\s+/)
        .filter(word => !nonLocationWords.includes(word.toLowerCase()))
        .join(' ')
      
      if (cleaned.length > 0) {
        return parseMultipleLocations(cleaned)
      }
    }
  }
  
  return null
}

/**
 * Detect if the message contains negation for a specific part
 */
const detectNegation = (input, nearWord = null) => {
  const lowerInput = input.toLowerCase()
  
  // Check for negation keywords
  for (const neg of NEGATION_KEYWORDS) {
    if (lowerInput.includes(neg)) {
      // If nearWord is provided, check if negation is near that word
      if (nearWord) {
        const negIndex = lowerInput.indexOf(neg)
        const wordIndex = lowerInput.indexOf(nearWord.toLowerCase())
        // Negation should be within 30 characters of the word
        if (Math.abs(negIndex - wordIndex) < 30) {
          return true
        }
      } else {
        return true
      }
    }
  }
  
  return false
}

/**
 * Parse numeric range from input
 */
const parseNumericRange = (input) => {
  const lowerInput = input.toLowerCase()
  
  // Between X and Y
  const betweenMatch = lowerInput.match(/between\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*\$?\s*(\d+(?:\.\d+)?)/)
  if (betweenMatch) {
    return { operator: 'between', value: `$${betweenMatch[1]}-$${betweenMatch[2]}` }
  }
  
  // More than / greater than / over / above
  const greaterMatch = lowerInput.match(/(?:more than|greater than|over|above|exceeds?|at least)\s*\$?\s*(\d+(?:\.\d+)?)/)
  if (greaterMatch) {
    return { operator: 'greater than', value: `$${greaterMatch[1]}` }
  }
  
  // Less than / under / below
  const lessMatch = lowerInput.match(/(?:less than|under|below|at most)\s*\$?\s*(\d+(?:\.\d+)?)/)
  if (lessMatch) {
    return { operator: 'less than', value: `$${lessMatch[1]}` }
  }
  
  // Equals / exactly
  const equalsMatch = lowerInput.match(/(?:equals?|exactly|is)\s*\$?\s*(\d+(?:\.\d+)?)(?:\s|$)/)
  if (equalsMatch) {
    return { operator: 'equals', value: `$${equalsMatch[1]}` }
  }
  
  // Just a number with $
  const simpleMatch = lowerInput.match(/\$\s*(\d+(?:\.\d+)?)/)
  if (simpleMatch) {
    return { operator: 'greater than', value: `$${simpleMatch[1]}` }
  }
  
  return null
}

/**
 * Normalize time range from natural language
 */
const normalizeTimeRange = (input) => {
  const lowerInput = input.toLowerCase()
  
  // Check for exact matches first
  for (const [pattern, normalized] of Object.entries(TIME_RANGE_MAPPINGS)) {
    if (lowerInput.includes(pattern)) {
      return normalized
    }
  }
  
  // Check for "last X days" pattern
  const daysMatch = lowerInput.match(/(?:last|past)\s+(\d+)\s*days?/)
  if (daysMatch) {
    return `Last ${daysMatch[1]} days`
  }
  
  // Check for "last X weeks" pattern
  const weeksMatch = lowerInput.match(/(?:last|past)\s+(\d+)\s*weeks?/)
  if (weeksMatch) {
    const days = parseInt(weeksMatch[1]) * 7
    return `Last ${days} days`
  }
  
  // Check for "last X months" pattern
  const monthsMatch = lowerInput.match(/(?:last|past)\s+(\d+)\s*months?/)
  if (monthsMatch) {
    const days = parseInt(monthsMatch[1]) * 30
    return `Last ${days} days`
  }
  
  return null
}

/**
 * Extract tag/segment name from input
 */
const extractTag = (input) => {
  const lowerInput = input.toLowerCase()
  
  // Check for known synonyms
  for (const [keyword, mapping] of Object.entries(FIELD_SYNONYMS)) {
    if (lowerInput.includes(keyword)) {
      return mapping
    }
  }
  
  // Check for "tag is X" or "tagged as X"
  const tagMatch = input.match(/tag(?:ged)?\s+(?:is|as|with)?\s*["']?([A-Za-z0-9_-]+)["']?/i)
  if (tagMatch) {
    return { field: 'Customer Tag', value: tagMatch[1] }
  }
  
  return null
}

/**
 * Check if message contains purchase-related keywords
 */
const hasPurchaseIntent = (input) => {
  const lowerInput = input.toLowerCase()
  return PURCHASE_KEYWORDS.some(keyword => lowerInput.includes(keyword))
}

/**
 * Check if message contains email-related keywords
 */
const hasEmailIntent = (input) => {
  const lowerInput = input.toLowerCase()
  return EMAIL_KEYWORDS.some(keyword => lowerInput.includes(keyword))
}

/**
 * Check if message contains cart-related keywords
 */
const hasCartIntent = (input) => {
  const lowerInput = input.toLowerCase()
  return lowerInput.includes('cart') || lowerInput.includes('abandon')
}

/**
 * Parse a complex message into multiple conditions
 */
const parseComplexMessage = (message, existingConditions = []) => {
  const conditions = []
  const lowerMessage = message.toLowerCase()
  let response = ''
  
  // 1. Check for location
  const locations = extractLocation(message)
  if (locations && locations.length > 0) {
    const locationValue = locations.join(', ')
    const isNegated = detectNegation(message, locations[0])
    
    conditions.push({
      id: `location-${Date.now()}`,
      field: 'Location',
      operator: isNegated ? 'is not' : 'is',
      value: locationValue,
      timeRange: null,
      logicOperator: 'AND',
    })
    
    response += `${isNegated ? 'Excluding' : 'Added'}: Location ${isNegated ? 'is not' : 'is'} ${locationValue}. `
  }
  
  // 2. Check for customer tag / VIP / premium
  const tagInfo = extractTag(message)
  if (tagInfo) {
    const isNegated = detectNegation(message, tagInfo.value)
    
    conditions.push({
      id: `tag-${Date.now()}`,
      field: tagInfo.field,
      operator: isNegated ? 'does not contain' : 'contains',
      value: tagInfo.value,
      timeRange: null,
      logicOperator: 'AND',
    })
    
    response += `Added: ${tagInfo.value} customers. `
  }
  
  // 3. Check for purchase conditions
  if (hasPurchaseIntent(message)) {
    const timeRange = normalizeTimeRange(message) || 'Last 30 days'
    const isNegated = detectNegation(message, 'purchase') || 
                      detectNegation(message, 'bought') ||
                      lowerMessage.includes("haven't") ||
                      lowerMessage.includes("hasn't") ||
                      lowerMessage.includes("didn't")
    
    conditions.push({
      id: `purchase-${Date.now()}`,
      field: 'Shopify Purchase',
      operator: isNegated ? 'is' : 'is',
      value: isNegated ? 'None' : 'Any',
      timeRange: timeRange,
      logicOperator: 'AND',
    })
    
    response += `Added: ${isNegated ? 'No purchases' : 'Purchased'} in ${timeRange.toLowerCase()}. `
  }
  
  // 4. Check for email conditions
  if (hasEmailIntent(message)) {
    const timeRange = normalizeTimeRange(message) || 'Last 7 days'
    const isNegated = detectNegation(message, 'email') ||
                      lowerMessage.includes('without email') ||
                      lowerMessage.includes('no email')
    
    conditions.push({
      id: `email-${Date.now()}`,
      field: 'Email Received',
      operator: isNegated ? 'is not' : 'is',
      value: 'Any',
      timeRange: timeRange,
      logicOperator: 'AND',
    })
    
    response += `Added: ${isNegated ? 'No emails' : 'Emailed'} in ${timeRange.toLowerCase()}. `
  }
  
  // 5. Check for cart conditions
  if (hasCartIntent(message)) {
    const numericRange = parseNumericRange(message)
    const timeRange = normalizeTimeRange(message) || 'Last 7 days'
    
    if (numericRange) {
      conditions.push({
        id: `cart-value-${Date.now()}`,
        field: 'Cart Value',
        operator: numericRange.operator,
        value: numericRange.value,
        timeRange: timeRange,
        logicOperator: 'AND',
      })
      response += `Added: Cart value ${numericRange.operator} ${numericRange.value}. `
    } else if (lowerMessage.includes('abandon')) {
      conditions.push({
        id: `cart-abandon-${Date.now()}`,
        field: 'Cart Abandoned',
        operator: 'is',
        value: 'True',
        timeRange: timeRange,
        logicOperator: 'AND',
      })
      response += `Added: Cart abandoners in ${timeRange.toLowerCase()}. `
    }
  }
  
  // 6. Check for subscriber conditions
  if (lowerMessage.includes('subscriber') || lowerMessage.includes('newsletter')) {
    const isNegated = detectNegation(message, 'subscriber') || detectNegation(message, 'newsletter')
    
    conditions.push({
      id: `subscriber-${Date.now()}`,
      field: 'Newsletter Subscriber',
      operator: 'is',
      value: isNegated ? 'False' : 'True',
      timeRange: null,
      logicOperator: 'AND',
    })
    
    response += `Added: ${isNegated ? 'Non-subscribers' : 'Newsletter subscribers'}. `
  }
  
  return { conditions, response }
}

// ============================================
// LEGACY PATTERN MATCHING (for fallback)
// ============================================

const matchesKeywordGroup = (message, keywordGroup) => {
  const lowerMessage = message.toLowerCase()
  return keywordGroup.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))
}

const matchesPattern = (message, pattern) => {
  return pattern.keywords.every((keywordGroup) => matchesKeywordGroup(message, keywordGroup))
}

const findMatchingPattern = (message) => {
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

// ============================================
// LOGIC OPERATOR DETECTION
// ============================================

const detectLogicOperator = (message) => {
  const lowerMessage = message.toLowerCase().trim()

  const orIndicators = [
    /^or\s/,
    /\bor customers\b/,
    /\bor anyone\b/,
    /\bor those\b/,
    /\bor people\b/,
    /\bor users\b/,
    /\bplus customers\b/,
    /\bplus anyone\b/,
    /\balso include\b/,
    /\bincluding those\b/,
    /\binclude also\b/,
    /\beither.*or\b/,
    /\balternatively\b/,
  ]

  for (const pattern of orIndicators) {
    if (pattern.test(lowerMessage)) {
      return 'OR'
    }
  }

  return 'AND'
}

// ============================================
// REMOVAL HANDLING
// ============================================

const isRemovalRequest = (message) => {
  const lowerMessage = message.toLowerCase()
  return (
    lowerMessage.includes('remove') ||
    lowerMessage.includes('delete') ||
    lowerMessage.includes('cancel') ||
    lowerMessage.includes('undo')
  )
}

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

  if (existingConditions.length > 0) {
    return [existingConditions[existingConditions.length - 1]]
  }

  return []
}

// ============================================
// DUPLICATE CHECKING
// ============================================

const isDuplicateCondition = (newCondition, existingConditions) => {
  return existingConditions.some(
    (existing) =>
      existing.field === newCondition.field &&
      existing.operator === newCondition.operator &&
      existing.value === newCondition.value
  )
}

const filterDuplicates = (newConditions, existingConditions) => {
  return newConditions.filter(
    (newCond) => !isDuplicateCondition(newCond, existingConditions)
  )
}

// ============================================
// MAIN PARSER FUNCTION
// ============================================

/**
 * Parse user input and return AI response with conditions
 * @param {string} message - User's message
 * @param {array} existingConditions - Current conditions in the segment
 * @returns {{ aiResponse: string, newConditions: array, removedConditions: array, updatePreviousLogic: string | null }}
 */
export const parseUserInput = (message, existingConditions = []) => {
  const trimmedMessage = message.trim()
  const lowerMessage = trimmedMessage.toLowerCase()

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

  // Try complex message parsing first (handles multiple conditions)
  const { conditions: parsedConditions, response: parsedResponse } = parseComplexMessage(
    trimmedMessage,
    existingConditions
  )

  if (parsedConditions.length > 0) {
    // Filter out duplicates
    const uniqueConditions = filterDuplicates(parsedConditions, existingConditions)
    
    if (uniqueConditions.length === 0) {
      return {
        aiResponse: "Those conditions already exist. Try adding different criteria or edit the existing conditions.",
        newConditions: [],
        removedConditions: [],
        updatePreviousLogic: null,
      }
    }

    // Add logic context for OR
    let finalResponse = parsedResponse.trim()
    if (hasExistingConditions && detectedLogic === 'OR') {
      finalResponse = `Using OR logic: ${finalResponse}`
    }

    // Log for debugging
    console.log('[AI Parser] Input:', trimmedMessage)
    console.log('[AI Parser] Parsed conditions:', uniqueConditions)
    console.log('[AI Parser] Response:', finalResponse)

    return {
      aiResponse: finalResponse || `Added ${uniqueConditions.length} condition${uniqueConditions.length > 1 ? 's' : ''}.`,
      newConditions: uniqueConditions,
      removedConditions: [],
      updatePreviousLogic: hasExistingConditions ? detectedLogic : null,
    }
  }

  // Fall back to legacy pattern matching
  const matchedPattern = findMatchingPattern(trimmedMessage)

  if (matchedPattern) {
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

    // Add unique IDs and logic operator
    const timestamp = Date.now()
    const conditionsWithIds = newConditions.map((cond, index) => ({
      ...cond,
      id: `${cond.id}-${timestamp}-${index}`,
      logicOperator: 'AND',
    }))

    let aiResponse = matchedPattern.aiResponse
    if (hasExistingConditions && detectedLogic === 'OR') {
      aiResponse = aiResponse.replace(/^Added:/, 'Added with OR:')
    }

    return {
      aiResponse,
      newConditions: conditionsWithIds,
      removedConditions: [],
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
