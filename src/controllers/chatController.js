/**
 * @fileoverview Chat controller.
 * Handles multi-turn conversation logic with the Gemini AI model.
 * Supports conversation history, language-aware responses,
 * and suggested follow-up questions.
 */

'use strict';

const { getModel } = require('../config/gemini');
const logger = require('../utils/logger');

/**
 * Suggested questions to offer when conversation context is lacking.
 * These are static fallbacks; dynamic suggestions come from the AI.
 */
const DEFAULT_SUGGESTIONS = [
  'How do I register to vote in India?',
  'What is NOTA and how do I use it?',
  'When is the next general election in India?',
];

/**
 * Handles POST /api/chat requests.
 * Accepts a user message and optional conversation history,
 * and returns an AI-generated reply with suggested follow-up questions.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
async function handleChat(req, res, next) {
  try {
    const { message, history = [] } = req.body;

    logger.info(`Chat request received. History length: ${history.length}`);

    const model = getModel();

    // Start a multi-turn chat session with the provided conversation history
    const chat = model.startChat({
      history: history.map((turn) => ({
        role: turn.role,
        parts: turn.parts,
      })),
    });

    // Send the current user message
    const result = await chat.sendMessage(message);
    const response = result.response;
    const replyText = response.text();

    // Generate contextual follow-up suggestions using a separate lightweight call
    let suggestedQuestions = DEFAULT_SUGGESTIONS;
    try {
      const suggestionModel = getModel();
      const suggestionResult = await suggestionModel.generateContent(
        `Based on this election-related conversation, suggest exactly 3 short follow-up questions a voter might ask next. 
        The last question was: "${message}"
        The answer was: "${replyText.substring(0, 200)}"
        
        Return ONLY a JSON array of 3 strings, no other text. Example: ["Question 1?", "Question 2?", "Question 3?"]`
      );
      const suggestionText = suggestionResult.response.text().trim();
      // Extract JSON array from response
      const jsonMatch = suggestionText.match(/\[.*\]/s);
      if (jsonMatch) {
        suggestedQuestions = JSON.parse(jsonMatch[0]);
      }
    } catch (suggestionError) {
      // Non-critical: use defaults if suggestion generation fails
      logger.warn('Could not generate suggested questions:', suggestionError.message);
    }

    logger.info('Chat response generated successfully.');

    return res.status(200).json({
      reply: replyText,
      suggestedQuestions,
    });
  } catch (error) {
    logger.error('Error in chat controller:', error);
    next(error);
  }
}

/**
 * Handles GET /api/health requests.
 * Returns service health status and configuration state.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function handleHealth(req, res) {
  const apiKeyConfigured =
    !!process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE';

  res.status(200).json({
    status: 'ok',
    service: 'Bharat Election Assistant',
    version: process.env.npm_package_version || '1.0.0',
    geminiConfigured: apiKeyConfigured,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { handleChat, handleHealth };
