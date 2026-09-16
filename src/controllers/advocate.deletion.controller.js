import * as advocateDeletionService from '../services/advocateDeletion.service.js';
import { verifyDeleteAccountOtpSchema } from '../validators/user.validator.js';
import { clearTokenCookie } from '../utils/jwt.js';

export const requestDeleteAccountOtp = async (req, res, next) => {
  try {
    const advocateId = req.user.id;
    const result = await advocateDeletionService.requestAdvocateDeleteAccountOtp({ advocateId });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyDeleteAccountOtp = async (req, res, next) => {
  try {
    const advocateId = req.user.id;
    const validated = verifyDeleteAccountOtpSchema.parse(req.body);

    const result = await advocateDeletionService.verifyAdvocateDeleteAccountOtp({
      advocateId,
      otp: validated.otp
    });

    // Invalidate session cookie upon deletion request submission
    clearTokenCookie(res);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
