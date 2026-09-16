import { verifyToken } from '../utils/jwt.js';
import { getCurrentUserProfile } from '../services/auth.service.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies.auth_token;

    // Check Authorization Header if cookie is not present (standard for mobile apps)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const err = new Error('Authentication required. Please login.');
      err.statusCode = 401;
      return next(err);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id || !decoded.type) {
      const err = new Error('Invalid session or session expired. Please login again.');
      err.statusCode = 401;
      return next(err);
    }

    const userProfile = await getCurrentUserProfile(decoded.id, decoded.type);
    if (!userProfile) {
      const err = new Error('User account not found or has been deactivated.');
      err.statusCode = 401;
      return next(err);
    }

    if (userProfile.role === 'USER' && userProfile.status === 'DELETION_PENDING') {
      const isDeletionEndpoint = req.originalUrl && req.originalUrl.includes('/delete-account');
      if (!isDeletionEndpoint) {
        const err = new Error('Your account is scheduled for deletion. Please log in to restore your account.');
        err.statusCode = 401;
        return next(err);
      }
    }

    req.user = userProfile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.auth_token;

    // Check Authorization Header if cookie is not present
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id && decoded.type) {
        const userProfile = await getCurrentUserProfile(decoded.id, decoded.type);
        if (userProfile) {
          req.user = userProfile;
        }
      }
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
  }
  next();
};

export const requireRole = (...roles) => {
  const allowedRoles = roles.map(r => r.toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('Authentication required. Please login.');
      err.statusCode = 401;
      return next(err);
    }

    const rawRole = req.user.role || req.user.type || '';
    const userRole = rawRole.toUpperCase();

    if (!allowedRoles.includes(userRole)) {
      const err = new Error('Access forbidden. Insufficient permissions.');
      err.statusCode = 403;
      return next(err);
    }

    next();
  };
};


export const requireApprovedAdvocate = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  const rawRole = req.user.role || req.user.type || '';
  if (rawRole.toUpperCase() !== 'ADVOCATE') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Only advocates can send team requests.'
    });
  }

  if (req.user.status === 'BLOCKED' || req.user.isActive === false) {
    return res.status(403).json({
      success: false,
      message: 'Your account is currently unavailable or blocked.'
    });
  }

  if (req.user.deletionStatus === 'PENDING') {
    return res.status(403).json({
      success: false,
      message: 'Your account deletion request is pending. You cannot perform this action.'
    });
  }

  if (req.user.approvalStatus === 'REJECTED') {
    return res.status(403).json({
      success: false,
      message: 'Your advocate profile has not been approved by admin. You cannot send team requests.'
    });
  }

  if (req.user.approvalStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: 'Your advocate profile must be approved by admin before you can send team requests.'
    });
  }

  next();
};

