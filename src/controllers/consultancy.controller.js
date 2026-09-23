import * as consultancyService from '../services/consultancy.service.js';
import {
  createConsultancyRequestSchema,
  adminUpdateConsultancyStatusSchema,
  adminConsultancyQuerySchema,
  userConsultancyQuerySchema
} from '../validators/consultancy.validator.js';

/**
 * User: Create consultancy request
 * POST /api/user/consultancy
 */
export const createUserRequest = async (req, res, next) => {
  try {
    const validated = createConsultancyRequestSchema.parse(req.body);

    const data = await consultancyService.createConsultancyRequest({
      userId: req.user.id,
      callType: validated.callType,
      duration: validated.duration,
      phoneNumber: validated.phoneNumber,
      email: validated.email
    });

    return res.status(201).json({
      success: true,
      message: 'Consultancy request submitted successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User: Get consultancy history
 * GET /api/user/consultancy
 */
export const getUserRequests = async (req, res, next) => {
  try {
    const query = userConsultancyQuerySchema.parse(req.query);

    const result = await consultancyService.getUserConsultancyHistory({
      userId: req.user.id,
      page: query.page,
      limit: query.limit
    });

    return res.status(200).json({
      success: true,
      data: result.requests,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User: Get single consultancy request by ID
 * GET /api/user/consultancy/:id
 */
export const getUserRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await consultancyService.getUserConsultancyRequestById({
      userId: req.user.id,
      id
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all consultancy requests with pagination and status filter
 * GET /api/admin/consultancy
 */
export const adminListRequests = async (req, res, next) => {
  try {
    const query = adminConsultancyQuerySchema.parse(req.query);

    const result = await consultancyService.listAdminConsultancyRequests({
      page: query.page,
      limit: query.limit,
      status: query.status
    });

    return res.status(200).json({
      success: true,
      data: result.requests,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Mark consultancy request as COMPLETED
 * PATCH /api/admin/consultancy/:id/status
 */
export const adminMarkCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    adminUpdateConsultancyStatusSchema.parse(req.body);

    const data = await consultancyService.markConsultancyRequestCompleted(id);

    return res.status(200).json({
      success: true,
      message: 'Consultancy request marked as COMPLETED successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};
