import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const userController = new UserController();

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Protected routes
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.put('/me/settings', authenticate, userController.updateSettings);
router.put('/me/password', authenticate, userController.changePassword);

export default router;
