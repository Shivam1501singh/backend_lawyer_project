import prisma from '../lib/prisma.js';
import * as lawValidator from '../validators/law.validator.js';

/**
 * Helper to resolve the Prisma model according to lawType
 */
export const getModel = (lawType) => {
  if (lawType === 'BNSS') return prisma.bNSS;
  if (lawType === 'BSA') return prisma.bSA;
  return null;
};

/**
 * Standard mapper for single or multiple law sections response
 */
export const formatLawResponse = (record, lawType) => {
  if (!record) return null;
  return {
    id: record.id,
    lawType: lawType,
    sectionNo: record.sectionNo,
    heading: record.heading,
    sectionText: record.sectionText,
    explanation: record.explanation || null,
    illustration: record.illustration || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
};

/**
 * Create BNSS or BSA Section (Content Creator Only)
 * POST /api/content-creator/laws
 */
export const createLawSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    lawValidator.checkForbiddenLawFields(req.body);
    const validated = lawValidator.createLawSectionSchema.parse(req.body);

    const model = getModel(validated.lawType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Invalid lawType: ${validated.lawType}`
      });
    }

    const existing = await model.findUnique({
      where: { sectionNo: validated.sectionNo }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `This ${validated.lawType} section already exists`
      });
    }

    const created = await model.create({
      data: {
        sectionNo: validated.sectionNo,
        heading: validated.heading,
        sectionText: validated.sectionText,
        explanation: validated.explanation,
        illustration: validated.illustration
      }
    });

    return res.status(201).json({
      success: true,
      message: `${validated.lawType} section created successfully`,
      data: formatLawResponse(created, validated.lawType)
    });
  } catch (error) {
    if (error.message && error.message.includes('cannot be provided by the client')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Update BNSS or BSA Section (Content Creator Only)
 * PATCH /api/content-creator/laws/:id
 */
export const updateLawSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;
    lawValidator.checkForbiddenLawFields(req.body);
    const validated = lawValidator.updateLawSectionSchema.parse(req.body);

    const model = getModel(validated.lawType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Invalid lawType: ${validated.lawType}`
      });
    }

    const existing = await model.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `${validated.lawType} section not found`
      });
    }

    if (validated.sectionNo && validated.sectionNo !== existing.sectionNo) {
      const duplicate = await model.findUnique({
        where: { sectionNo: validated.sectionNo }
      });

      if (duplicate && duplicate.id !== id) {
        return res.status(400).json({
          success: false,
          message: `This ${validated.lawType} section already exists`
        });
      }
    }

    const updateData = {};
    if (validated.sectionNo !== undefined) updateData.sectionNo = validated.sectionNo;
    if (validated.heading !== undefined) updateData.heading = validated.heading;
    if (validated.sectionText !== undefined) updateData.sectionText = validated.sectionText;
    if (validated.explanation !== undefined) updateData.explanation = validated.explanation;
    if (validated.illustration !== undefined) updateData.illustration = validated.illustration;

    const updated = await model.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: `${validated.lawType} section updated successfully`,
      data: formatLawResponse(updated, validated.lawType)
    });
  } catch (error) {
    if (error.message && error.message.includes('cannot be provided by the client')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Delete BNSS or BSA Section (Content Creator Only)
 * DELETE /api/content-creator/laws/:id?lawType=BNSS
 */
export const deleteLawSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;
    const rawLawType = req.query.lawType || req.body.lawType;
    const { lawType } = lawValidator.lawTypeQuerySchema.parse({ lawType: rawLawType });

    const model = getModel(lawType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Invalid lawType: ${lawType}`
      });
    }

    const existing = await model.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `${lawType} section not found`
      });
    }

    await model.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: `${lawType} section deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Public Law Sections List (Public)
 * GET /api/laws?lawType=BNSS&page=1&limit=10
 */
export const getLaws = async (req, res, next) => {
  try {
    const { lawType, page, limit } = lawValidator.getLawsQuerySchema.parse(req.query);

    const model = getModel(lawType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Invalid lawType: ${lawType}`
      });
    }

    const skip = (page - 1) * limit;

    const [sections, total] = await prisma.$transaction([
      model.findMany({
        skip,
        take: limit,
        orderBy: { sectionNo: 'asc' }
      }),
      model.count()
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: sections.map((sec) => formatLawResponse(sec, lawType)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search BNSS or BSA Sections (Public)
 * GET /api/laws/search?lawType=BNSS&q=arrest
 */
export const searchLaws = async (req, res, next) => {
  try {
    const { lawType, q, page, limit } = lawValidator.searchLawsQuerySchema.parse(req.query);

    const model = getModel(lawType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Invalid lawType: ${lawType}`
      });
    }

    const trimmedQuery = q ? q.trim() : '';

    const where = {};
    if (trimmedQuery) {
      where.OR = [
        { sectionNo: { contains: trimmedQuery, mode: 'insensitive' } },
        { heading: { contains: trimmedQuery, mode: 'insensitive' } },
        { sectionText: { contains: trimmedQuery, mode: 'insensitive' } },
        { explanation: { contains: trimmedQuery, mode: 'insensitive' } },
        { illustration: { contains: trimmedQuery, mode: 'insensitive' } }
      ];
    }

    const allMatches = await model.findMany({
      where,
      orderBy: { sectionNo: 'asc' }
    });

    const lowerQ = trimmedQuery.toLowerCase();

    const getRank = (sec) => {
      if (!lowerQ) return 5;
      const cleanSectionNo = sec.sectionNo.toLowerCase().replace(/^section\s+/i, '');
      const rawSectionNo = sec.sectionNo.toLowerCase();

      if (cleanSectionNo === lowerQ || rawSectionNo === lowerQ) return 1;
      if (sec.heading.toLowerCase().includes(lowerQ)) return 2;
      if (sec.explanation && sec.explanation.toLowerCase().includes(lowerQ)) return 3;
      if (sec.illustration && sec.illustration.toLowerCase().includes(lowerQ)) return 4;
      if (sec.sectionText && sec.sectionText.toLowerCase().includes(lowerQ)) return 5;
      return 6;
    };

    const sortedMatches = allMatches.sort((a, b) => {
      const rankA = getRank(a);
      const rankB = getRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return 0;
    });

    const total = sortedMatches.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const paginated = sortedMatches.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      data: paginated.map((sec) => formatLawResponse(sec, lawType)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single BNSS or BSA Section (Public)
 * GET /api/laws/:id?lawType=BNSS
 */
export const getSingleLawSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawLawType = req.query.lawType || req.body.lawType;
    const { lawType } = lawValidator.lawTypeQuerySchema.parse({ lawType: rawLawType });

    const model = getModel(lawType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Invalid lawType: ${lawType}`
      });
    }

    const section = await model.findUnique({
      where: { id }
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: `${lawType} section not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatLawResponse(section, lawType)
    });
  } catch (error) {
    next(error);
  }
};
