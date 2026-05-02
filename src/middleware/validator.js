/**
 * @fileoverview Input validation middleware.
 * Uses express-validator to validate and sanitize incoming request data
 * for the chat API endpoint.
 */

'use strict';

const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validation rules for the POST /api/chat endpoint.
 * - message: required string, 1–2000 characters, stripped of HTML
 * - history: optional array of conversation turns (max 20)
 */
const validateChatInput = [
  body('message')
    .exists({ checkFalsy: true })
    .withMessage('Message is required.')
    .isString()
    .withMessage('Message must be a string.')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters.')
    .escape(), // Sanitize HTML entities

  body('history')
    .optional()
    .isArray({ max: 20 })
    .withMessage('History must be an array with a maximum of 20 entries.'),

  body('history.*.role')
    .optional()
    .isIn(['user', 'model'])
    .withMessage('History role must be either "user" or "model".'),

  body('history.*.parts')
    .optional()
    .isArray()
    .withMessage('History parts must be an array.'),

  body('language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Language must be "en" or "hi".'),

  /**
   * Middleware to check validation results and return 400 on failure.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation failed:', { errors: errors.array(), ip: req.ip });
      return res.status(400).json({
        error: 'Invalid input.',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

module.exports = { validateChatInput };
