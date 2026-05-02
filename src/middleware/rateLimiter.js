/**
 * @fileoverview Rate limiting middleware.
 * Applies tiered rate limits to protect the API from abuse.
 * - General: 100 requests per 15 minutes per IP
 * - Chat API: 20 requests per minute per IP
 */

'use strict';

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General rate limiter applied to all routes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Strict rate limiter for the chat API endpoint.
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many messages sent. Please wait a moment before sending another message.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Chat rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = { generalLimiter, chatLimiter };
