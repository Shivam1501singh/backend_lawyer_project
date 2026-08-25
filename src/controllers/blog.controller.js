import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { signToken, sendTokenCookie } from '../utils/jwt.js';
import * as blogValidator from '../validators/blog.validator.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

/**
 * Content Creator Login
 */
export const loginContentCreator = async (req, res, next) => {
  try {
    const validated = blogValidator.loginSchema.parse(req.body);
    const normalizedEmail = validated.email.toLowerCase().trim();

    const creator = await prisma.contentCreator.findUnique({
      where: { email: normalizedEmail }
    });

    if (!creator || !creator.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(validated.password, creator.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = signToken({ id: creator.id, type: 'content_creator' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      contentCreator: {
        id: creator.id,
        email: creator.email,
        fullName: creator.fullName
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Blog (Content Creator Only)
 */
export const createBlog = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'content_creator') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const validated = blogValidator.createBlogSchema.parse(req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Blog image is required.'
      });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only JPEG, JPG, PNG, and WEBP images are allowed.'
      });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 5MB limit.'
      });
    }

    const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer);

    try {
      const blog = await prisma.blog.create({
        data: {
          heading: validated.heading,
          title: validated.title,
          date: validated.date,
          writtenBy: validated.writtenBy,
          content: validated.content,
          image: url,
          imagePublicId: publicId,
          authorId: req.user.id
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        blog
      });
    } catch (dbError) {
      await deleteFromCloudinary(publicId);
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Blogs (Public)
 */
export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      blogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Blog (Public)
 */
export const getSingleBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    return res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Blog (Content Creator Only & Owner Only)
 */
export const updateBlog = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'content_creator') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You do not own this blog.'
      });
    }

    const validated = blogValidator.updateBlogSchema.parse(req.body);

    const updateData = {};
    const allowedFields = ['heading', 'title', 'date', 'writtenBy', 'content'];
    for (const field of allowedFields) {
      if (validated[field] !== undefined) {
        updateData[field] = validated[field];
      }
    }

    let newPublicId = null;
    let oldPublicId = blog.imagePublicId;

    if (req.file) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file format. Only JPEG, JPG, PNG, and WEBP images are allowed.'
        });
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 5MB limit.'
        });
      }

      const uploadRes = await uploadBufferToCloudinary(req.file.buffer);
      updateData.image = uploadRes.url;
      updateData.imagePublicId = uploadRes.publicId;
      newPublicId = uploadRes.publicId;
    }

    try {
      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: updateData
      });

      if (newPublicId && oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      return res.status(200).json({
        success: true,
        message: 'Blog updated successfully',
        blog: updatedBlog
      });
    } catch (dbError) {
      if (newPublicId) {
        await deleteFromCloudinary(newPublicId);
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Blog (Content Creator Only & Owner Only)
 */
export const deleteBlog = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'content_creator') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Content Creator role required.'
      });
    }

    const { id } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You do not own this blog.'
      });
    }

    const imagePublicId = blog.imagePublicId;

    await prisma.blog.delete({
      where: { id }
    });

    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
