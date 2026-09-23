import prisma from '../lib/prisma.js';
import { signToken, sendTokenCookie, clearTokenCookie } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import { computeEffectiveOnlineStatus } from '../utils/advocateStatus.js';
import { finalizeAdvocateDeletion } from '../services/advocateDeletion.service.js';
import {
  adminApproveAdvocateSchema,
  adminUpdateAdvocateCallAvailabilitySchema,
  adminUpdateAdvocateStatusSchema
} from '../validators/admin.validator.js';

/**
 * Admin Login
 * POST /api/admin/login
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken({ id: admin.id, type: 'admin' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Content Creator (ADMIN only)
 * POST /api/admin/content-creators
 */
export const createContentCreator = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.contentCreator.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A content creator with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const creator = await prisma.contentCreator.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Content creator created successfully',
      creator: {
        id: creator.id,
        fullName: creator.fullName,
        email: creator.email,
        isActive: creator.isActive,
        createdAt: creator.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Content Creators (ADMIN only)
 * GET /api/admin/content-creators
 */
export const listContentCreators = async (req, res, next) => {
  try {
    const creators = await prisma.contentCreator.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      success: true,
      creators
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List All Advocates for Admin Management
 * GET /api/admin/advocates
 */
export const listAdvocates = async (req, res, next) => {
  try {
    const advocates = await prisma.advocate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { likes: true }
        }
      }
    });

    const safeAdvocates = advocates.map(adv => ({
      id: adv.id,
      name: adv.fullName,
      fullName: adv.fullName,
      email: adv.email,
      phone: adv.phone,
      status: adv.status,
      accountStatus: adv.status,
      approvalStatus: adv.approvalStatus,
      callAvailability: adv.callAvailability ?? false,
      rejectionReason: adv.rejectionReason || null,
      submittedForApprovalAt: adv.submittedForApprovalAt || null,
      approvedAt: adv.approvedAt || null,
      likeCount: adv._count?.likes ?? 0,
      lawType: adv.bestPracticeArea || (adv.practiceAreas && adv.practiceAreas.length > 0 ? adv.practiceAreas[0] : null),
      barCouncilId: adv.barCouncilId,
      state: adv.state,
      city: adv.city,
      pincode: adv.pincode,
      isOnline: computeEffectiveOnlineStatus(adv.isOnline, adv.lastSeenAt),
      lastSeenAt: adv.lastSeenAt,
      createdAt: adv.createdAt
    }));

    return res.status(200).json({
      success: true,
      advocates: safeAdvocates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Pending Advocates for Admin Approval (ADMIN only)
 * GET /api/admin/advocates/pending
 */
export const listPendingAdvocates = async (req, res, next) => {
  try {
    const advocates = await prisma.advocate.findMany({
      where: { approvalStatus: 'PENDING' },
      orderBy: { submittedForApprovalAt: 'desc' }
    });

    const data = advocates.map(adv => ({
      id: adv.id,
      name: adv.fullName,
      fullName: adv.fullName,
      email: adv.email,
      phone: adv.phone,
      barId: adv.barCouncilId,
      barCouncilId: adv.barCouncilId,
      profileImage: adv.profilePhotoUrl,
      profilePhotoUrl: adv.profilePhotoUrl,
      lawType: adv.bestPracticeArea || (adv.practiceAreas && adv.practiceAreas.length > 0 ? adv.practiceAreas[0] : null),
      bestPracticeArea: adv.bestPracticeArea,
      experience: adv.experienceYears,
      experienceYears: adv.experienceYears,
      city: adv.city,
      state: adv.state,
      pincode: adv.pincode,
      profileCompleted: true,
      approvalStatus: adv.approvalStatus,
      callAvailability: adv.callAvailability ?? false,
      accountStatus: adv.status,
      submittedForApprovalAt: adv.submittedForApprovalAt,
      createdAt: adv.createdAt
    }));

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review Advocate Profile (ADMIN only)
 * GET /api/admin/advocates/:advocateId
 */
export const getAdvocateReviewProfile = async (req, res, next) => {
  try {
    const { advocateId } = req.params;

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId },
      include: {
        _count: {
          select: { likes: true, reviews: true }
        }
      }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    // Exclude passwordHash and sensitive authentication secrets
    const { passwordHash, aadhaarNumber, ...safeAdvocate } = advocate;

    const advocateData = {
      ...safeAdvocate,
      name: advocate.fullName,
      barId: advocate.barCouncilId,
      profileImage: advocate.profilePhotoUrl,
      lawType: advocate.bestPracticeArea || (advocate.practiceAreas && advocate.practiceAreas.length > 0 ? advocate.practiceAreas[0] : null),
      experience: advocate.experienceYears,
      accountStatus: advocate.status,
      callAvailability: advocate.callAvailability ?? false,
      likeCount: advocate._count?.likes ?? 0
    };

    return res.status(200).json({
      success: true,
      data: advocateData,
      advocate: advocateData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Advocate Profile (ADMIN only)
 * PATCH /api/admin/advocates/:advocateId/approve
 */
export const approveAdvocate = async (req, res, next) => {
  try {
    const { advocateId } = req.params;
    const validated = req.body && Object.keys(req.body).length > 0
      ? adminApproveAdvocateSchema.parse(req.body)
      : {};

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    // On approval: approvalStatus = APPROVED, accountStatus = ACTIVE (unless intentionally blocked)
    const newStatus = advocate.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE';
    const newCallAvailability = validated.callAvailability !== undefined
      ? validated.callAvailability
      : advocate.callAvailability;

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        approvalStatus: 'APPROVED',
        status: newStatus,
        callAvailability: newCallAvailability,
        approvedAt: new Date(),
        approvedById: req.user?.id || null,
        rejectionReason: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate profile approved successfully',
      data: {
        id: updated.id,
        approvalStatus: updated.approvalStatus,
        callAvailability: updated.callAvailability,
        status: updated.status,
        accountStatus: updated.status,
        approvedAt: updated.approvedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Advocate Profile (ADMIN only)
 * PATCH /api/admin/advocates/:advocateId/reject
 */
export const rejectAdvocate = async (req, res, next) => {
  try {
    const { advocateId } = req.params;
    const { reason, rejectionReason } = req.body || {};
    const finalReason = reason || rejectionReason || 'Profile information requires correction';

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        approvalStatus: 'REJECTED',
        callAvailability: false,
        rejectedAt: new Date(),
        rejectedById: req.user?.id || null,
        rejectionReason: finalReason
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate profile rejected',
      data: {
        id: updated.id,
        approvalStatus: updated.approvalStatus,
        callAvailability: updated.callAvailability,
        status: updated.status,
        accountStatus: updated.status,
        rejectionReason: updated.rejectionReason,
        rejectedAt: updated.rejectedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Block / Activate Advocate / Update Status (ADMIN only)
 * PATCH /api/admin/advocates/:advocateId/status
 */
export const updateAdvocateStatus = async (req, res, next) => {
  try {
    const { advocateId } = req.params;
    const validated = adminUpdateAdvocateStatusSchema.parse(req.body);

    if (!validated.status && validated.callAvailability === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'status' ('ACTIVE'/'BLOCKED') or 'callAvailability'."
      });
    }

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    const updateData = {};
    if (validated.status) {
      updateData.status = validated.status;
    }
    if (validated.callAvailability !== undefined) {
      updateData.callAvailability = validated.callAvailability;
    }

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate status updated successfully',
      data: {
        id: updated.id,
        status: updated.status,
        callAvailability: updated.callAvailability
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Update Advocate Call Availability
 * PATCH /api/admin/advocates/:advocateId/call-availability
 */
export const updateAdvocateCallAvailability = async (req, res, next) => {
  try {
    const { advocateId } = req.params;
    const validated = adminUpdateAdvocateCallAvailabilitySchema.parse(req.body);

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        callAvailability: validated.callAvailability
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate call availability updated successfully',
      data: {
        id: updated.id,
        callAvailability: updated.callAvailability,
        approvalStatus: updated.approvalStatus,
        status: updated.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Pending Advocate Deletion Requests (ADMIN only)
 * GET /api/admin/advocates/deletion-requests
 */
export const listPendingAdvocateDeletionRequests = async (req, res, next) => {
  try {
    const advocates = await prisma.advocate.findMany({
      where: { deletionStatus: 'PENDING' },
      orderBy: { deletionRequestedAt: 'desc' }
    });

    const data = advocates.map(adv => ({
      id: adv.id,
      advocateId: adv.id,
      name: adv.fullName,
      fullName: adv.fullName,
      email: adv.email,
      phone: adv.phone,
      barId: adv.barCouncilId,
      barCouncilId: adv.barCouncilId,
      profileImage: adv.profilePhotoUrl,
      profilePhotoUrl: adv.profilePhotoUrl,
      approvalStatus: adv.approvalStatus,
      status: adv.status,
      accountStatus: adv.status,
      deletionStatus: adv.deletionStatus,
      deletionRequestedAt: adv.deletionRequestedAt,
      scheduledDeletionAt: adv.scheduledDeletionAt,
      createdAt: adv.createdAt
    }));

    return res.status(200).json({
      success: true,
      data,
      deletionRequests: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Cancel Advocate Deletion Request
 * PATCH /api/admin/advocates/:advocateId/cancel-deletion
 */
export const cancelAdvocateDeletion = async (req, res, next) => {
  try {
    const { advocateId } = req.params;

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    if (advocate.deletionStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Advocate account deletion request is not pending.'
      });
    }

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        deletionStatus: 'NONE',
        deletionRequestedAt: null,
        scheduledDeletionAt: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate account deletion has been cancelled successfully.',
      data: {
        id: updated.id,
        deletionStatus: updated.deletionStatus,
        status: updated.status,
        approvalStatus: updated.approvalStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Permanent Delete Advocate Account
 * DELETE /api/admin/advocates/:advocateId/permanent
 */
export const permanentDeleteAdvocate = async (req, res, next) => {
  try {
    const { advocateId } = req.params;

    const advocate = await prisma.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found'
      });
    }

    if (advocate.deletionStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Advocate account deletion request is not pending.'
      });
    }

    await finalizeAdvocateDeletion(advocateId);

    return res.status(200).json({
      success: true,
      message: 'Advocate account permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};

