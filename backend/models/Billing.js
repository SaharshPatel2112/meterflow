import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String, // "2024-04"
      required: true,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    freeRequests: {
      type: Number,
      default: 1000,
    },
    billableRequests: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number, // in rupees
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Billing = mongoose.model("Billing", billingSchema);
export default Billing;
