/**
 * ============================================================================
 * Dashmesh Properties — Custom WhatsApp AI Chat Bot Template
 * ============================================================================
 * Clean Slate Template: Customize this file with your own prompts, logic,
 * or AI models (Gemini, OpenAI, Claude, etc.)!
 */

'use strict';

/**
 * Basic Business Facts (Used by system diagnostics & health checks)
 */
const BUSINESS_FACTS = {
  name: 'Dashmesh Property & Rent Agreement Services',
  shortName: 'Dashmesh Properties',
  assistant: 'Sia',
  founder: 'Satnam Singh Vohra (+91 84210 77613)',
  officeAddress: 'Shop No. 24, New Floora, Pale Gaon, Ambernath (East) - 421 501',
  rentAgreement: {
    totalCost: '₹3,500 all-inclusive'
  }
};

/**
 * Main WhatsApp Message Handler
 * ----------------------------------------------------------------------------
 * This function is called whenever a new customer message arrives via WhatsApp.
 * 
 * @param {string} incomingPhone - Normalized phone number (e.g. "919820012345")
 * @param {string} incomingText  - The text message sent by the customer
 * @param {string} customerName  - Customer display name from WhatsApp
 * @param {object} meta          - Additional metadata (isOptOut, isOptIn, rawType, etc.)
 * 
 * @returns {Promise<{reply: string|null, buttons?: string[], intent?: string}>}
 */
async function processIncomingMessage(incomingPhone, incomingText, customerName = 'Customer', meta = {}) {
  // ==========================================================================
  // 👉 WRITE YOUR CUSTOM AI CHAT BOT LOGIC BELOW THIS LINE:
  // ==========================================================================

  const userMessage = (incomingText || '').trim();

  // Example simple response — replace this with your own logic or LLM call:
  let replyText = `Hello ${customerName}! Thank you for reaching out to Dashmesh Properties.`;

  // Example: If you want to return quick action buttons on WhatsApp:
  const actionButtons = [];

  // ==========================================================================
  // Return your response to send back to the user via WhatsApp:
  // (Return reply: null if you do not want the bot to reply automatically)
  // ==========================================================================
  return {
    reply: replyText,
    buttons: actionButtons,
    intent: 'CUSTOM_REPLY'
  };
}

module.exports = {
  BUSINESS_FACTS,
  processIncomingMessage
};
