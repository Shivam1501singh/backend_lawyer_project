import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';

import userAuthRoutes from './routes/user.auth.routes.js';
import advocateAuthRoutes from './routes/advocate.auth.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import advocateProfileRoutes from './routes/advocate.profile.routes.js';
import { helpRouter, adminHelpRouter } from './routes/help.routes.js';
import advocateRoutes from './routes/advocate.routes.js';
import practiceAreaRoutes from './routes/practiceArea.routes.js';
import courtRoutes from './routes/court.routes.js';
import savedLawyerRoutes from './routes/savedLawyer.routes.js';
import blogRoutes from './routes/blog.routes.js';
import adminRoutes from './routes/admin.routes.js';
import ipcRoutes from './routes/ipc.routes.js';
import bnsRoutes from './routes/bns.routes.js';
import userRightRoutes from './routes/userRight.routes.js';
import guideRoutes from './routes/guide.routes.js';
import updateRoutes from './routes/update.routes.js';
import advocateResetRoutes from './routes/advocateReset.routes.js';
import bearerActRoutes from './routes/bearerAct.routes.js';
import userRoutes from './routes/user.routes.js';
import advocateDeletionRoutes from './routes/advocate.deletion.routes.js';
import advocateStatusRoutes from './routes/advocate.status.routes.js';
import { userConsultancyRouter, adminConsultancyRouter } from './routes/consultancy.routes.js';
import { startAccountDeletionJob } from './services/accountDeletionJob.service.js';


import { requireAuth, requireRole } from './middleware/auth.middleware.js';
import { generalLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { getCurrentUser, logout as userLogout } from './controllers/user.auth.controller.js';
import { logout as advocateLogout } from './controllers/advocate.auth.controller.js';
import { getUserLikedAdvocates } from './controllers/advocateLike.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
// const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
// app.use(cors({
//   origin: clientUrl,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
// }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://vakeel-setu-seven.vercel.app',
    process.env.WEB_CLIENT_URL,
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// Parsers
app.use(express.json());
app.use(cookieParser());

// Passport init
app.use(passport.initialize());

// General Rate Limiting
app.use(generalLimiter);

// API Status health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Auth Routes Mounting
app.use('/api/admin', adminRoutes);
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/auth/advocate', advocateAuthRoutes);
app.use('/api/auth', oauthRoutes); // mounts google auth callback routes
app.use('/auth', oauthRoutes); // supports non-prefixed /auth routes for mobile clients
app.use('/api/advocate/profile', advocateProfileRoutes);
app.use('/api/help', helpRouter);
app.use('/api/admin/help', adminHelpRouter);
app.use('/api/advocates', advocateRoutes);
app.use('/api/practice-areas', practiceAreaRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/saved-lawyers', savedLawyerRoutes);
app.use('/', blogRoutes);
app.use('/', ipcRoutes);
app.use('/', bnsRoutes);
app.use('/', userRightRoutes);
app.use('/', guideRoutes);
app.use('/', updateRoutes);
app.use('/', advocateResetRoutes);
app.use('/', bearerActRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/consultancy', userConsultancyRouter);
app.use('/api/admin/consultancy', adminConsultancyRouter);
app.use('/api/advocate', advocateDeletionRoutes);
app.use('/api/advocate', advocateStatusRoutes);



// User Liked Advocates Endpoint
app.get('/api/user/liked-advocates', requireAuth, requireRole('USER'), getUserLikedAdvocates);

// Common protected authentication endpoints
app.get('/api/auth/me', requireAuth, getCurrentUser);
app.post('/api/auth/logout', requireAuth, userLogout);
app.post('/api/user/logout', requireAuth, userLogout);
app.post('/api/advocate/logout', requireAuth, advocateLogout);

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler Middleware
app.use(errorHandler);


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  startAccountDeletionJob();
});

export default app;
