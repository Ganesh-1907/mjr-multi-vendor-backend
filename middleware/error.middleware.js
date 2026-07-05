const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(ApiResponse.error(messages.join(', ')));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(ApiResponse.error(`${field} already exists`));
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(ApiResponse.error('Invalid ID format'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error('Invalid token'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error('Token expired'));
  }

  // Custom errors
  if (err.statusCode) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message));
  }

  // Default server error
  res.status(500).json(ApiResponse.error('An unexpected error occurred'));
};

module.exports = errorHandler;
