import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data);

// Admin
export const getAdminStats = () => API.get("/admin/stats");
export const getAdminChart = () => API.get("/admin/chart");
export const getAdminUsers = () => API.get("/admin/users");
export const getAdminLogs = () => API.get("/admin/logs");
export const getAdminRevenue = () => API.get("/admin/revenue");

// APIs
export const getMyApis = () => API.get("/apis");
export const createApi = (data) => API.post("/apis", data);
export const deleteApi = (id) => API.delete(`/apis/${id}`);
export const generateKey = (id, data) => API.post(`/apis/${id}/keys`, data);
export const revokeKey = (keyId) => API.patch(`/apis/keys/${keyId}/revoke`);
export const rotateKey = (keyId) => API.patch(`/apis/keys/${keyId}/rotate`);

// Usage
export const getUsageStats = () => API.get("/usage/stats");
export const getUsageChart = () => API.get("/usage/chart");
export const getUsageLogs = () => API.get("/usage/logs");
export const getUsageByKey = () => API.get("/usage/by-key");

// Billing
export const getCurrentBilling = () => API.get("/billing/current");
export const getBillingHistory = () => API.get("/billing/history");
export const upgradePlan = (plan) => API.patch("/billing/upgrade", { plan });

// Payment
export const createOrder = (amount) =>
  API.post("/payment/create-order", { amount });
export const verifyPayment = (data) => API.post("/payment/verify", data);
