import * as advocateService from '../services/advocate.service.js';
import { pincodeSchema } from '../validators/otp.validator.js';

export const getAdvocatesDirectory = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      sort,
      practiceAreaId,
      topCourtPractisedId,
      practiceArea,
      topCourtPractised,
      bestPracticeArea,
      courtPractice,
      state,
      city,
      experienceYears,
      rating,
      pincode
    } = req.query;

    if (pincode !== undefined && pincode !== null && pincode !== '') {
      pincodeSchema.parse(pincode);
    }

    // Extract user ID if authenticated user is a client/user
    const currentUserId = req.user?.type === 'user' ? req.user.id : null;

    const result = await advocateService.listAdvocates({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      search,
      sort,
      practiceAreaId,
      topCourtPractisedId,
      practiceArea,
      topCourtPractised,
      bestPracticeArea,
      courtPractice,
      state,
      city,
      experienceYears,
      rating,
      pincode,
      currentUserId
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getAdvocateProfilePublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.type === 'user' ? req.user.id : null;
    const advocate = await advocateService.getAdvocateDetailsPublic(id, currentUserId);

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
