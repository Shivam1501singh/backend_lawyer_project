import prisma from '../lib/prisma.js';
import { uploadBufferToCloudinary } from './cloudinary.service.js';

/**
 * Normal User submits a connection request to an active Advocate.
 */
export const createCaseRequest = async ({ userId, advocateId, note, description, files = [] }) => {
  // 1. Verify Advocate exists and is ACTIVE
  const advocate = await prisma.advocate.findUnique({
    where: { id: advocateId }
  });

  if (!advocate || !advocate.isActive || advocate.status !== 'ACTIVE') {
    const error = new Error('This lawyer is currently unavailable.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Prevent duplicate simultaneous PENDING requests
  const existingPending = await prisma.caseConnectionRequest.findFirst({
    where: {
      userId,
      advocateId,
      status: 'PENDING'
    }
  });

  if (existingPending) {
    const error = new Error('You already have a pending connection request with this lawyer.');
    error.statusCode = 409;
    throw error;
  }

  // 3. Process file attachments (up to 5 files)
  const uploadedAttachments = [];
  if (files && files.length > 0) {
    for (const file of files) {
      try {
        const { url, publicId } = await uploadBufferToCloudinary(file.buffer);
        uploadedAttachments.push({
          fileUrl: url,
          publicId: publicId || null,
          fileType: file.mimetype || 'application/octet-stream',
          fileName: file.originalname || 'document'
        });
      } catch (uploadErr) {
        console.error('Attachment upload failed:', uploadErr);
        throw new Error(`Failed to upload attachment: ${uploadErr.message}`);
      }
    }
  }

  // 4. Create CaseConnectionRequest with initial PENDING status
  const request = await prisma.caseConnectionRequest.create({
    data: {
      userId,
      advocateId,
      note,
      description,
      status: 'PENDING',
      attachments: {
        create: uploadedAttachments
      }
    },
    include: {
      attachments: true,
      advocate: {
        select: {
          id: true,
          fullName: true,
          profilePhotoUrl: true
        }
      }
    }
  });

  return {
    id: request.id,
    status: request.status,
    advocateId: request.advocateId,
    advocateName: request.advocate?.fullName || null,
    createdAt: request.createdAt,
    attachmentsCount: request.attachments.length
  };
};

/**
 * List connection requests submitted by a specific user.
 */
export const listUserCaseRequests = async (userId) => {
  const requests = await prisma.caseConnectionRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      advocate: {
        select: {
          id: true,
          fullName: true,
          profilePhotoUrl: true,
          bestPracticeArea: true
        }
      },
      attachments: true,
      connection: {
        select: { id: true, createdAt: true }
      }
    }
  });

  return requests.map(req => ({
    id: req.id,
    advocate: {
      id: req.advocate.id,
      name: req.advocate.fullName,
      fullName: req.advocate.fullName,
      profilePhotoUrl: req.advocate.profilePhotoUrl,
      bestPracticeArea: req.advocate.bestPracticeArea
    },
    note: req.note,
    description: req.description,
    status: req.status,
    attachments: req.attachments.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      fileType: a.fileType
    })),
    connectionId: req.connection ? req.connection.id : null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt
  }));
};

/**
 * Get details of a specific user connection request.
 */
export const getUserCaseRequestById = async ({ userId, requestId }) => {
  const req = await prisma.caseConnectionRequest.findUnique({
    where: { id: requestId },
    include: {
      advocate: {
        select: {
          id: true,
          fullName: true,
          profilePhotoUrl: true,
          bestPracticeArea: true,
          city: true,
          state: true
        }
      },
      attachments: true,
      connection: {
        select: { id: true, createdAt: true }
      }
    }
  });

  if (!req || req.userId !== userId) {
    const error = new Error('Case request not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: req.id,
    advocate: {
      id: req.advocate.id,
      name: req.advocate.fullName,
      fullName: req.advocate.fullName,
      profilePhotoUrl: req.advocate.profilePhotoUrl,
      bestPracticeArea: req.advocate.bestPracticeArea,
      city: req.advocate.city,
      state: req.advocate.state
    },
    note: req.note,
    description: req.description,
    status: req.status,
    attachments: req.attachments.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      fileType: a.fileType
    })),
    connectionId: req.connection ? req.connection.id : null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt
  };
};

/**
 * Admin lists all case requests with optional status filter.
 */
export const listAdminCaseRequests = async ({ status }) => {
  const where = {};
  if (status) {
    where.status = status;
  }

  const requests = await prisma.caseConnectionRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          city: true,
          state: true
        }
      },
      advocate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          barCouncilId: true
        }
      },
      attachments: true,
      connection: {
        select: { id: true, createdAt: true }
      }
    }
  });

  return requests.map(req => ({
    id: req.id,
    user: {
      id: req.user.id,
      name: req.user.fullName,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      city: req.user.city,
      state: req.user.state
    },
    advocate: {
      id: req.advocate.id,
      name: req.advocate.fullName,
      fullName: req.advocate.fullName,
      email: req.advocate.email,
      phone: req.advocate.phone,
      status: req.advocate.status,
      barCouncilId: req.advocate.barCouncilId
    },
    note: req.note,
    description: req.description,
    status: req.status,
    attachments: req.attachments.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      fileType: a.fileType
    })),
    connectionId: req.connection ? req.connection.id : null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt
  }));
};

/**
 * Admin gets details of a specific case request.
 */
