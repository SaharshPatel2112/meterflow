import express from "express";
import {
  createApi,
  getMyApis,
  getApiById,
  deleteApi,
  generateKey,
  revokeKey,
  rotateKey,
} from "../controllers/apiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/", createApi);
router.get("/", getMyApis);
router.get("/:id", getApiById);
router.delete("/:id", deleteApi);

router.post("/:id/keys", generateKey);
router.patch("/keys/:keyId/revoke", revokeKey);
router.patch("/keys/:keyId/rotate", rotateKey);

export default router;
