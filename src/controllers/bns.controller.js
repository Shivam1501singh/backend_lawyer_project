import prisma from '../lib/prisma.js';
import * as bnsValidator from '../validators/bns.validator.js';

export const mapPublicBNSResponse = (section, includeContent = true) => {
  if (!section) return null;
  const res = {
    id: section.id,
    sectionNo: section.sectionNo,
    heading: section.heading,
    paragraph: section.paragraph,
    explanation: section.explanation || null,
    metaTitle: section.metaTitle || null,
    keywords: section.keywords || [],
    metaDescription: section.metaDescription || null
  };

  if (includeContent) {
    res.content = section.content || null;
  }

  return res;
};

/**
 * Create BNS Section (Content Creator Only)
 * POST /api/content-creator/bns
 */
export const createBNSSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    bnsValidator.checkForbiddenBNSFields(req.body);
    const validated = bnsValidator.createBNSSectionSchema.parse(req.body);

    const existing = await prisma.bNSSection.findUnique({
      where: { sectionNo: validated.sectionNo }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This BNS section already exists'
      });
    }

    const created = await prisma.bNSSection.create({
      data: {
        sectionNo: validated.sectionNo,
        heading: validated.heading,
        paragraph: validated.paragraph,
        explanation: validated.explanation,
        content: validated.content,
        metaTitle: validated.metaTitle,
        keywords: validated.keywords,
        metaDescription: validated.metaDescription,
        createdBy: req.user.id
      }
    });

    return res.status(201).json({
      success: true,
      message: 'BNS section created successfully',
      data: mapPublicBNSResponse(created, true)
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
 * Edit BNS Section (Content Creator Only)
 * PATCH /api/content-creator/bns/:bnsId
 */
export const editBNSSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { bnsId } = req.params;

    bnsValidator.checkForbiddenBNSFields(req.body);

    const existing = await prisma.bNSSection.findUnique({
      where: { id: bnsId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'BNS section not found'
      });
    }

    const validated = bnsValidator.updateBNSSectionSchema.parse(req.body);

    if (validated.sectionNo && validated.sectionNo !== existing.sectionNo) {
      const duplicate = await prisma.bNSSection.findUnique({
        where: { sectionNo: validated.sectionNo }
      });

      if (duplicate && duplicate.id !== bnsId) {
        return res.status(400).json({
          success: false,
          message: 'This BNS section already exists'
        });
      }
    }

    const updateData = {};
    if (validated.sectionNo !== undefined) updateData.sectionNo = validated.sectionNo;
    if (validated.heading !== undefined) updateData.heading = validated.heading;
    if (validated.paragraph !== undefined) updateData.paragraph = validated.paragraph;
    if (validated.explanation !== undefined) updateData.explanation = validated.explanation;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.metaTitle !== undefined) updateData.metaTitle = validated.metaTitle;
    if (validated.keywords !== undefined) updateData.keywords = validated.keywords;
    if (validated.metaDescription !== undefined) updateData.metaDescription = validated.metaDescription;

    const updated = await prisma.bNSSection.update({
      where: { id: bnsId },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'BNS section updated successfully',
      data: mapPublicBNSResponse(updated, true)
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
 * Get Single BNS Section (Public)
 * GET /api/bns/:bnsId
 */
export const getSingleBNSSection = async (req, res, next) => {
  try {
    const { bnsId } = req.params;

    const section = await prisma.bNSSection.findUnique({
      where: { id: bnsId }
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'BNS section not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapPublicBNSResponse(section, true)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Public BNS Sections List (Public)
 * GET /api/bns
 */
export const getBNSSections = async (req, res, next) => {
  try {
    const { page, limit } = bnsValidator.getBNSQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [sections, total] = await prisma.$transaction([
      prisma.bNSSection.findMany({
        skip,
        take: limit,
        orderBy: { sectionNo: 'asc' }
      }),
      prisma.bNSSection.count()
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: sections.map((sec) => mapPublicBNSResponse(sec, false)),
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
 * Search BNS Sections (Public)
 * GET /api/bns/search
 */
export const searchBNSSections = async (req, res, next) => {
  try {
    const { q, page, limit } = bnsValidator.searchBNSQuerySchema.parse(req.query);

    const trimmedQuery = q ? q.trim() : '';

    const where = {};
    if (trimmedQuery) {
      where.OR = [
        { sectionNo: { contains: trimmedQuery, mode: 'insensitive' } },
        { heading: { contains: trimmedQuery, mode: 'insensitive' } },
        { explanation: { contains: trimmedQuery, mode: 'insensitive' } },
        { paragraph: { contains: trimmedQuery, mode: 'insensitive' } },
        { content: { contains: trimmedQuery, mode: 'insensitive' } }
      ];
    }

    const allMatches = await prisma.bNSSection.findMany({
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
      if (
        (sec.paragraph && sec.paragraph.toLowerCase().includes(lowerQ)) ||
        (sec.content && sec.content.toLowerCase().includes(lowerQ))
      )
        return 4;
      return 5;
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
      data: paginated.map((sec) => mapPublicBNSResponse(sec, false)),
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
