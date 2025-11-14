/**
 * Session Management Utilities
 * 
 * Handles persistent sessionId generation and storage in localStorage.
 * Each visitor gets a unique sessionId that persists across page reloads.
 * 
 * The sessionId is used to track:
 * - Page visits
 * - Chat interactions
 * - User behavior across sessions
 */

import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'sessionId';

/**
 * Get or create a session ID
 * If no sessionId exists in localStorage, generates a new UUID
 * 
 * @returns {string} The session ID
 */
export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Track a page visit
 * Sends a POST request to the backend to log the visit
 * 
 * @param {string} path - The current page path
 * @param {number|null} userId - The user ID if logged in, null otherwise
 */
export async function trackVisit(path, userId = null) {
  try {
    const sessionId = getSessionId();
    
    await fetch('http://localhost:4000/api/track/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userId,
        path
      })
    });
  } catch (error) {
    // Silently fail - tracking should not break the app
    console.error('Failed to track visit:', error);
  }
}

/**
 * Track a chat interaction
 * Sends a POST request to the backend to log a Q&A pair
 * 
 * @param {string} questionText - The user's question
 * @param {string} answerText - The assistant's answer
 * @param {string} sourcePage - 'chat' or 'contact'
 * @param {number|null} userId - The user ID if logged in, null otherwise
 */
export async function trackInteraction(questionText, answerText, sourcePage, userId = null) {
  try {
    const sessionId = getSessionId();
    
    // Limit answer text length to prevent database bloat
    const truncatedAnswer = answerText ? answerText.substring(0, 5000) : null;
    
    await fetch('http://localhost:4000/api/track/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userId,
        questionText,
        answerText: truncatedAnswer,
        sourcePage
      })
    });
  } catch (error) {
    // Silently fail - tracking should not break the app
    console.error('Failed to track interaction:', error);
  }
}

