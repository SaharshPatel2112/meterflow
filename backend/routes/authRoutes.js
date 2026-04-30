import express from "express";
import {
  signup,
  login,
  refreshToken,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  signup,
  login,
  refreshToken,
  getMe,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
