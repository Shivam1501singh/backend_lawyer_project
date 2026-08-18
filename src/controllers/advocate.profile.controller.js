import prisma from '../lib/prisma.js';
import { advocateProfileUpdateSchema } from '../validators/advocate.validator.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

/**
 * Get the currently authenticated advocate's profile.
 */
export const getProfile = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Advocate role required.'
      });
    }

    const advocate = await prisma.advocate.findUnique({
      where: { id: req.user.id }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate profile not found.'
      });
    }

    // Exclude passwordHash and aadhaarNumber
    const { passwordHash, aadhaarNumber, ...safeAdvocate } = advocate;

    return res.status(200).json({
      success: true,
      advocate: {
        ...safeAdvocate,
        type: 'advocate'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the currently authenticated advocate's profile.
 */
export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Advocate role required.'
      });
    }

    const validated = advocateProfileUpdateSchema.parse(req.body);

    const updateData = {};

    const allowedScalars = [
      'fullName', 'gender', 'barCouncilId', 'aadhaarNumber', 'email', 'about',
      'completeAddress', 'offlineVisitingFee', 'state', 'city', 'pincode', 'casesWon',
      'bestPracticeArea', 'topCourtPractised', 'practiceAreas'
    ];

    for (const field of allowedScalars) {
      if (validated[field] !== undefined) {
        updateData[field] = validated[field];
      }
    }

    // Map aliases
    if (validated.experience !== undefined) {
      updateData.experienceYears = validated.experience;
    } else if (validated.experienceYears !== undefined) {
      updateData.experienceYears = validated.experienceYears;
    }

    if (validated.videoChargePerMinute !== undefined) {
      updateData.videoCallChargePerMinute = validated.videoChargePerMinute;
    } else if (validated.videoCallChargePerMinute !== undefined) {
      updateData.videoCallChargePerMinute = validated.videoCallChargePerMinute;
    }

    if (validated.voiceChargePerMinute !== undefined) {
      updateData.voiceCallChargePerMinute = validated.voiceChargePerMinute;
    } else if (validated.voiceCallChargePerMinute !== undefined) {
      updateData.voiceCallChargePerMinute = validated.voiceCallChargePerMinute;
    }

    if (validated.languages !== undefined) {
      updateData.languagesSpoken = validated.languages;
    } else if (validated.languagesSpoken !== undefined) {
      updateData.languagesSpoken = validated.languagesSpoken;
    }

    if (validated.courtPractice !== undefined) {
      updateData.courtPractice = validated.courtPractice;
    }

    const updatedAdvocate = await prisma.advocate.update({
      where: { id: req.user.id },
      data: updateData
    });

    // Exclude passwordHash and aadhaarNumber
    const { passwordHash, aadhaarNumber, ...safeAdvocate } = updatedAdvocate;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      advocate: {
        ...safeAdvocate,
        type: 'advocate'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile photo for advocate and cleanup old Cloudinary image.
 */
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Advocate role required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided.'
      });
    }

    // Accept common image formats: JPEG, JPG, PNG, WEBP
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only JPEG, JPG, PNG, and WEBP images are allowed.'
      });
    }

    // Maximum file size: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 5MB limit.'
      });
    }

    const advocate = await prisma.advocate.findUnique({
      where: { id: req.user.id }
    });

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate profile not found.'
      });
    }

    const oldPublicId = advocate.profilePhotoPublicId;

    // Upload new image to Cloudinary
    const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer);

    try {
      // Update DB with new photo
      const updatedAdvocate = await prisma.advocate.update({
        where: { id: req.user.id },
        data: {
          profilePhotoUrl: url,
          profilePhotoPublicId: publicId
        }
      });

      // DB update succeeded, delete old Cloudinary image if it exists
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      const { passwordHash, aadhaarNumber, ...safeAdvocate } = updatedAdvocate;

      return res.status(200).json({
        success: true,
        message: 'Photo updated successfully',
        profilePhotoUrl: url,
        advocate: {
          ...safeAdvocate,
          type: 'advocate'
        }
      });
    } catch (dbError) {
      // Clean up orphaned new image from Cloudinary
      await deleteFromCloudinary(publicId);
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};
