import * as savedLawyerService from '../services/savedLawyer.service.js';

export const saveLawyer = async (req, res, next) => {
  try {
    // Only standard users can save lawyers
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can save lawyers.'
      });
    }

    const { advocateId } = req.body;

    if (!advocateId || typeof advocateId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid advocateId provided.'
      });
    }

    const saved = await savedLawyerService.saveLawyer({
      userId: req.user.id,
      advocateId
    });

    return res.status(201).json({
      success: true,
      message: 'Lawyer saved successfully.',
      saved
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

export const getSavedLawyers = async (req, res, next) => {
  try {
    // Only standard users can get their saved lawyers
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can access saved lawyers.'
      });
    }

    const advocates = await savedLawyerService.listSavedLawyers(req.user.id);

    return res.status(200).json({
      success: true,
      advocates
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

export const removeSavedLawyer = async (req, res, next) => {
  try {
    // Only standard users can remove saved lawyers
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can remove saved lawyers.'
      });
    }

    const { advocateId } = req.params;

    if (!advocateId || typeof advocateId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid advocateId provided.'
      });
    }

    await savedLawyerService.deleteSavedLawyer({
      userId: req.user.id,
      advocateId
    });

    return res.status(200).json({
      success: true,
      message: 'Lawyer removed from saved list successfully.'
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
