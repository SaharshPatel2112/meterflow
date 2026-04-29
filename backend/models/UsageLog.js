import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema(
  {
    apiKeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
    },
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Api",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    latency: {
      type: Number, // in milliseconds
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

// Index for fast queries
usageLogSchema.index({ userId: 1, timestamp: -1 });
usageLogSchema.index({ apiKeyId: 1, timestamp: -1 });

const UsageLog = mongoose.model("UsageLog", usageLogSchema);
export default UsageLog;
