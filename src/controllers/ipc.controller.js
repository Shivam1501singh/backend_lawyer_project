import prisma from '../lib/prisma.js';
import * as ipcValidator from '../validators/ipc.validator.js';

export const mapPublicIPCResponse = (section, includeContent = true) => {
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
 * Create IPC Section (Content Creator Only)
 * POST /api/content-creator/ipc
 */
export const createIPCSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    ipcValidator.checkForbiddenIPCFields(req.body);
    const validated = ipcValidator.createIPCSectionSchema.parse(req.body);

    const existing = await prisma.iPCSection.findUnique({
      where: { sectionNo: validated.sectionNo }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This IPC section already exists'
      });
    }

    const created = await prisma.iPCSection.create({
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
      message: 'IPC section created successfully',
      data: mapPublicIPCResponse(created, true)
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
 * Edit IPC Section (Content Creator Only)
 * PATCH /api/content-creator/ipc/:ipcId
 */
export const editIPCSection = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { ipcId } = req.params;

    ipcValidator.checkForbiddenIPCFields(req.body);

    const existing = await prisma.iPCSection.findUnique({
      where: { id: ipcId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'IPC section not found'
      });
    }

    const validated = ipcValidator.updateIPCSectionSchema.parse(req.body);

    if (validated.sectionNo && validated.sectionNo !== existing.sectionNo) {
      const duplicate = await prisma.iPCSection.findUnique({
        where: { sectionNo: validated.sectionNo }
      });

      if (duplicate && duplicate.id !== ipcId) {
        return res.status(400).json({
          success: false,
          message: 'This IPC section already exists'
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

    const updated = await prisma.iPCSection.update({
      where: { id: ipcId },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'IPC section updated successfully',
      data: mapPublicIPCResponse(updated, true)
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
 * Get Single IPC Section (Public)
 * GET /api/ipc/:ipcId
 */
export const getSingleIPCSection = async (req, res, next) => {
  try {
    const { ipcId } = req.params;

    const section = await prisma.iPCSection.findUnique({
      where: { id: ipcId }
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'IPC section not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: mapPublicIPCResponse(section, true)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Public IPC Sections List (Public)
 * GET /api/ipc
 */
export const getIPCSections = async (req, res, next) => {
  try {
    const { page, limit } = ipcValidator.getIPCQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [sections, total] = await prisma.$transaction([
      prisma.iPCSection.findMany({
        skip,
        take: limit,
        orderBy: { sectionNo: 'asc' }
      }),
      prisma.iPCSection.count()
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: sections.map((sec) => mapPublicIPCResponse(sec, false)),
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
 * Search IPC Sections (Public)
 * GET /api/ipc/search
 */
export const searchIPCSections = async (req, res, next) => {
  try {
    const { q, page, limit } = ipcValidator.searchIPCQuerySchema.parse(req.query);

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

    const allMatches = await prisma.iPCSection.findMany({
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
      data: paginated.map((sec) => mapPublicIPCResponse(sec, false)),
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
