import prisma from '../lib/prisma.js';
import { updateAdvocateOnlineStatusSchema } from '../validators/advocate.validator.js';

/**
 * POST /api/advocate/heartbeat
 * Heartbeat API to update the advocate's online status and lastSeenAt timestamp.
 */
export const heartbeat = async (req, res, next) => {
  try {
    const advocateId = req.user?.id;
    if (!advocateId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const now = new Date();
    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        isOnline: true,
        lastSeenAt: now
      },
      select: {
        isOnline: true,
        lastSeenAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate status updated',
      data: {
        isOnline: updated.isOnline,
        lastSeenAt: updated.lastSeenAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/advocate/online-status
 * Explicitly update the advocate's online/offline status.
 */
export const updateOnlineStatus = async (req, res, next) => {
  try {
    const advocateId = req.user?.id;
    if (!advocateId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const validated = updateAdvocateOnlineStatusSchema.parse(req.body);
    const now = new Date();

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        isOnline: validated.isOnline,
        lastSeenAt: now
      },
      select: {
        isOnline: true,
        lastSeenAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate online status updated successfully',
      data: {
        isOnline: updated.isOnline,
        lastSeenAt: updated.lastSeenAt
      }
    });
  } catch (error) {
    next(error);
  }
};
