import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { signToken, sendTokenCookie } from '../utils/jwt.js';
import * as blogValidator from '../validators/blog.validator.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

/**
 * Helper to format/map blog response object for API, returning SEO fields & array formatting for keywords
 */
export const mapBlogResponse = (blog) => {
  if (!blog) return null;
  
  const creatorData = blog.author ? {
    id: blog.author.id,
    name: blog.author.fullName,
    image: blog.author.image || null,
    bio: blog.author.bio || null
  } : null;

  return {
    id: blog.id,
    image: blog.image || null,
    heading: blog.heading,
    title: blog.title,
    slug: blog.slug || null,
    date: blog.date,
    writtenBy: blog.writtenBy,
    content: blog.content,
    metaTitle: blog.metaTitle || null,
    metaDescription: blog.metaDescription || null,
    metaKeywords: blog.metaKeywords
      ? blog.metaKeywords.split(',').map(kw => kw.trim()).filter(Boolean)
      : null,
    contentCreator: creatorData,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt
  };
};

/**
 * Generate a unique URL-friendly slug based on the title
 */
export const generateSlug = async (title, currentBlogId = null) => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug) {
    slug = 'blog';
  }

  let existing = await prisma.blog.findFirst({
    where: {
      slug,
      NOT: currentBlogId ? { id: currentBlogId } : undefined
    }
  });

  if (!existing) {
    return slug;
  }

  let uniqueSlug = slug;
  let counter = 1;
  while (existing) {
    uniqueSlug = `${slug}-${counter}`;
    existing = await prisma.blog.findFirst({
      where: {
        slug: uniqueSlug,
        NOT: currentBlogId ? { id: currentBlogId } : undefined
      }
    });
    counter++;
  }
  return uniqueSlug;
};

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
      const slug = await generateSlug(validated.title);

      const blog = await prisma.blog.create({
        data: {
          heading: validated.heading,
          title: validated.title,
          date: validated.date,
          writtenBy: validated.writtenBy,
          content: validated.content,
          image: url,
          imagePublicId: publicId,
          authorId: req.user.id,
          metaTitle: validated.metaTitle,
          metaDescription: validated.metaDescription,
          metaKeywords: validated.metaKeywords || null,
          slug
        },
        include: {
          author: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        blog: mapBlogResponse(blog)
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
    const { page, limit } = blogValidator.getBlogsQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    const [blogs, totalBlogs] = await prisma.$transaction([
      prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: true
        }
      }),
      prisma.blog.count()
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      blogs: blogs.map(mapBlogResponse),
      pagination: {
        currentPage: page,
        limit,
        totalBlogs,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
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

    const blog = await prisma.blog.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        author: true
      }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    return res.status(200).json({
      success: true,
      blog: mapBlogResponse(blog)
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
    const allowedFields = ['heading', 'title', 'date', 'writtenBy', 'content', 'metaTitle', 'metaDescription', 'metaKeywords'];
    for (const field of allowedFields) {
      if (validated[field] !== undefined) {
        updateData[field] = validated[field];
      }
    }

    if (validated.title) {
      updateData.slug = await generateSlug(validated.title, id);
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
        data: updateData,
        include: {
          author: true
        }
      });

      if (newPublicId && oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      return res.status(200).json({
        success: true,
        message: 'Blog updated successfully',
        blog: mapBlogResponse(updatedBlog)
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
