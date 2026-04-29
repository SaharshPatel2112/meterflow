import {
  calculateBilling,
  getBillingHistory,
} from "../services/billingService.js";
import User from "../models/User.js";

export const getCurrentBilling = async (req, res) => {
  try {
    const billing = await calculateBilling(req.user._id);
    res.status(200).json({ billing });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBillingHistoryController = async (req, res) => {
  try {
    const history = await getBillingHistory(req.user._id);
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["free", "pro"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: `Plan upgraded to ${plan}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
