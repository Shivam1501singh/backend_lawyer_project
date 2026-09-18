import prisma from '../lib/prisma.js';
import * as userRightValidator from '../validators/userRight.validator.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

/**
 * Format User Right response object for clean public/API output
 */
export const mapUserRightResponse = (right) => {
  if (!right) return null;
  return {
    id: right.id,
    title: right.title,
    description: right.description,
    photo: right.photo || null,
    createdAt: right.createdAt,
    updatedAt: right.updatedAt
  };
};

/**
 * Helper to validate uploaded image format & size
 */
const validateUploadedImage = (file) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file format. Only JPEG, JPG, PNG, and WEBP images are allowed.');
    error.statusCode = 400;
    throw error;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    const error = new Error('File size exceeds the 5MB limit.');
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Create User Right (Content Creator Only)
 * POST /api/content-creator/user-rights
 */
export const createUserRight = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const validated = userRightValidator.createUserRightSchema.parse(req.body);

    let photoUrl = null;
    let photoPublicId = null;

    if (req.file) {
      validateUploadedImage(req.file);
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer);
      photoUrl = uploadRes.url;
      photoPublicId = uploadRes.publicId;
    }

    try {
      const created = await prisma.userRight.create({
        data: {
          title: validated.title,
          description: validated.description,
          photo: photoUrl,
          photoPublicId,
          createdBy: req.user.id
        }
      });

      return res.status(201).json({
        success: true,
        message: 'User Right created successfully',
        data: mapUserRightResponse(created)
      });
    } catch (dbError) {
      if (photoPublicId) {
        await deleteFromCloudinary(photoPublicId);
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get All User Rights (Public)
 * GET /api/user-rights
 */
export const getUserRights = async (req, res, next) => {
  try {
    const { page, limit } = userRightValidator.getUserRightsQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [userRights, totalRights] = await prisma.$transaction([
      prisma.userRight.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userRight.count()
    ]);

    const totalPages = Math.ceil(totalRights / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      data: userRights.map(mapUserRightResponse),
      pagination: {
        currentPage: page,
        limit,
        totalRights,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single User Right (Public)
 * GET /api/user-rights/:id
 */
export const getSingleUserRight = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userRight = await prisma.userRight.findUnique({
      where: { id }
    });

    if (!userRight) {
      return res.status(404).json({
        success: false,
        message: 'User Right not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapUserRightResponse(userRight)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Right (Content Creator Only)
 * PATCH /api/content-creator/user-rights/:id
 */
export const updateUserRight = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const existing = await prisma.userRight.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User Right not found'
      });
    }

    const validated = userRightValidator.updateUserRightSchema.parse(req.body);

    const updateData = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;

    let newPublicId = null;
    let oldPublicId = existing.photoPublicId;

    if (req.file) {
      validateUploadedImage(req.file);
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer);
      updateData.photo = uploadRes.url;
      updateData.photoPublicId = uploadRes.publicId;
      newPublicId = uploadRes.publicId;
    }

    try {
      const updated = await prisma.userRight.update({
        where: { id },
        data: updateData
      });

      if (newPublicId && oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      return res.status(200).json({
        success: true,
        message: 'User Right updated successfully',
        data: mapUserRightResponse(updated)
      });
    } catch (dbError) {
      if (newPublicId) {
        await deleteFromCloudinary(newPublicId);
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User Right (Content Creator Only)
 * DELETE /api/content-creator/user-rights/:id
 */
export const deleteUserRight = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const existing = await prisma.userRight.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User Right not found'
      });
    }

    const photoPublicId = existing.photoPublicId;

    await prisma.userRight.delete({
      where: { id }
    });

    if (photoPublicId) {
      await deleteFromCloudinary(photoPublicId);
    }

    return res.status(200).json({
      success: true,
      message: 'User Right deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
