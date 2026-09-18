import prisma from '../lib/prisma.js';
import * as guideValidator from '../validators/guide.validator.js';

/**
 * Format Guide response object for clean public/API output
 */
export const mapGuideResponse = (guide) => {
  if (!guide) return null;
  return {
    id: guide.id,
    title: guide.title,
    description: guide.description,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt
  };
};

/**
 * Create Guide (Content Creator Only)
 * POST /api/content-creator/guides
 */
export const createGuide = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const validated = guideValidator.createGuideSchema.parse(req.body);

    const created = await prisma.guide.create({
      data: {
        title: validated.title,
        description: validated.description,
        createdBy: req.user.id
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Guide created successfully',
      data: mapGuideResponse(created)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Guides (Public - No Auth Required)
 * GET /api/guides
 */
export const getGuides = async (req, res, next) => {
  try {
    const { page, limit } = guideValidator.getGuidesQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [guides, totalGuides] = await prisma.$transaction([
      prisma.guide.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.guide.count()
    ]);

    const totalPages = Math.ceil(totalGuides / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      data: guides.map(mapGuideResponse),
      pagination: {
        currentPage: page,
        limit,
        totalGuides,
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
 * Get Single Guide (Public - No Auth Required)
 * GET /api/guides/:id
 */
export const getSingleGuide = async (req, res, next) => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id }
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapGuideResponse(guide)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Guide (Content Creator Only)
 * PATCH /api/content-creator/guides/:id
 */
export const updateUserGuide = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const existing = await prisma.guide.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    const validated = guideValidator.updateGuideSchema.parse(req.body);

    const updateData = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;

    const updated = await prisma.guide.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Guide updated successfully',
      data: mapGuideResponse(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Guide (Content Creator Only)
 * DELETE /api/content-creator/guides/:id
 */
export const deleteGuide = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const existing = await prisma.guide.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    await prisma.guide.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
