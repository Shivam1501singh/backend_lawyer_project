import prisma from '../lib/prisma.js';
import * as validator from '../validators/bearerAct.validator.js';
import { calculateSectionOrder } from '../utils/sectionOrder.js';

/**
 * Single Content Creator Write Endpoint
 * POST /api/content-creator/bearer-acts
 */
export const contentCreatorWriteHandler = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { type, operation, data } = validator.contentCreatorWriteSchema.parse(req.body);

    // ==========================================
    // 1. BEARER_ACT OPERATIONS
    // ==========================================
    if (type === 'BEARER_ACT') {
      if (operation === 'CREATE') {
        const validated = validator.createBearerActSchema.parse(data);

        const existing = await prisma.bearerAct.findFirst({
          where: {
            name: {
              equals: validated.name,
              mode: 'insensitive'
            }
          }
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Bearer Act category with this name already exists'
          });
        }

        const created = await prisma.bearerAct.create({
          data: {
            name: validated.name
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Bearer Act category created successfully',
          data: created
        });
      }

      if (operation === 'UPDATE') {
        const validated = validator.updateBearerActSchema.parse(data);

        const target = await prisma.bearerAct.findUnique({
          where: { id: validated.id }
        });

        if (!target) {
          return res.status(404).json({
            success: false,
            message: 'Bearer Act category not found'
          });
        }

        const updateData = {};
        if (validated.name && validated.name !== target.name) {
          const duplicate = await prisma.bearerAct.findFirst({
            where: {
              name: {
                equals: validated.name,
                mode: 'insensitive'
              },
              NOT: { id: validated.id }
            }
          });

          if (duplicate) {
            return res.status(400).json({
              success: false,
              message: 'Bearer Act category with this name already exists'
            });
          }

          updateData.name = validated.name;
        }

        const updated = await prisma.bearerAct.update({
          where: { id: validated.id },
          data: updateData
        });

        return res.status(200).json({
          success: true,
          message: 'Bearer Act category updated successfully',
          data: updated
        });
      }
    }

    // ==========================================
    // 2. ACT OPERATIONS
    // ==========================================
    if (type === 'ACT') {
      if (operation === 'CREATE') {
        const validated = validator.createActSchema.parse(data);

        const parentBearerAct = await prisma.bearerAct.findUnique({
          where: { id: validated.bearerActId }
        });

        if (!parentBearerAct) {
          return res.status(404).json({
            success: false,
            message: 'Parent Bearer Act category not found'
          });
        }

        const created = await prisma.act.create({
          data: {
            bearerActId: validated.bearerActId,
            heading: validated.heading,
            act: validated.act,
            year: validated.year
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Act created successfully',
          data: created
        });
      }

      if (operation === 'UPDATE') {
        const validated = validator.updateActSchema.parse(data);

        const target = await prisma.act.findUnique({
          where: { id: validated.id }
        });

        if (!target) {
          return res.status(404).json({
            success: false,
            message: 'Act not found'
          });
        }

        if (validated.bearerActId && validated.bearerActId !== target.bearerActId) {
          const parentBearerAct = await prisma.bearerAct.findUnique({
            where: { id: validated.bearerActId }
          });

          if (!parentBearerAct) {
            return res.status(404).json({
              success: false,
              message: 'Parent Bearer Act category not found'
            });
          }
        }

        const updateData = {};
        if (validated.bearerActId !== undefined) updateData.bearerActId = validated.bearerActId;
        if (validated.heading !== undefined) updateData.heading = validated.heading;
        if (validated.act !== undefined) updateData.act = validated.act;
        if (validated.year !== undefined) updateData.year = validated.year;

        const updated = await prisma.act.update({
          where: { id: validated.id },
          data: updateData
        });

        return res.status(200).json({
          success: true,
          message: 'Act updated successfully',
          data: updated
        });
      }
    }

    // ==========================================
    // 3. SECTION OPERATIONS
    // ==========================================
    if (type === 'SECTION') {
      if (operation === 'CREATE') {
        const validated = validator.createSectionSchema.parse(data);

        const parentAct = await prisma.act.findUnique({
          where: { id: validated.actId }
        });

        if (!parentAct) {
          return res.status(404).json({
            success: false,
            message: 'Parent Act not found'
          });
        }

        const created = await prisma.actSection.create({
          data: {
            actId: validated.actId,
            section: validated.section,
            sectionOrder: calculateSectionOrder(validated.section),
            chapterNo: validated.chapterNo,
            chapterName: validated.chapterName,
            title: validated.title,
            description: validated.description,
            metaData: validated.metaData,
            metaDescription: validated.metaDescription || null,
            metaTitle: validated.metaTitle || null
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Act section created successfully',
          data: created
        });
      }

      if (operation === 'UPDATE') {
        const validated = validator.updateSectionSchema.parse(data);

        const target = await prisma.actSection.findUnique({
          where: { id: validated.id }
        });

        if (!target) {
          return res.status(404).json({
            success: false,
            message: 'Act section not found'
          });
        }

        if (validated.actId && validated.actId !== target.actId) {
          const parentAct = await prisma.act.findUnique({
            where: { id: validated.actId }
          });

          if (!parentAct) {
            return res.status(404).json({
              success: false,
              message: 'Parent Act not found'
            });
          }
        }

        const updateData = {};
        if (validated.actId !== undefined) updateData.actId = validated.actId;
        if (validated.section !== undefined) {
          updateData.section = validated.section;
          updateData.sectionOrder = calculateSectionOrder(validated.section);
        }
        if (validated.chapterNo !== undefined) updateData.chapterNo = validated.chapterNo;
        if (validated.chapterName !== undefined) updateData.chapterName = validated.chapterName;
        if (validated.title !== undefined) updateData.title = validated.title;
        if (validated.description !== undefined) updateData.description = validated.description;
        if (validated.metaData !== undefined) updateData.metaData = validated.metaData;
        if (validated.metaDescription !== undefined) updateData.metaDescription = validated.metaDescription;
        if (validated.metaTitle !== undefined) updateData.metaTitle = validated.metaTitle;

        const updated = await prisma.actSection.update({
          where: { id: validated.id },
          data: updateData
        });

        return res.status(200).json({
          success: true,
          message: 'Act section updated successfully',
          data: updated
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: `Unsupported operation ${operation} for entity type ${type}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get All Bearer Act Categories
 * GET /api/bearer-acts
 */
export const getBearerActs = async (req, res, next) => {
  try {
    const { page, limit } = validator.paginationQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [categories, total] = await prisma.$transaction([
      prisma.bearerAct.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.bearerAct.count()
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: categories,
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
 * Public: Get Single Bearer Act Category (with related Acts)
 * GET /api/bearer-acts/:id
 */
export const getSingleBearerAct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.bearerAct.findUnique({
      where: { id },
      include: {
        acts: {
          orderBy: { year: 'asc' }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Bearer Act category not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get Acts under a Bearer Act
 * GET /api/bearer-acts/:id/acts
 */
export const getActsByBearerAct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = validator.paginationQuerySchema.parse(req.query);

    const category = await prisma.bearerAct.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Bearer Act category not found'
      });
    }

    const skip = (page - 1) * limit;

    const [acts, total] = await prisma.$transaction([
      prisma.act.findMany({
        where: { bearerActId: id },
        skip,
        take: limit,
        orderBy: { year: 'asc' }
      }),
      prisma.act.count({
        where: { bearerActId: id }
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: acts,
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
 * Public: Get Single Act (with related Sections)
 * GET /api/acts/:id
 */
export const getSingleAct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const act = await prisma.act.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: [
            { chapterNo: 'asc' },
            { sectionOrder: 'asc' }
          ]
        }
      }
    });

    if (!act) {
      return res.status(404).json({
        success: false,
        message: 'Act not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: act
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get Sections under an Act
 * GET /api/acts/:id/sections
 */
export const getSectionsByAct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = validator.paginationQuerySchema.parse(req.query);

    const act = await prisma.act.findUnique({
      where: { id }
    });

    if (!act) {
      return res.status(404).json({
        success: false,
        message: 'Act not found'
      });
    }

    const skip = (page - 1) * limit;

    const [sections, total] = await prisma.$transaction([
      prisma.actSection.findMany({
        where: { actId: id },
        skip,
        take: limit,
        orderBy: [
          { chapterNo: 'asc' },
          { sectionOrder: 'asc' }
        ]
      }),
      prisma.actSection.count({
        where: { actId: id }
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: sections,
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
 * Public: Get Single Section
 * GET /api/sections/:id
 */
export const getSingleSection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const section = await prisma.actSection.findUnique({
      where: { id }
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Act section not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Global Search across Bearer Acts, Acts, and Sections
 * GET /api/bearer-acts/search?q=<query>&page=1&limit=20
 */
export const searchGlobalBearerActs = async (req, res, next) => {
  try {
    const { q, page, limit } = validator.searchBearerActQuerySchema.parse(req.query);

    const trimmedQuery = q.trim();
    const numericQ = !isNaN(trimmedQuery) && Number.isInteger(Number(trimmedQuery)) ? parseInt(trimmedQuery, 10) : null;

    const bearerActWhere = {
      name: { contains: trimmedQuery, mode: 'insensitive' }
    };

    const actWhere = {
      OR: [
        { heading: { contains: trimmedQuery, mode: 'insensitive' } },
        { act: { contains: trimmedQuery, mode: 'insensitive' } },
        ...(numericQ !== null ? [{ year: numericQ }] : [])
      ]
    };

    const sectionWhere = {
      OR: [
        { section: { contains: trimmedQuery, mode: 'insensitive' } },
        { chapterName: { contains: trimmedQuery, mode: 'insensitive' } },
        { title: { contains: trimmedQuery, mode: 'insensitive' } },
        { description: { contains: trimmedQuery, mode: 'insensitive' } },
        { metaData: { contains: trimmedQuery, mode: 'insensitive' } },
        { metaDescription: { contains: trimmedQuery, mode: 'insensitive' } },
        { metaTitle: { contains: trimmedQuery, mode: 'insensitive' } },
        ...(numericQ !== null ? [{ chapterNo: numericQ }] : [])
      ]
    };

    const [bearerActCount, actCount, sectionCount] = await prisma.$transaction([
      prisma.bearerAct.count({ where: bearerActWhere }),
      prisma.act.count({ where: actWhere }),
      prisma.actSection.count({ where: sectionWhere })
    ]);

    const total = bearerActCount + actCount + sectionCount;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const results = [];
    let currentSkip = skip;
    let currentLimit = limit;

    // 1. Bearer Act Matches
    if (currentLimit > 0 && currentSkip < bearerActCount) {
      const take = Math.min(currentLimit, bearerActCount - currentSkip);
      const bearerActs = await prisma.bearerAct.findMany({
        where: bearerActWhere,
        skip: currentSkip,
        take,
        orderBy: { name: 'asc' }
      });
      for (const b of bearerActs) {
        results.push({
          type: 'BEARER_ACT',
          bearerAct: {
            id: b.id,
            name: b.name,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt
          }
        });
      }
      currentLimit -= bearerActs.length;
      currentSkip = 0;
    } else if (currentSkip >= bearerActCount) {
      currentSkip -= bearerActCount;
    }

    // 2. Act Matches
    if (currentLimit > 0 && currentSkip < actCount) {
      const take = Math.min(currentLimit, actCount - currentSkip);
      const acts = await prisma.act.findMany({
        where: actWhere,
        skip: currentSkip,
        take,
        orderBy: { year: 'asc' },
        include: {
          bearerAct: true
        }
      });
      for (const a of acts) {
        results.push({
          type: 'ACT',
          bearerAct: {
            id: a.bearerAct.id,
            name: a.bearerAct.name
          },
          act: {
            id: a.id,
            bearerActId: a.bearerActId,
            heading: a.heading,
            act: a.act,
            year: a.year,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt
          }
        });
      }
      currentLimit -= acts.length;
      currentSkip = 0;
    } else if (currentSkip >= actCount) {
      currentSkip -= actCount;
    }

    // 3. Section Matches
    if (currentLimit > 0 && currentSkip < sectionCount) {
      const take = Math.min(currentLimit, sectionCount - currentSkip);
      const sections = await prisma.actSection.findMany({
        where: sectionWhere,
        skip: currentSkip,
        take,
        orderBy: [
          { chapterNo: 'asc' },
          { sectionOrder: 'asc' }
        ],
        include: {
          act: {
            include: {
              bearerAct: true
            }
          }
        }
      });
      for (const s of sections) {
        results.push({
          type: 'SECTION',
          bearerAct: {
            id: s.act.bearerAct.id,
            name: s.act.bearerAct.name
          },
          act: {
            id: s.act.id,
            bearerActId: s.act.bearerActId,
            heading: s.act.heading,
            act: s.act.act,
            year: s.act.year
          },
          section: {
            id: s.id,
            actId: s.actId,
            section: s.section,
            chapterNo: s.chapterNo,
            chapterName: s.chapterName,
            title: s.title,
            description: s.description,
            metaData: s.metaData,
            metaDescription: s.metaDescription,
            metaTitle: s.metaTitle,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
          }
        });
      }
      currentLimit -= sections.length;
      currentSkip = 0;
    }

    return res.status(200).json({
      success: true,
      data: results,
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
 * Public: Act-Specific Search within Sections of a Selected Act
 * GET /api/acts/:actId/search?q=<query>&page=1&limit=20
 */
export const searchActSections = async (req, res, next) => {
  try {
    const { actId } = req.params;
    const { q, page, limit } = validator.searchBearerActQuerySchema.parse(req.query);

    const act = await prisma.act.findUnique({
      where: { id: actId }
    });

    if (!act) {
      return res.status(404).json({
        success: false,
        message: 'Act not found'
      });
    }

    const trimmedQuery = q.trim();
    const numericQ = !isNaN(trimmedQuery) && Number.isInteger(Number(trimmedQuery)) ? parseInt(trimmedQuery, 10) : null;

    const where = {
      actId: act.id,
      OR: [
        { section: { contains: trimmedQuery, mode: 'insensitive' } },
        { chapterName: { contains: trimmedQuery, mode: 'insensitive' } },
        { title: { contains: trimmedQuery, mode: 'insensitive' } },
        { description: { contains: trimmedQuery, mode: 'insensitive' } },
        { metaData: { contains: trimmedQuery, mode: 'insensitive' } },
        { metaDescription: { contains: trimmedQuery, mode: 'insensitive' } },
        { metaTitle: { contains: trimmedQuery, mode: 'insensitive' } },
        ...(numericQ !== null ? [{ chapterNo: numericQ }] : [])
      ]
    };

    const skip = (page - 1) * limit;

    const [sections, total] = await prisma.$transaction([
      prisma.actSection.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { chapterNo: 'asc' },
          { sectionOrder: 'asc' }
        ]
      }),
      prisma.actSection.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        act: {
          id: act.id,
          heading: act.heading,
          act: act.act,
          year: act.year
        },
        results: sections
      },
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

