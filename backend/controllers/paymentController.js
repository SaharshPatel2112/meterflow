import getRazorpay from "../services/razorpayService.js";
import crypto from "crypto";
import Billing from "../models/Billing.js";
import { calculateBilling } from "../services/billingService.js";

export const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res
        .status(500)
        .json({ message: "Payment service not configured" });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "No amount due" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay createOrder error:", error);
    res
      .status(500)
      .json({ message: "Order creation failed", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Mark ALL pending billing records as paid
    await Billing.updateMany(
      { userId: req.user._id, status: "pending", amount: { $gt: 0 } },
      { status: "paid", paidAt: new Date(), paymentId: razorpay_payment_id },
    );

    res.status(200).json({
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const billing = await calculateBilling(req.user._id);
    res.status(200).json({ billing });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