export const getAdminCaseRequestById = async (requestId) => {
  const req = await prisma.caseConnectionRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          city: true,
          state: true,
          pincode: true
        }
      },
      advocate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          barCouncilId: true,
          bestPracticeArea: true,
          city: true,
          state: true
        }
      },
      attachments: true,
      connection: {
        select: { id: true, createdAt: true }
      }
    }
  });

  if (!req) {
    const error = new Error('Case request not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: req.id,
    user: {
      id: req.user.id,
      name: req.user.fullName,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      city: req.user.city,
      state: req.user.state,
      pincode: req.user.pincode
    },
    advocate: {
      id: req.advocate.id,
      name: req.advocate.fullName,
      fullName: req.advocate.fullName,
      email: req.advocate.email,
      phone: req.advocate.phone,
      status: req.advocate.status,
      barCouncilId: req.advocate.barCouncilId,
      bestPracticeArea: req.advocate.bestPracticeArea,
      city: req.advocate.city,
      state: req.advocate.state
    },
    note: req.note,
    description: req.description,
    status: req.status,
    attachments: req.attachments.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      fileType: a.fileType
    })),
    connectionId: req.connection ? req.connection.id : null,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt
  };
};

/**
 * Admin approves and connects a PENDING case request to the Advocate.
 */
export const connectCaseRequestByAdmin = async (requestId) => {
  const req = await prisma.caseConnectionRequest.findUnique({
    where: { id: requestId }
  });

  if (!req) {
    const error = new Error('Case request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (req.status !== 'PENDING') {
    const error = new Error(`Cannot connect a request with status '${req.status}'. Only PENDING requests can be connected.`);
    error.statusCode = 400;
    throw error;
  }

  // Atomically update request status and create CaseConnection record
  const [updatedRequest, connection] = await prisma.$transaction([
    prisma.caseConnectionRequest.update({
      where: { id: requestId },
      data: { status: 'CONNECTED' }
    }),
    prisma.caseConnection.create({
      data: {
        requestId,
        userId: req.userId,
        advocateId: req.advocateId
      }
    })
  ]);

  return {
    id: updatedRequest.id,
    status: updatedRequest.status,
    connectionId: connection.id,
    connectedAt: connection.createdAt
  };
};

/**
 * Admin rejects a PENDING case request.
 */
export const rejectCaseRequestByAdmin = async (requestId) => {
  const req = await prisma.caseConnectionRequest.findUnique({
    where: { id: requestId }
  });

  if (!req) {
    const error = new Error('Case request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (req.status !== 'PENDING') {
    const error = new Error(`Cannot reject a request with status '${req.status}'. Only PENDING requests can be rejected.`);
    error.statusCode = 400;
    throw error;
  }

  const updatedRequest = await prisma.caseConnectionRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });

  return {
    id: updatedRequest.id,
    status: updatedRequest.status,
    updatedAt: updatedRequest.updatedAt
  };
};

/**
 * List CONNECTED cases assigned to an Advocate.
 */
export const listAdvocateCaseConnections = async (advocateId) => {
  const connections = await prisma.caseConnection.findMany({
    where: { advocateId },
    orderBy: { createdAt: 'desc' },
    include: {
      request: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              city: true,
              state: true
            }
          },
          attachments: true
        }
      }
    }
  });

  return connections.map(conn => ({
    connectionId: conn.id,
    requestId: conn.requestId,
    user: {
      id: conn.request.user.id,
      name: conn.request.user.fullName,
      fullName: conn.request.user.fullName,
      email: conn.request.user.email,
      phone: conn.request.user.phone,
      city: conn.request.user.city,
      state: conn.request.user.state
    },
    note: conn.request.note,
    description: conn.request.description,
    attachments: conn.request.attachments.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      fileType: a.fileType
    })),
    connectedAt: conn.createdAt
  }));
};

/**
 * Get details of a specific CONNECTED case assigned to an Advocate.
 */
export const getAdvocateCaseConnectionById = async ({ advocateId, connectionId }) => {
  // Allow lookup by connectionId OR requestId
  const conn = await prisma.caseConnection.findFirst({
    where: {
      OR: [
        { id: connectionId },
        { requestId: connectionId }
      ]
    },
    include: {
      request: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              city: true,
              state: true,
              pincode: true
            }
          },
          attachments: true
        }
      }
    }
  });

  if (!conn || conn.advocateId !== advocateId || conn.request.status !== 'CONNECTED') {
    const error = new Error('Access forbidden. You do not have permission to view this connected case.');
    error.statusCode = 403;
    throw error;
  }

  return {
    connectionId: conn.id,
    requestId: conn.requestId,
    user: {
      id: conn.request.user.id,
      name: conn.request.user.fullName,
      fullName: conn.request.user.fullName,
      email: conn.request.user.email,
      phone: conn.request.user.phone,
      city: conn.request.user.city,
      state: conn.request.user.state,
      pincode: conn.request.user.pincode
    },
    note: conn.request.note,
    description: conn.request.description,
    status: conn.request.status,
    attachments: conn.request.attachments.map(a => ({
      id: a.id,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      fileType: a.fileType
    })),
    connectedAt: conn.createdAt
  };
};

/**
 * Authorize and fetch file attachment info for a user.
 */
export const getAttachmentForAuthorizedUser = async ({ requestId, attachmentId, user }) => {
  const attachment = await prisma.caseRequestAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      request: true
    }
  });

  if (!attachment || attachment.requestId !== requestId) {
    const error = new Error('Attachment not found.');
    error.statusCode = 404;
    throw error;
  }

  const req = attachment.request;
  const userRole = (user.role || user.type || '').toUpperCase();

  let isAuthorized = false;
  if (userRole === 'ADMIN') {
    isAuthorized = true;
  } else if (userRole === 'USER' && req.userId === user.id) {
    isAuthorized = true;
  } else if (userRole === 'ADVOCATE' && req.advocateId === user.id && req.status === 'CONNECTED') {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    const error = new Error('Access forbidden. You do not have permission to view this attachment.');
    error.statusCode = 403;
    throw error;
  }

  return attachment;
};
