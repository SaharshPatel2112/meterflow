import express from "express";
import User from "../models/User.js";
import Api from "../models/Api.js";
import ApiKey from "../models/ApiKey.js";
import UsageLog from "../models/UsageLog.js";
import Billing from "../models/Billing.js";

const router = express.Router();

// View all users
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ count: users.length, users });
});

// View all APIs
router.get("/apis", async (req, res) => {
  const apis = await Api.find();
  res.json({ count: apis.length, apis });
});

// View all API keys
router.get("/keys", async (req, res) => {
  const keys = await ApiKey.find();
  res.json({ count: keys.length, keys });
});

// View all usage logs
router.get("/logs", async (req, res) => {
  const logs = await UsageLog.find().sort({ timestamp: -1 }).limit(50);
  res.json({ count: logs.length, logs });
});

// View all billing
router.get("/billing", async (req, res) => {
  const billing = await Billing.find();
  res.json({ count: billing.length, billing });
});

// View everything at once
router.get("/all", async (req, res) => {
  const [users, apis, keys, logs, billing] = await Promise.all([
    User.find().select("-password"),
    Api.find(),
    ApiKey.find(),
    UsageLog.find().sort({ timestamp: -1 }).limit(20),
    Billing.find(),
  ]);
  res.json({ users, apis, keys, logs, billing });
});

export default router;
