import * as advocateTeamService from '../services/advocateTeam.service.js';

/**
 * Express Controller: Search Advocate by BAR ID
 * GET /api/advocates/search?barId=<BAR_ID>
 */
export const searchAdvocateByBarId = async (req, res, next) => {
  try {
    if (req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only advocates can search advocates by BAR ID.'
      });
    }

    const { barId } = req.query;
    const advocate = await advocateTeamService.searchAdvocateByBarId(barId);

    return res.status(200).json({
      success: true,
      advocate
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
 * Express Controller: Initiate Team Request (Send OTP to Target Advocate)
 * POST /api/advocates/:advocateId/team-request
 */
export const createTeamRequest = async (req, res, next) => {
  try {
    if (req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only advocates can create team requests.'
      });
    }

    const { advocateId } = req.params;
    if (!advocateId || typeof advocateId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid advocateId parameter.'
      });
    }

    const result = await advocateTeamService.createTeamRequest({
      requesterId: req.user.id,
      targetAdvocateId: advocateId
    });

    return res.status(200).json({
      success: true,
      message: "Team request initiated successfully. OTP sent to Advocate's registered mobile number.",
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
 * Express Controller: Verify Team Request OTP
 * POST /api/advocates/team-request/:requestId/verify
 */
export const verifyTeamRequest = async (req, res, next) => {
  try {
    if (req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only advocates can verify team requests.'
      });
    }

    const { requestId } = req.params;
    const { otp } = req.body;

    if (!requestId || typeof requestId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid requestId parameter.'
      });
    }

    const result = await advocateTeamService.verifyTeamRequest({
      requesterId: req.user.id,
      requestId,
      otp
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate successfully added as your team mate',
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
 * Express Controller: View Logged-in Advocate's Team Mates
 * GET /api/advocates/team-mates
 */
export const getTeamMates = async (req, res, next) => {
  try {
    if (req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only advocates can view team mates.'
      });
    }

    const teamMates = await advocateTeamService.getTeamMates(req.user.id);

    return res.status(200).json({
      success: true,
      teamMates
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
 * Express Controller: Remove Team Mate
 * DELETE /api/advocates/team-mates/:advocateId
 */
export const removeTeamMate = async (req, res, next) => {
  try {
    if (req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only advocates can remove team mates.'
      });
    }

    const { advocateId } = req.params;
    if (!advocateId || typeof advocateId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid advocateId parameter.'
      });
    }

    await advocateTeamService.removeTeamMate({
      advocateId: req.user.id,
      teamMateId: advocateId
    });

    return res.status(200).json({
      success: true,
      message: 'Team mate removed successfully.'
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
