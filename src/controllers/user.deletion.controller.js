import * as accountDeletionService from '../services/accountDeletion.service.js';
import { verifyDeleteAccountOtpSchema } from '../validators/user.validator.js';
import { clearTokenCookie } from '../utils/jwt.js';

export const requestDeleteAccountOtp = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await accountDeletionService.requestDeleteAccountOtp({ userId });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyDeleteAccountOtp = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validated = verifyDeleteAccountOtpSchema.parse(req.body);

    const result = await accountDeletionService.verifyDeleteAccountOtp({
      userId,
      otp: validated.otp
    });

    // Invalidate existing access session cookie
    clearTokenCookie(res);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
