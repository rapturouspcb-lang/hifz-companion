import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
const analyticsController = new AnalyticsController();

// User analytics (authenticated)
router.get('/user', authenticate, analyticsController.getUserAnalytics);

// App-wide analytics (admin only)
router.get('/app', authenticate, requireAdmin, analyticsController.getAppAnalytics);

export default router;
