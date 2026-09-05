import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { signToken, sendTokenCookie } from '../utils/jwt.js';

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

    const normalizedEmail = String(email).toLowerCase().trim();

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = signToken({ id: admin.id, type: 'admin', role: 'ADMIN' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: 'ADMIN'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Content Creator Account (ADMIN only)
 * POST /api/admin/content-creators
 */
export const createContentCreator = async (req, res, next) => {
  try {
    const { name, fullName, email, password, bio, image } = req.body || {};
    const creatorName = name || fullName;

    if (!creatorName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check duplicate Content Creator
    const existing = await prisma.contentCreator.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Content Creator already exists with this email.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const creator = await prisma.contentCreator.create({
      data: {
        fullName: creatorName,
        email: normalizedEmail,
        passwordHash,
        bio: bio || null,
        image: image || null,
        isActive: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Content Creator account created successfully',
      contentCreator: {
        id: creator.id,
        name: creator.fullName,
        fullName: creator.fullName,
        email: creator.email,
        image: creator.image,
        bio: creator.bio,
        role: 'CONTENT_CREATOR',
        createdAt: creator.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View Content Creators List (ADMIN only)
 * GET /api/admin/content-creators
 */
export const listContentCreators = async (req, res, next) => {
  try {
    const creators = await prisma.contentCreator.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const safeCreators = creators.map(c => ({
      id: c.id,
      name: c.fullName,
      fullName: c.fullName,
      email: c.email,
      image: c.image || null,
      bio: c.bio || null,
      role: 'CONTENT_CREATOR',
      createdAt: c.createdAt
    }));

    return res.status(200).json({
      success: true,
      contentCreators: safeCreators
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View Advocates List for Management (ADMIN only)
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
      rejectionReason: adv.rejectionReason || null,
      submittedForApprovalAt: adv.submittedForApprovalAt || null,
      approvedAt: adv.approvedAt || null,
      likeCount: adv._count?.likes ?? 0,
      lawType: adv.bestPracticeArea || (adv.practiceAreas && adv.practiceAreas.length > 0 ? adv.practiceAreas[0] : null),
      barCouncilId: adv.barCouncilId,
      state: adv.state,
      city: adv.city,
      pincode: adv.pincode,
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
          select: { likes: true, reviews: true, caseConnections: true }
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

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: {
        approvalStatus: 'APPROVED',
        status: newStatus,
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
 * Block / Activate Advocate (ADMIN only)
 * PATCH /api/admin/advocates/:advocateId/status
 */
export const updateAdvocateStatus = async (req, res, next) => {
  try {
    const { advocateId } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = ['ACTIVE', 'BLOCKED'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Advocate status. Allowed values are 'ACTIVE' or 'BLOCKED'."
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

    const updated = await prisma.advocate.update({
      where: { id: advocateId },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate status updated successfully',
      data: {
        id: updated.id,
        status: updated.status
      }
    });
  } catch (error) {
    next(error);
  }
};
