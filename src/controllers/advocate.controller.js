import * as advocateService from '../services/advocate.service.js';

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
      rating
    } = req.query;

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
      rating
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
    const advocate = await advocateService.getAdvocateDetailsPublic(id);

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
