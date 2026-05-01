import User from "../models/User.js";
import Api from "../models/Api.js";
import ApiKey from "../models/ApiKey.js";
import UsageLog from "../models/UsageLog.js";
import Billing from "../models/Billing.js";

// Overall platform stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalApis = await Api.countDocuments();
    const totalRequests = await UsageLog.countDocuments();
    const totalErrors = await UsageLog.countDocuments({
      statusCode: { $gte: 400 },
    });
    const activeKeys = await ApiKey.countDocuments({ status: "active" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const requestsToday = await UsageLog.countDocuments({
      timestamp: { $gte: todayStart },
    });

    const latencyData = await UsageLog.aggregate([
      { $group: { _id: null, avgLatency: { $avg: "$latency" } } },
    ]);
    const avgLatency = latencyData[0]?.avgLatency?.toFixed(0) || 0;

    // Total revenue from all paid billings
    const revenueData = await Billing.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData[0]?.total?.toFixed(2) || 0;

    // Pending revenue
    const pendingData = await Billing.aggregate([
      { $match: { status: "pending", amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingRevenue = pendingData[0]?.total?.toFixed(2) || 0;

    res.status(200).json({
      stats: {
        totalUsers,
        totalApis,
        totalRequests,
        totalErrors,
        activeKeys,
        requestsToday,
        avgLatency: Number(avgLatency),
        totalRevenue: Number(totalRevenue),
        pendingRevenue: Number(pendingRevenue),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Chart data — all users combined last 7 days
export const getAdminChart = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await UsageLog.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
          },
          avgLatency: { $avg: "$latency" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const chartData = data.map((d) => ({
      date: `${d._id.day}/${d._id.month}`,
      requests: d.count,
      errors: d.errors,
      avgLatency: Math.round(d.avgLatency),
    }));

    res.status(200).json({ chartData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// All users list with their usage
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalRequests = await UsageLog.countDocuments({
          userId: user._id,
        });
        const totalApis = await Api.countDocuments({ userId: user._id });
        const activeKeys = await ApiKey.countDocuments({
          userId: user._id,
          status: "active",
        });
        const billings = await Billing.find({
          userId: user._id,
          status: "pending",
          amount: { $gt: 0 },
        });
        const totalDue = billings.reduce((sum, b) => sum + b.amount, 0);

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role,
          createdAt: user.createdAt,
          totalRequests,
          totalApis,
          activeKeys,
          amountDue: parseFloat(totalDue.toFixed(2)),
          billingStatus: billings.length > 0 ? "pending" : "clear",
        };
      }),
    );

    res.status(200).json({ users: usersWithStats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// All recent logs across all users
export const getAllLogs = async (req, res) => {
  try {
    const logs = await UsageLog.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("apiId", "name")
      .populate("userId", "name email");

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Revenue breakdown
export const getRevenueBreakdown = async (req, res) => {
  try {
    const billings = await Billing.find({ amount: { $gt: 0 } })
      .populate("userId", "name email plan")
      .sort({ createdAt: -1 });

    res.status(200).json({ billings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
