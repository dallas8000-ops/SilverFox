/**
 * SilverFox Error Handling Middleware
 * Centralized error handling, logging, and response formatting
 */

const fs = require('fs');
const path = require('path');

// Initialize error log file
const errorLogPath = path.join(__dirname, 'error-logs.txt');

/**
 * Log errors to file and console
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {string} context - Context where error occurred
 */
function logError(error, req, context) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    context,
    path: req ? req.path : 'unknown',
    method: req ? req.method : 'unknown',
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500
  };

  // Log to console for development
  console.error(`[${timestamp}] ERROR in ${context}:`, error);

  // Log to file for production
  try {
    fs.appendFileSync(
      errorLogPath,
      JSON.stringify(logEntry) + '\n'
    );
  } catch (e) {
    console.error('Failed to write error log:', e);
  }

  return logEntry;
}

/**
 * Create standardized API error response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} details - Detailed error information
 * @returns {Object}
 */
function createErrorResponse(statusCode, message, details = []) {
  return {
    success: false,
    statusCode,
    error: {
      message,
      details,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Create standardized API success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object}
 */
function createSuccessResponse(data, message = 'Success', statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Express middleware for handling validation errors
 * @param {Array} errors - Validation error array
 * @param {Object} res - Express response object
 * @param {Object} req - Express request object
 * @returns {boolean} - Returns true if errors exist
 */
function handleValidationError(errors, res, req) {
  if (errors.length > 0) {
    logError(new Error(errors.join(', ')), req, 'Validation Error');
    res.status(400).json(
      createErrorResponse(400, 'Validation failed', errors)
    );
    return true;
  }
  return false;
}

/**
 * Express error handling middleware (use at end of middleware stack)
 * @returns {Function} Express middleware function
 */
function errorHandler() {
  return (err, req, res, next) => {
    logError(err, req, err.context || 'Express Middleware');

    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json(
        createErrorResponse(400, 'Validation error', [err.message])
      );
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json(
        createErrorResponse(401, 'Authentication required', ['Please log in'])
      );
    }

    if (err.name === 'ForbiddenError') {
      return res.status(403).json(
        createErrorResponse(403, 'Access denied', ['Insufficient permissions'])
      );
    }

    if (err.name === 'NotFoundError') {
      return res.status(404).json(
        createErrorResponse(404, 'Resource not found', [err.message])
      );
    }

    if (err.statusCode === 413) {
      return res.status(413).json(
        createErrorResponse(413, 'File too large', ['Maximum file size exceeded'])
      );
    }

    // Default error response
    res.status(err.statusCode || 500).json(
      createErrorResponse(
        err.statusCode || 500,
        err.message || 'Internal server error',
        [err.details || 'An unexpected error occurred']
      )
    );
  };
}

/**
 * Async route handler wrapper (catches async errors)
 * @param {Function} fn - Express route handler function
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @returns {boolean}
 */
function isAuthenticated(req) {
  return req.session && req.session.userId;
}

/**
 * Check if user is admin
 * @param {Object} req - Express request object
 * @returns {boolean}
 */
function isAdmin(req) {
  return req.session && req.session.role === 'admin';
}

/**
 * Express middleware for authentication check
 * @returns {Function} Express middleware function
 */
function requireAuth() {
  return (req, res, next) => {
    if (!isAuthenticated(req)) {
      logError(
        new Error('Unauthorized access attempt'),
        req,
        'Authentication Required'
      );
      return res.status(401).json(
        createErrorResponse(401, 'Authentication required', ['Please log in'])
      );
    }
    next();
  };
}

/**
 * Express middleware for admin authorization check
 * @returns {Function} Express middleware function
 */
function requireAdmin() {
  return (req, res, next) => {
    if (!isAuthenticated(req)) {
      logError(
        new Error('Unauthorized admin access attempt'),
        req,
        'Admin Authentication Required'
      );
      return res.status(401).json(
        createErrorResponse(401, 'Authentication required', ['Please log in'])
      );
    }

    if (!isAdmin(req)) {
      logError(
        new Error('Forbidden admin access attempt by user ' + req.session.userId),
        req,
        'Admin Authorization Failed'
      );
      return res.status(403).json(
        createErrorResponse(403, 'Access denied', ['Admin privileges required'])
      );
    }

    next();
  };
}

/**
 * Format error details from database or API errors
 * @param {Error} error - Error object
 * @returns {Array}
 */
function formatErrorDetails(error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    return ['This record already exists'];
  }
  if (error.message.includes('FOREIGN KEY constraint failed')) {
    return ['Referenced record does not exist'];
  }
  return [error.message || 'An error occurred'];
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  logError,
  createErrorResponse,
  createSuccessResponse,
  handleValidationError,
  errorHandler,
  asyncHandler,
  isAuthenticated,
  isAdmin,
  requireAuth,
  requireAdmin,
  formatErrorDetails
};
