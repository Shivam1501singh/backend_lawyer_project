import prisma from '../lib/prisma.js';
import * as updateValidator from '../validators/update.validator.js';

/**
 * Format Update response object for clean public/API output
 */
export const mapUpdateResponse = (update) => {
  if (!update) return null;
  return {
    id: update.id,
    title: update.title,
    oldDescription: update.oldDescription,
    newDescription: update.newDescription,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt
  };
};

/**
 * Create Update (Content Creator Only)
 * POST /api/content-creator/updates
 */
export const createUpdate = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const validated = updateValidator.createUpdateSchema.parse(req.body);

    const created = await prisma.update.create({
      data: {
        title: validated.title,
        oldDescription: validated.oldDescription,
        newDescription: validated.newDescription,
        createdBy: req.user.id
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Update created successfully',
      data: mapUpdateResponse(created)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Updates (Public - No Auth Required)
 * GET /api/updates
 */
export const getUpdates = async (req, res, next) => {
  try {
    const { page, limit } = updateValidator.getUpdatesQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [updates, totalUpdates] = await prisma.$transaction([
      prisma.update.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.update.count()
    ]);

    const totalPages = Math.ceil(totalUpdates / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      data: updates.map(mapUpdateResponse),
      pagination: {
        currentPage: page,
        limit,
        totalUpdates,
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
 * Get Single Update (Public - No Auth Required)
 * GET /api/updates/:id
 */
export const getSingleUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const update = await prisma.update.findUnique({
      where: { id }
    });

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapUpdateResponse(update)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Update (Content Creator Only)
 * PATCH /api/content-creator/updates/:id
 */
export const updateUpdate = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const existing = await prisma.update.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    const validated = updateValidator.updateUpdateSchema.parse(req.body);

    const updateData = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.oldDescription !== undefined) updateData.oldDescription = validated.oldDescription;
    if (validated.newDescription !== undefined) updateData.newDescription = validated.newDescription;

    const updated = await prisma.update.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Update updated successfully',
      data: mapUpdateResponse(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Update (Content Creator Only)
 * DELETE /api/content-creator/updates/:id
 */
export const deleteUpdate = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const existing = await prisma.update.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    await prisma.update.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Update deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
