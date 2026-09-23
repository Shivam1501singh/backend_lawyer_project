import prisma from '../lib/prisma.js';
import { getConsultancyPrice } from '../config/consultancyPricing.js';

/**
 * Format consultancy request object for API response
 */
const formatConsultancyRequest = (item) => {
  if (!item) return null;
  return {
    ...item,
    price: Number(item.price)
  };
};

/**
 * User: Create a new consultancy request
 */
export const createConsultancyRequest = async ({ userId, callType, duration, phoneNumber, email }) => {
  const calculatedPrice = getConsultancyPrice(callType, duration);

  const request = await prisma.consultancyRequest.create({
    data: {
      userId,
      callType,
      duration,
      price: calculatedPrice,
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      status: 'PENDING',
      completedAt: null
    }
  });

  return formatConsultancyRequest(request);
};

/**
 * User: Get consultancy history for authenticated user
 */
export const getUserConsultancyHistory = async ({ userId, page = 1, limit = 10 }) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  const where = { userId };

  const [total, items] = await prisma.$transaction([
    prisma.consultancyRequest.count({ where }),
    prisma.consultancyRequest.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    requests: items.map(formatConsultancyRequest),
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * User: Get single consultancy request by ID belonging to authenticated user
 */
export const getUserConsultancyRequestById = async ({ userId, id }) => {
  const request = await prisma.consultancyRequest.findUnique({
    where: { id }
  });

  if (!request || request.userId !== userId) {
    const err = new Error('Consultancy request not found.');
    err.statusCode = 404;
    throw err;
  }

  return formatConsultancyRequest(request);
};

/**
 * Admin: List consultancy requests with optional status filtering and FIFO ordering (createdAt ASC, id ASC)
 */
export const listAdminConsultancyRequests = async ({ page = 1, limit = 10, status }) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  const where = {};
  if (status) {
    where.status = status;
  }

  const [total, items] = await prisma.$transaction([
    prisma.consultancyRequest.count({ where }),
    prisma.consultancyRequest.findMany({
      where,
      skip,
      take,
      orderBy: [
        { createdAt: 'asc' },
        { id: 'asc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    })
  ]);

  return {
    requests: items.map(formatConsultancyRequest),
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Admin: Mark a consultancy request as COMPLETED
 */
export const markConsultancyRequestCompleted = async (id) => {
  const existing = await prisma.consultancyRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!existing) {
    const err = new Error('Consultancy request not found.');
    err.statusCode = 404;
    throw err;
  }

  // Idempotent completion if already completed
  if (existing.status === 'COMPLETED') {
    return formatConsultancyRequest(existing);
  }

  const updated = await prisma.consultancyRequest.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true
        }
      }
    }
  });

  return formatConsultancyRequest(updated);
};
