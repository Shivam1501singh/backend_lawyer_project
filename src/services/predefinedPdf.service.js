import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma.js';
import { getUploadDir } from '../middleware/actPdfUpload.middleware.js';

/**
 * Normalizes text for matching (lowercase, alphanumeric only)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Resolves a safe file path within the base uploads directory or as given
 */
export const resolvePdfPath = (storedPath) => {
  if (!storedPath) return null;
  const uploadDir = getUploadDir();

  // If already absolute and exists
  if (path.isAbsolute(storedPath) && fs.existsSync(storedPath)) {
    return storedPath;
  }

  // Check relative to uploadDir
  const candidateInUploadDir = path.resolve(uploadDir, path.basename(storedPath));
  if (fs.existsSync(candidateInUploadDir)) {
    return candidateInUploadDir;
  }

  // Check relative to project root
  const candidateInProjectRoot = path.resolve(process.cwd(), storedPath);
  if (fs.existsSync(candidateInProjectRoot)) {
    return candidateInProjectRoot;
  }

  return candidateInUploadDir;
};

/**
 * Associates a single predefined local PDF file with an Act (Idempotent)
 */
export const attachPredefinedPdfToAct = async ({ actId, fileName, filePath }) => {
  const act = await prisma.act.findUnique({
    where: { id: actId }
  });

  if (!act) {
    const error = new Error('Act not found');
    error.statusCode = 404;
    throw error;
  }

  const uploadDir = getUploadDir();
  const actualFileName = fileName || path.basename(filePath);
  const resolvedPath = filePath ? resolvePdfPath(filePath) : path.resolve(uploadDir, actualFileName);

  if (!fs.existsSync(resolvedPath)) {
    const error = new Error(`Predefined PDF file "${actualFileName}" does not exist in ${uploadDir}`);
    error.statusCode = 404;
    throw error;
  }

  const stats = fs.statSync(resolvedPath);
  const relativePath = path.relative(process.cwd(), resolvedPath);

  // Check if attachment already exists (by actId and fileName OR filePath)
  const existing = await prisma.actPdf.findFirst({
    where: {
      actId,
      OR: [
        { fileName: actualFileName },
        { filePath: relativePath },
        { filePath: resolvedPath }
      ]
    }
  });

  if (existing) {
    return {
      isDuplicate: true,
      data: existing
    };
  }

  const created = await prisma.actPdf.create({
    data: {
      actId,
      fileName: actualFileName,
      filePath: relativePath,
      fileSize: stats.size,
      mimeType: 'application/pdf'
    }
  });

  return {
    isDuplicate: false,
    data: created
  };
};

/**
 * Scans the local uploads/acts folder and automatically links predefined PDFs to matching Acts.
 * Duplicate-safe: Existing attachments are not duplicated.
 */
export const syncPredefinedActPdfs = async ({ targetActId = null, directory = null } = {}) => {
  const uploadDir = directory ? path.resolve(directory) : getUploadDir();

  if (!fs.existsSync(uploadDir)) {
    return {
      syncedCount: 0,
      skippedCount: 0,
      attached: [],
      skipped: [],
      errors: []
    };
  }

  const files = fs.readdirSync(uploadDir).filter((file) => file.toLowerCase().endsWith('.pdf'));
  const acts = await prisma.act.findMany();

  const attached = [];
  const skipped = [];
  const errors = [];

  const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

  for (const file of files) {
    const filePath = path.resolve(uploadDir, file);
    const stats = fs.statSync(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    try {
      let matchedAct = null;

      if (targetActId) {
        matchedAct = acts.find((a) => a.id === targetActId);
      } else {
        // Try UUID match in filename
        const match = file.match(uuidRegex);
        if (match) {
          const extractedId = match[0];
          matchedAct = acts.find((a) => a.id === extractedId);
        }

        // Try Normalized Act Heading / Name match
        if (!matchedAct) {
          const baseName = path.basename(file, path.extname(file));
          const normalizedFile = normalizeText(baseName);

          matchedAct = acts.find((a) => {
            const normalizedHeading = normalizeText(a.heading);
            const normalizedAct = normalizeText(a.act);
            return (
              normalizedFile.includes(normalizedHeading) ||
              normalizedHeading.includes(normalizedFile) ||
              normalizedFile.includes(normalizedAct) ||
              normalizedAct.includes(normalizedFile)
            );
          });
        }
      }

      if (!matchedAct) {
        skipped.push({
          fileName: file,
          reason: 'No matching Act found'
        });
        continue;
      }

      // Check if already attached to this Act
      const existing = await prisma.actPdf.findFirst({
        where: {
          actId: matchedAct.id,
          OR: [
            { fileName: file },
            { filePath: relativePath },
            { filePath: filePath }
          ]
        }
      });

      if (existing) {
        skipped.push({
          fileName: file,
          actId: matchedAct.id,
          actHeading: matchedAct.heading,
          reason: 'Already attached (duplicate skipped)'
        });
        continue;
      }

      const created = await prisma.actPdf.create({
        data: {
          actId: matchedAct.id,
          fileName: file,
          filePath: relativePath,
          fileSize: stats.size,
          mimeType: 'application/pdf'
        }
      });

      attached.push({
        id: created.id,
        actId: matchedAct.id,
        actHeading: matchedAct.heading,
        fileName: file,
        filePath: relativePath,
        fileSize: stats.size
      });
    } catch (err) {
      errors.push({
        fileName: file,
        error: err.message
      });
    }
  }

  return {
    syncedCount: attached.length,
    skippedCount: skipped.length,
    attached,
    skipped,
    errors
  };
};
