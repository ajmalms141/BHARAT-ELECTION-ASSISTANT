/**
 * @fileoverview Chat API router.
 * Defines routes for the chat and health endpoints.
 * Applies rate limiting and input validation middleware.
 */

'use strict';

const express = require('express');
const { chatLimiter } = require('../middleware/rateLimiter');
const { validateChatInput } = require('../middleware/validator');
const { handleChat, handleHealth } = require('../controllers/chatController');

const router = express.Router();

/**
 * GET /api/health
 * Returns the health status of the service.
 * @access Public
 */
router.get('/health', handleHealth);

/**
 * POST /api/chat
 * Accepts a user message and optional history, returns an AI-generated reply.
 * @access Public (rate limited)
 * @body {string} message - The user's question.
 * @body {Array} [history] - Optional array of previous conversation turns.
 */
router.post('/chat', chatLimiter, validateChatInput, handleChat);

module.exports = router;
