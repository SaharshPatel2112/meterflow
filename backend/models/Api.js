import mongoose from "mongoose";

const apiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "API name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    baseUrl: {
      type: String,
      required: [true, "Base URL is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Api = mongoose.model("Api", apiSchema);
export default Api;
