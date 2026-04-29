import UsageLog from "../models/UsageLog.js";
import ApiKey from "../models/ApiKey.js";
import Api from "../models/Api.js";

// Get all usage logs for logged in user
export const getUsageLogs = async (req, res) => {
  try {
    const logs = await UsageLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(100)
      .populate("apiId", "name")
      .populate("apiKeyId", "name key");

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get usage stats summary for dashboard
export const getUsageStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total requests
    const totalRequests = await UsageLog.countDocuments({ userId });

    // Total requests today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const requestsToday = await UsageLog.countDocuments({
      userId,
      timestamp: { $gte: todayStart },
    });

    // Total errors (4xx and 5xx)
    const totalErrors = await UsageLog.countDocuments({
      userId,
      statusCode: { $gte: 400 },
    });

    // Average latency
    const latencyData = await UsageLog.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgLatency: { $avg: "$latency" } } },
    ]);
    const avgLatency = latencyData[0]?.avgLatency?.toFixed(0) || 0;

    // Active API keys count
    const activeKeys = await ApiKey.countDocuments({
      userId,
      status: "active",
    });

    // Total APIs
    const totalApis = await Api.countDocuments({ userId });

    res.status(200).json({
      stats: {
        totalRequests,
        requestsToday,
        totalErrors,
        avgLatency: Number(avgLatency),
        activeKeys,
        totalApis,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get requests per day (last 7 days) — for chart
export const getRequestsChart = async (req, res) => {
  try {
    const userId = req.user._id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await UsageLog.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
          errors: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0],
            },
          },
          avgLatency: { $avg: "$latency" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Format for chart
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

// Get usage per API key
export const getUsageByKey = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await UsageLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$apiKeyId",
          totalRequests: { $sum: 1 },
          errors: {
            $sum: {
              $cond: [{ $gte: ["$statusCode", 400] }, 1, 0],
            },
          },
          avgLatency: { $avg: "$latency" },
        },
      },
    ]);

    // Populate key names
    const populated = await Promise.all(
      data.map(async (d) => {
        const key = await ApiKey.findById(d._id).select("name key status");
        return {
          keyId: d._id,
          keyName: key?.name || "Unknown",
          keyPreview: key?.key?.slice(0, 12) + "..." || "",
          status: key?.status || "unknown",
          totalRequests: d.totalRequests,
          errors: d.errors,
          avgLatency: Math.round(d.avgLatency),
        };
      }),
    );

    res.status(200).json({ usageByKey: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
