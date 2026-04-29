import UsageLog from "../models/UsageLog.js";
import Billing from "../models/Billing.js";
import User from "../models/User.js";

const PRICING = {
  free: {
    freeLimit: 100,
    pricePerHundred: 0,
  },
  pro: {
    freeLimit: 5,
    pricePer10: 0.5, // ₹0.5 per 100 requests
  },
};

export const calculateBilling = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Count requests this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalRequests = await UsageLog.countDocuments({
      userId,
      timestamp: { $gte: monthStart },
    });

    const pricing = PRICING[user.plan] || PRICING.free;
    const billableRequests = Math.max(0, totalRequests - pricing.freeLimit);
    const amount = user.plan === "pro" ? (billableRequests / 10) * 0.5 : 0;

    // Update or create billing record
    const billing = await Billing.findOneAndUpdate(
      { userId, period },
      {
        userId,
        period,
        totalRequests,
        freeRequests: pricing.freeLimit,
        billableRequests,
        amount: parseFloat(amount.toFixed(2)),
        plan: user.plan,
      },
      { upsert: true, new: true },
    );

    return billing;
  } catch (error) {
    console.error("Billing calculation error:", error.message);
    throw error;
  }
};

export const getBillingHistory = async (userId) => {
  return await Billing.find({ userId }).sort({ createdAt: -1 }).limit(12);
};
