import ApiKey from "../models/ApiKey.js";
import Api from "../models/Api.js";
import User from "../models/User.js";
import { checkRateLimit } from "../services/rateLimiter.js";
import { logRequest } from "../services/logService.js";
import https from "https";
import http from "http";
import { URL } from "url";

export const gatewayHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    // Step 1 — Extract API key from header
    const rawKey = req.headers["x-api-key"];

    if (!rawKey) {
      return res.status(401).json({
        error: "Missing API key",
        hint: "Pass your key in x-api-key header",
      });
    }

    // Step 2 — Validate API key in DB
    const apiKey = await ApiKey.findOne({ key: rawKey });

    if (!apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (apiKey.status === "revoked") {
      return res.status(403).json({ error: "API key has been revoked" });
    }

    // Step 3 — Get the API and User
    const api = await Api.findById(apiKey.apiId);
    if (!api || !api.isActive) {
      return res.status(404).json({ error: "API not found or inactive" });
    }

    const user = await User.findById(apiKey.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 4 — Rate limiting
    const rateLimit = await checkRateLimit(apiKey._id.toString(), user.plan);

    res.setHeader("X-RateLimit-Limit", rateLimit.limit);
    res.setHeader("X-RateLimit-Remaining", rateLimit.remaining);

    if (!rateLimit.allowed) {
      const latency = Date.now() - startTime;

      // Still log the blocked request
      logRequest({
        apiKeyId: apiKey._id,
        apiId: api._id,
        userId: user._id,
        endpoint: req.path,
        method: req.method,
        statusCode: 429,
        latency,
      });

      return res.status(429).json({
        error: "Rate limit exceeded",
        plan: user.plan,
        limit: rateLimit.limit,
        hint:
          user.plan === "free"
            ? "Upgrade to Pro for higher limits"
            : "Limit resets every minute",
      });
    }

    // Step 5 — Forward request to actual API
    const targetPath =
      "/" +
      (req.params.path || "") +
      (req.params.splat ? "/" + req.params.splat : "");
    const targetUrl = `${api.baseUrl}${targetPath}`;

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return res
        .status(400)
        .json({ error: "Invalid target URL in API config" });
    }

    // Add query params from original request
    const queryString = new URLSearchParams(req.query).toString();
    if (queryString) parsedUrl.search = queryString;

    const protocol = parsedUrl.protocol === "https:" ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const proxyReq = protocol.request(options, (proxyRes) => {
      let data = "";

      proxyRes.on("data", (chunk) => {
        data += chunk;
      });

      proxyRes.on("end", () => {
        const latency = Date.now() - startTime;
        const statusCode = proxyRes.statusCode;

        // Step 6 — Log request async (don't await)
        logRequest({
          apiKeyId: apiKey._id,
          apiId: api._id,
          userId: user._id,
          endpoint: targetPath,
          method: req.method,
          statusCode,
          latency,
        });

        // Add MeterFlow headers
        res.setHeader("X-MeterFlow-Latency", `${latency}ms`);
        res.setHeader("X-MeterFlow-API", api.name);

        res.status(statusCode);

        try {
          res.json(JSON.parse(data));
        } catch {
          res.send(data);
        }
      });
    });

    proxyReq.on("error", (err) => {
      const latency = Date.now() - startTime;
      logRequest({
        apiKeyId: apiKey._id,
        apiId: api._id,
        userId: user._id,
        endpoint: targetPath,
        method: req.method,
        statusCode: 502,
        latency,
      });
      res.status(502).json({ error: "Gateway error", detail: err.message });
    });

    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }

    proxyReq.end();
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error("Gateway error:", error.message);
    res
      .status(500)
      .json({ error: "Internal gateway error", detail: error.message });
  }
};
