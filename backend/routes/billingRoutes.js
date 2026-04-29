import express from "express";
import {
  getCurrentBilling,
  getBillingHistoryController,
  upgradePlan,
} from "../controllers/billingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/current", getCurrentBilling);
router.get("/history", getBillingHistoryController);
router.patch("/upgrade", upgradePlan);

export default router;
