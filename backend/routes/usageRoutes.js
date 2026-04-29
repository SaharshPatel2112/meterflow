import express from 'express';
import {
  getUsageLogs,
  getUsageStats,
  getRequestsChart,
  getUsageByKey,
} from '../controllers/usageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/logs', getUsageLogs);
router.get('/stats', getUsageStats);
router.get('/chart', getRequestsChart);
router.get('/by-key', getUsageByKey);

export default router;