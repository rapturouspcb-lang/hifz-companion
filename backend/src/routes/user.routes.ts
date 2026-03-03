import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();
const userController = new UserController();

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Password Reset routes
router.post('/password-reset/request', userController.requestPasswordReset);
router.post('/password-reset/confirm', userController.resetPassword);

// Email Verification routes
router.post('/verify-email/request', optionalAuth, userController.resendVerification);
router.post('/verify-email/confirm', userController.verifyEmail);

// Protected routes
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.put('/me/settings', authenticate, userController.updateSettings);
router.put('/me/password', authenticate, userController.changePassword);

export default router;
