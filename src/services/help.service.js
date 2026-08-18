import prisma from '../lib/prisma.js';
import crypto from 'crypto';

/**
 * Generates a secure, cryptographically random Help reference ID (e.g., HELP-8F4K29).
 */
const generateReferenceId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'VKLS-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return ref;
};

/**
 * Creates a public help concern request.
 * Generates a unique reference ID.
 */
export const createHelpRequest = async ({ name, email, phoneNumber, concern }) => {
  let referenceId;
  let exists = true;
  let attempts = 0;

  // Collision safety loop
  while (exists && attempts < 10) {
    referenceId = generateReferenceId();
    const existing = await prisma.helpRequest.findUnique({
      where: { referenceId }
    });
    if (!existing) {
      exists = false;
    }
    attempts++;
  }

  const data = {
    referenceId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phoneNumber: phoneNumber.trim(),
    concern: concern.trim(),
    status: 'OPEN'
  };

  return await prisma.helpRequest.create({ data });
};

/**
 * Look up a public help request by reference ID and email.
 * This checks matching email to prevent enumeration blocks.
 */
export const lookupHelpRequest = async ({ referenceId, email }) => {
  const cleanRef = referenceId.trim();
  const cleanEmail = email.toLowerCase().trim();

  const helpRequest = await prisma.helpRequest.findUnique({
    where: { referenceId: cleanRef }
  });

  if (!helpRequest || helpRequest.email !== cleanEmail) {
    const err = new Error('Help request not found.');
    err.statusCode = 404;
    throw err;
  }

  return helpRequest;
};

/**
 * Get details for admin by database ID.
 */
export const getHelpRequestAdmin = async (id) => {
  const helpRequest = await prisma.helpRequest.findUnique({
    where: { id }
  });

  if (!helpRequest) {
    const err = new Error('Help request not found.');
    err.statusCode = 404;
    throw err;
  }

  return helpRequest;
};

/**
 * Admin: List and filter help requests with pagination.
 */
export const listAllHelpRequestsAdmin = async ({ page = 1, limit = 20, status, email, referenceId }) => {
  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const where = {};
  if (status) where.status = status;
  if (email) where.email = { contains: email.toLowerCase().trim(), mode: 'insensitive' };
  if (referenceId) where.referenceId = referenceId.trim();

  const [total, helpRequests] = await prisma.$transaction([
    prisma.helpRequest.count({ where }),
    prisma.helpRequest.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    helpRequests,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: take,
      totalPages: Math.ceil(total / take)
    }
  };
};

/**
 * Support/Admin response submission.
 */
export const respondToHelpRequest = async (id, { response, status }) => {
  const helpRequest = await prisma.helpRequest.findUnique({
    where: { id }
  });

  if (!helpRequest) {
    const err = new Error('Help request not found.');
    err.statusCode = 404;
    throw err;
  }

  return await prisma.helpRequest.update({
    where: { id },
    data: {
      response: response.trim(),
      status,
      respondedAt: new Date()
    }
  });
};
