/**
 * @fileoverview Global error handling middleware.
 * Catches all unhandled errors and returns a consistent JSON error response.
 * Never exposes internal stack traces to the client in production.
 */

'use strict';

const logger = require('../utils/logger');

/**
 * Centralized error handler middleware.
 * Must be registered as the last middleware in the Express app.
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next function.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  // Log the full error with stack trace for internal visibility
  logger.error(`Error processing request to ${req.method} ${req.path}`, {
    message: err.message,
    stack: err.stack,
    statusCode,
    ip: req.ip,
  });

  // Send a sanitized error response to the client
  const clientMessage =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    error: clientMessage,
  });
}

/**
 * 404 Not Found handler for unmatched routes.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function notFoundHandler(req, res) {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
