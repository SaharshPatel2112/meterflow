import express from "express";
import { gatewayHandler } from "../middleware/gatewayMiddleware.js";

const router = express.Router();

router.all("/", gatewayHandler);
router.all("/:path", gatewayHandler);
router.all("/:path/*splat", gatewayHandler);

export default router;
