/**
 * @fileoverview Bharat Election Assistant — Main Application Entry Point.
 *
 * A secure, accessible, and intelligent AI-powered assistant for Indian voters.
 * Built with Express.js and Google Gemini AI, featuring multi-turn conversation,
 * rate limiting, input validation, and comprehensive security headers.
 *
 * @author Ajmal MS
 * @version 2.0.0
 * @license MIT
 */

'use strict';

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before any other imports
dotenv.config();

const logger = require('./src/utils/logger');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const chatRoutes = require('./src/routes/chat');

// ─── Startup Validation ──────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
  logger.error('FATAL: GEMINI_API_KEY is not set in the environment. Exiting.');
  process.exit(1);
}

// ─── App Initialization ──────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 8080;

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ─── Performance Middleware ──────────────────────────────────────────────────
app.use(compression());

// ─── Logging Middleware ──────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Static Files ────────────────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
  })
);

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', chatRoutes);

// ─── SPA Fallback ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Start ────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`🗳️  Bharat Election Assistant running at http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

module.exports = app; // Export for testing
