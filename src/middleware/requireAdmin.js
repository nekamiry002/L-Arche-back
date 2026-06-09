const { ApiError } = require('../utils/errorHandler');

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError('Accès réservé aux administrateurs', 403));
  }
  next();
};

module.exports = { requireAdmin };
