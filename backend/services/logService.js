import UsageLog from "../models/UsageLog.js";
import ApiKey from "../models/ApiKey.js";

export const logRequest = async ({
  apiKeyId,
  apiId,
  userId,
  endpoint,
  method,
  statusCode,
  latency,
}) => {
  try {
    // Log the request
    await UsageLog.create({
      apiKeyId,
      apiId,
      userId,
      endpoint,
      method,
      statusCode,
      latency,
    });

    // Update last used + request count on the key
    await ApiKey.findByIdAndUpdate(apiKeyId, {
      $inc: { requestCount: 1 },
      lastUsed: new Date(),
    });
  } catch (error) {
    console.error("Log service error:", error.message);
  }
};
