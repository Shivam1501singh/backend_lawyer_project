import prisma from '../lib/prisma.js';
import * as validator from '../validators/bearerAct.validator.js';

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
        if (validated.section !== undefined) updateData.section = validated.section;
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
            { section: 'asc' }
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
          { section: 'asc' }
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
