import * as advocateLikeService from '../services/advocateLike.service.js';

/**
 * Express Controller: Like Advocate
 * POST /api/advocates/:advocateId/like
 */
export const likeAdvocate = async (req, res, next) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can like advocates.'
      });
    }

    const { advocateId } = req.params;
    if (!advocateId || typeof advocateId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid advocateId provided.'
      });
    }

    const result = await advocateLikeService.likeAdvocate({
      userId: req.user.id,
      advocateId
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate liked successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Express Controller: Unlike Advocate
 * DELETE /api/advocates/:advocateId/like
 */
export const unlikeAdvocate = async (req, res, next) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can unlike advocates.'
      });
    }

    const { advocateId } = req.params;
    if (!advocateId || typeof advocateId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid advocateId provided.'
      });
    }

    const result = await advocateLikeService.unlikeAdvocate({
      userId: req.user.id,
      advocateId
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate unliked successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Express Controller: Get User's Liked Advocates
 * GET /api/user/liked-advocates
 */
export const getUserLikedAdvocates = async (req, res, next) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can access liked advocates.'
      });
    }

    const advocates = await advocateLikeService.getUserLikedAdvocates(req.user.id);

    return res.status(200).json({
      success: true,
      data: advocates
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
