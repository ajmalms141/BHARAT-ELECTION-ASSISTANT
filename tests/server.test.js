/**
 * @fileoverview Unit tests for middleware and configuration modules.
 * Tests input validation rules, error handler behavior,
 * and system configuration integrity.
 */

'use strict';

process.env.GEMINI_API_KEY = 'test-api-key-for-testing';
process.env.NODE_ENV = 'test';

describe('System Instruction Integrity', () => {
  const { SYSTEM_INSTRUCTION } = require('../src/config/gemini');

  it('should contain key election-related keywords', () => {
    const keywords = ['ECI', 'voter', 'election', 'NOTA', 'Lok Sabha', 'NVSP'];
    keywords.forEach((keyword) => {
      expect(SYSTEM_INSTRUCTION).toContain(keyword);
    });
  });

  it('should enforce neutrality — not endorse any party', () => {
    expect(SYSTEM_INSTRUCTION.toLowerCase()).toContain('neutral');
    expect(SYSTEM_INSTRUCTION.toLowerCase()).not.toContain('vote for');
  });

  it('should contain multilingual support instructions', () => {
    expect(SYSTEM_INSTRUCTION).toContain('Hindi');
    expect(SYSTEM_INSTRUCTION).toContain('language');
  });

  it('should mention the voter helpline 1950', () => {
    expect(SYSTEM_INSTRUCTION).toContain('1950');
  });
});

describe('Error Handler', () => {
  const { errorHandler } = require('../src/middleware/errorHandler');

  it('should return 500 status for generic errors', () => {
    const err = new Error('Test error');
    const req = { method: 'POST', path: '/api/chat', ip: '127.0.0.1' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  it('should use the error status code if provided', () => {
    const err = new Error('Not found');
    err.status = 404;
    const req = { method: 'GET', path: '/api/x', ip: '127.0.0.1' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
