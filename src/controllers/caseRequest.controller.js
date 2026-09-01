import * as caseRequestService from '../services/caseRequest.service.js';
import * as caseRequestValidator from '../validators/caseRequest.validator.js';

/**
 * User submits a new connection request to a lawyer.
 * POST /api/lawyers/:advocateId/connect
 */
export const createRequest = async (req, res, next) => {
  try {
    const { advocateId } = req.params;

    if (!req.user || (req.user.role !== 'USER' && req.user.type !== 'user')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only Normal Users can submit connection requests.'
      });
    }

    // Validate body
    const validated = caseRequestValidator.createCaseRequestSchema.parse(req.body);

    // Validate files if present
    const files = req.files || [];
    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 files can be uploaded per connection request.'
      });
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file format for '${file.originalname}'. Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.`
        });
      }
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size for '${file.originalname}' exceeds the 5MB limit.`
        });
      }
    }

    const result = await caseRequestService.createCaseRequest({
      userId: req.user.id,
      advocateId,
      note: validated.note,
      description: validated.description,
      files
    });

    return res.status(201).json({
      success: true,
      message: 'Connection request submitted successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * User lists their own connection requests.
 * GET /api/user/case-requests
 */
export const getUserRequests = async (req, res, next) => {
  try {
    const requests = await caseRequestService.listUserCaseRequests(req.user.id);
    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User gets details of their specific connection request.
 * GET /api/user/case-requests/:requestId
 */
export const getUserRequestById = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await caseRequestService.getUserCaseRequestById({
      userId: req.user.id,
      requestId
    });
    return res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Admin lists all case connection requests (with optional status query).
 * GET /api/admin/case-requests
 */
export const getAdminRequests = async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    if (status) {
      caseRequestValidator.statusQuerySchema.parse(status);
    }

    const requests = await caseRequestService.listAdminCaseRequests({ status });
    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Admin gets details of a specific case connection request.
 * GET /api/admin/case-requests/:requestId
 */
export const getAdminRequestById = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await caseRequestService.getAdminCaseRequestById(requestId);
    return res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Admin connects a pending case request to the Advocate.
 * PATCH /api/admin/case-requests/:requestId/connect
 */
export const connectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const result = await caseRequestService.connectCaseRequestByAdmin(requestId);
    return res.status(200).json({
      success: true,
      message: 'Case connection request connected successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Admin rejects a pending case request.
 * PATCH /api/admin/case-requests/:requestId/reject
 */
export const rejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const result = await caseRequestService.rejectCaseRequestByAdmin(requestId);
    return res.status(200).json({
      success: true,
      message: 'Case connection request rejected successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Advocate lists CONNECTED cases assigned to them.
 * GET /api/advocate/case-connections
 */
export const getAdvocateConnections = async (req, res, next) => {
  try {
    const connections = await caseRequestService.listAdvocateCaseConnections(req.user.id);
    return res.status(200).json({
      success: true,
      connections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Advocate gets details of a specific CONNECTED case assigned to them.
 * GET /api/advocate/case-connections/:connectionId
 */
export const getAdvocateConnectionById = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    const connection = await caseRequestService.getAdvocateCaseConnectionById({
      advocateId: req.user.id,
      connectionId
    });
    return res.status(200).json({
      success: true,
      connection
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Download/view attachment file securely.
 * GET /api/case-requests/:requestId/attachments/:attachmentId
 */
export const getAttachmentFile = async (req, res, next) => {
  try {
    const { requestId, attachmentId } = req.params;
    const attachment = await caseRequestService.getAttachmentForAuthorizedUser({
      requestId,
      attachmentId,
      user: req.user
    });
    return res.status(200).json({
      success: true,
      attachment: {
        id: attachment.id,
        fileUrl: attachment.fileUrl,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        createdAt: attachment.createdAt
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
