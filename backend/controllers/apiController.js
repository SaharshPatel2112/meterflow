import Api from "../models/Api.js";
import ApiKey from "../models/ApiKey.js";
import { generateApiKey } from "../utils/generateApiKey.js";

// Create a new API
export const createApi = async (req, res) => {
  try {
    const { name, description, baseUrl } = req.body;

    if (!name || !baseUrl) {
      return res
        .status(400)
        .json({ message: "Name and Base URL are required" });
    }

    const api = await Api.create({
      userId: req.user._id,
      name,
      description,
      baseUrl,
    });

    // Auto-generate first API key on creation
    const key = generateApiKey();
    const apiKey = await ApiKey.create({
      apiId: api._id,
      userId: req.user._id,
      key,
      name: "Default Key",
    });

    res.status(201).json({
      message: "API created successfully",
      api,
      apiKey: {
        id: apiKey._id,
        key: apiKey.key,
        name: apiKey.name,
        status: apiKey.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all APIs for logged in user
export const getMyApis = async (req, res) => {
  try {
    const apis = await Api.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const apisWithKeys = await Promise.all(
      apis.map(async (api) => {
        const keys = await ApiKey.find({ apiId: api._id }).select("-__v");
        return { ...api.toObject(), keys };
      }),
    );

    res.status(200).json({ apis: apisWithKeys });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single API
export const getApiById = async (req, res) => {
  try {
    const api = await Api.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!api) {
      return res.status(404).json({ message: "API not found" });
    }

    const keys = await ApiKey.find({ apiId: api._id }).select("-__v");

    res.status(200).json({ api: { ...api.toObject(), keys } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an API
export const deleteApi = async (req, res) => {
  try {
    const api = await Api.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!api) {
      return res.status(404).json({ message: "API not found" });
    }

    await ApiKey.deleteMany({ apiId: api._id });
    await Api.findByIdAndDelete(api._id);

    res.status(200).json({ message: "API deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate new API key for an API
export const generateKey = async (req, res) => {
  try {
    const { name } = req.body;

    const api = await Api.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!api) {
      return res.status(404).json({ message: "API not found" });
    }

    const key = generateApiKey();
    const apiKey = await ApiKey.create({
      apiId: api._id,
      userId: req.user._id,
      key,
      name: name || "New Key",
    });

    res.status(201).json({
      message: "API key generated successfully",
      apiKey: {
        id: apiKey._id,
        key: apiKey.key,
        name: apiKey.name,
        status: apiKey.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Revoke an API key
export const revokeKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: req.params.keyId,
      userId: req.user._id,
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    if (apiKey.status === "revoked") {
      return res.status(400).json({ message: "Key is already revoked" });
    }

    apiKey.status = "revoked";
    await apiKey.save();

    res.status(200).json({ message: "API key revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Rotate an API key (revoke old, generate new)
export const rotateKey = async (req, res) => {
  try {
    const oldKey = await ApiKey.findOne({
      _id: req.params.keyId,
      userId: req.user._id,
    });

    if (!oldKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    // Revoke old key
    oldKey.status = "revoked";
    await oldKey.save();

    // Generate new key
    const newKeyValue = generateApiKey();
    const newKey = await ApiKey.create({
      apiId: oldKey.apiId,
      userId: req.user._id,
      key: newKeyValue,
      name: oldKey.name + " (Rotated)",
    });

    res.status(201).json({
      message: "API key rotated successfully",
      newApiKey: {
        id: newKey._id,
        key: newKey.key,
        name: newKey.name,
        status: newKey.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
