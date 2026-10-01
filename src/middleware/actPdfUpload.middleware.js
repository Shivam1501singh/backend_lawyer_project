import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getUploadDir = () => {
  const uploadDir = path.resolve(process.env.ACT_PDF_UPLOAD_DIR || 'uploads/acts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isPdfExt = ext === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf' || file.mimetype === 'application/octet-stream';

  if (!isPdfExt) {
    const error = new Error('Invalid file type. Only PDF files with .pdf extension are allowed.');
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const MAX_FILE_SIZE = parseInt(process.env.ACT_PDF_MAX_FILE_SIZE || `${50 * 1024 * 1024}`, 10); // 50MB default

export const uploadActPdfs = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 20 // Allow up to 20 PDFs in one upload
  }
});

/**
 * Middleware that wraps multer to handle upload fields and errors cleanly.
 * Supports multiple field names ('pdfs', 'files', 'pdf', 'file', or any uploaded files).
 */
export const handleActPdfUpload = (req, res, next) => {
  uploadActPdfs.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds the allowed limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`
        });
      }
      if (err.statusCode || err.status) {
        return res.status(err.statusCode || err.status).json({
          success: false,
          message: err.message
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.'
      });
    }
    next();
  });
};
