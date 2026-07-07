/**
 * Response Modes Configuration
 * Defines the different AI response styles available to users.
 */

export const RESPONSE_MODES = {
  quick: {
    id: "quick",
    name: "Quick",
    description: "Brief, direct answer (1-2 sentences)",
    icon: "Zap",
    color: "blue",
  },
  detailed: {
    id: "detailed",
    name: "Detailed",
    description: "Comprehensive answer with context (3-4 paragraphs)",
    icon: "FileText",
    color: "amber",
  },
  expert: {
    id: "expert",
    name: "Expert Analysis",
    description: "In-depth professional analysis (5+ paragraphs)",
    icon: "Brain",
    color: "purple",
  },
}

/**
 * Get all available response modes.
 *
 * @returns {object} - Object with all response modes
 */
export function getAvailableResponseModes() {
  return RESPONSE_MODES
}

/**
 * Get a specific response mode by ID.
 *
 * @param {string} modeId - Response mode identifier
 * @returns {object} - Response mode configuration or default (detailed)
 */
export function getResponseMode(modeId) {
  return RESPONSE_MODES[modeId] || RESPONSE_MODES.detailed
}

/**
 * Get all response modes as an array for UI rendering.
 *
 * @returns {array} - Array of response mode objects
 */
export function getResponseModesArray() {
  return Object.values(RESPONSE_MODES)
}

/**
 * Check if a response mode exists.
 *
 * @param {string} modeId - Response mode identifier
 * @returns {boolean} - True if mode exists
 */
export function isValidResponseMode(modeId) {
  return modeId in RESPONSE_MODES
}

export default {
  RESPONSE_MODES,
  getAvailableResponseModes,
  getResponseMode,
  getResponseModesArray,
  isValidResponseMode,
}
