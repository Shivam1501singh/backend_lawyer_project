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

import { requireAuth } from './middleware/auth.middleware.js';
import { generalLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { getCurrentUser, logout } from './controllers/user.auth.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
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
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/auth/advocate', advocateAuthRoutes);
app.use('/api/auth', oauthRoutes); // mounts google auth callback routes
app.use('/api/advocate/profile', advocateProfileRoutes);
app.use('/api/help', helpRouter);
app.use('/api/admin/help', adminHelpRouter);
app.use('/api/advocates', advocateRoutes);
app.use('/api/practice-areas', practiceAreaRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/saved-lawyers', savedLawyerRoutes);

// Common protected authentication endpoints
app.get('/api/auth/me', requireAuth, getCurrentUser);
app.post('/api/auth/logout', requireAuth, logout);

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
