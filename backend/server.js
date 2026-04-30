import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import gatewayRoutes from "./routes/gatewayRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import getRedis from "./config/redis.js";
import getRazorpay from "./services/razorpayService.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

const app = express();

connectDB();

const redis = getRedis();
console.log(redis ? "Redis connected" : "Redis not configured");

const razorpay = getRazorpay();
console.log(
  razorpay ? "Razorpay connected" : "Razorpay not configured — check .env keys",
);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/gateway", gatewayRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MeterFlow API running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
