import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const requestId = req.requestId || 'unknown';

  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      details: config.environment === 'development' ? err.stack : null,
      requestId,
    },
  };

  res.status(statusCode).json(errorResponse);
}
