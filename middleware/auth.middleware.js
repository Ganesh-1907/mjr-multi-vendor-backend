const { verifyToken } = require('../utils/jwt');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.error('Access denied. No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json(ApiResponse.error('Invalid token or user deactivated'));
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role || user.role.name,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(ApiResponse.error('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(ApiResponse.error('Token expired'));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).populate('role');
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role || user.role.name,
        };
      }
    }
  } catch (_) {
    // Ignore auth errors for optional auth
  }
  next();
};

module.exports = { authenticate, optionalAuth };
