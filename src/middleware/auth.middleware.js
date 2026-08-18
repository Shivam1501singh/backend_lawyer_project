import { verifyToken } from '../utils/jwt.js';
import { getCurrentUserProfile } from '../services/auth.service.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id || !decoded.type) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or session expired. Please login again.'
      });
    }

    const userProfile = await getCurrentUserProfile(decoded.id, decoded.type);
    if (!userProfile) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been deactivated.'
      });
    }

    req.user = userProfile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server authorization error.'
    });
  }
};
