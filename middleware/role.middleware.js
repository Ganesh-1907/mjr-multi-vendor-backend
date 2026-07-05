const ApiResponse = require('../utils/ApiResponse');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json(ApiResponse.error('Authentication required'));
    }

    const userRole = req.user.role.toUpperCase();
    const allowedRoles = roles.map((r) => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json(ApiResponse.error('Access denied. Insufficient permissions'));
    }

    next();
  };
};

module.exports = { restrictTo };
