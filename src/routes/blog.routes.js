import express from 'express';
import multer from 'multer';
import * as blogController from '../controllers/blog.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Content Creator Login (Public)
router.post('/api/content-creator/login', generalLimiter, blogController.loginContentCreator);

// Blog CRUD
router.post('/api/blogs', requireAuth, generalLimiter, upload.single('image'), blogController.createBlog);
router.get('/api/blogs', generalLimiter, blogController.getBlogs);
router.get('/api/blogs/:id', generalLimiter, blogController.getSingleBlog);
router.put('/api/blogs/:id', requireAuth, generalLimiter, upload.single('image'), blogController.updateBlog);
router.delete('/api/blogs/:id', requireAuth, generalLimiter, blogController.deleteBlog);

export default router;
