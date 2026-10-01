import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma.js';
import { resolvePdfPath, attachPredefinedPdfToAct, syncPredefinedActPdfs } from '../services/predefinedPdf.service.js';
import * as validator from '../validators/bearerAct.validator.js';

/**
 * Helper to build view and download URLs for a PDF attachment
 */
export const formatPdfResponse = (pdf, req = null) => {
  const baseUrl = req ? `${req.protocol}://${req.get('host')}` : '';
  return {
    id: pdf.id,
    actId: pdf.actId,
    fileName: pdf.fileName,
    filePath: pdf.filePath,
    fileSize: pdf.fileSize,
    mimeType: pdf.mimeType || 'application/pdf',
    createdAt: pdf.createdAt,
    updatedAt: pdf.updatedAt,
    viewUrl: `${baseUrl}/api/acts/pdfs/${pdf.id}/view`,
    downloadUrl: `${baseUrl}/api/acts/pdfs/${pdf.id}/download`,
    ...(pdf.act ? { act: pdf.act } : {})
  };
};

/**
 * Content Creator: Upload Multiple PDFs for an Act
 * POST /api/content-creator/acts/:actId/pdfs
 * (Also supports POST /api/content-creator/acts/pdfs with actId in body)
 */
export const uploadActPdfsHandler = async (req, res, next) => {
  const uploadedFiles = req.files || [];

  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      // Clean up uploaded files on authorization failure
      for (const file of uploadedFiles) {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const actId = req.params.actId || req.params.id || req.body.actId || req.query.actId;

    if (!actId) {
      for (const file of uploadedFiles) {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'actId is required to attach PDFs.'
      });
    }

    const act = await prisma.act.findUnique({
      where: { id: actId }
    });

    if (!act) {
      for (const file of uploadedFiles) {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Act not found'
      });
    }

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No PDF files uploaded. Please attach at least one PDF file (field name "pdfs" or "files").'
      });
    }

    const createdPdfs = [];

    for (const file of uploadedFiles) {
      const relativePath = path.relative(process.cwd(), file.path);

      const created = await prisma.actPdf.create({
        data: {
          actId: act.id,
          fileName: file.originalname,
          filePath: relativePath,
          fileSize: file.size,
          mimeType: file.mimetype || 'application/pdf'
        }
      });

      createdPdfs.push(formatPdfResponse(created, req));
    }

    return res.status(201).json({
      success: true,
      message: `${createdPdfs.length} PDF(s) uploaded successfully`,
      act: {
        id: act.id,
        heading: act.heading,
        act: act.act,
        year: act.year
      },
      data: createdPdfs
    });
  } catch (error) {
    // Clean up uploaded files on error
    for (const file of uploadedFiles) {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      }
    }
    next(error);
  }
};

/**
 * Public: Get All PDFs for an Act
 * GET /api/acts/:actId/pdfs
 */
export const getActPdfs = async (req, res, next) => {
  try {
    const actId = req.params.actId || req.params.id;

    const act = await prisma.act.findUnique({
      where: { id: actId }
    });

    if (!act) {
      return res.status(404).json({
        success: false,
        message: 'Act not found'
      });
    }

    const pdfs = await prisma.actPdf.findMany({
      where: { actId: act.id },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPdfs = pdfs.map((p) => formatPdfResponse(p, req));

    return res.status(200).json({
      success: true,
      act: {
        id: act.id,
        heading: act.heading,
        act: act.act,
        year: act.year
      },
      data: formattedPdfs,
      count: formattedPdfs.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get Details of a Single PDF Attachment
 * GET /api/acts/pdfs/:id or GET /api/pdfs/:id
 */
export const getSinglePdfDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pdf = await prisma.actPdf.findUnique({
      where: { id },
      include: {
        act: {
          select: {
            id: true,
            bearerActId: true,
            heading: true,
            act: true,
            year: true
          }
        }
      }
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF attachment not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: formatPdfResponse(pdf, req)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: View PDF in browser (inline)
 * GET /api/acts/pdfs/:id/view or GET /api/pdfs/:id/view
 */
export const viewPdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pdf = await prisma.actPdf.findUnique({
      where: { id }
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF attachment not found'
      });
    }

    const resolvedPath = resolvePdfPath(pdf.filePath);

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on disk'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(pdf.fileName)}"`);
    res.sendFile(resolvedPath);
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Download PDF (attachment)
 * GET /api/acts/pdfs/:id/download or GET /api/pdfs/:id/download
 */
export const downloadPdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pdf = await prisma.actPdf.findUnique({
      where: { id }
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF attachment not found'
      });
    }

    const resolvedPath = resolvePdfPath(pdf.filePath);

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on disk'
      });
    }

    res.download(resolvedPath, pdf.fileName);
  } catch (error) {
    next(error);
  }
};

/**
 * Content Creator: Attach Predefined Local PDF to an Act
 * POST /api/content-creator/acts/:actId/predefined-pdfs
 */
export const attachPredefinedPdfHandler = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const actId = req.params.actId || req.params.id || req.body.actId;
    const validated = validator.attachPredefinedPdfSchema.parse(req.body);

    const result = await attachPredefinedPdfToAct({
      actId,
      fileName: validated.fileName,
      filePath: validated.filePath
    });

    const statusCode = result.isDuplicate ? 200 : 201;
    const message = result.isDuplicate
      ? 'PDF attachment already associated with this Act'
      : 'Predefined PDF attached successfully';

    return res.status(statusCode).json({
      success: true,
      message,
      isDuplicate: result.isDuplicate,
      data: formatPdfResponse(result.data, req)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Content Creator: Sync All Predefined PDFs in uploads/acts/
 * POST /api/content-creator/acts/predefined-pdfs/sync
 */
export const syncPredefinedPdfsHandler = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const targetActId = req.body?.actId || req.query?.actId || null;
    const directory = req.body?.directory || null;

    const result = await syncPredefinedActPdfs({
      targetActId,
      directory
    });

    return res.status(200).json({
      success: true,
      message: 'Predefined PDF sync process completed',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Content Creator: Delete PDF Attachment
 * DELETE /api/content-creator/acts/pdfs/:id
 */
export const deleteActPdfHandler = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'CONTENT_CREATOR' && req.user.type !== 'content_creator')) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;

    const pdf = await prisma.actPdf.findUnique({
      where: { id }
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF attachment not found'
      });
    }

    await prisma.actPdf.delete({
      where: { id }
    });

    // Optionally delete uploaded file if desired
    const resolvedPath = resolvePdfPath(pdf.filePath);
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      try {
        fs.unlinkSync(resolvedPath);
      } catch (err) {
        console.warn(`Could not remove file ${resolvedPath}:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'PDF attachment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
