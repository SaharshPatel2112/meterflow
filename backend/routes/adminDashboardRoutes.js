import express from "express";
import {
  getAdminStats,
  getAdminChart,
  getAllUsers,
  getAllLogs,
  getRevenueBreakdown,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/chart", getAdminChart);
router.get("/users", getAllUsers);
router.get("/logs", getAllLogs);
router.get("/revenue", getRevenueBreakdown);

export default router;
