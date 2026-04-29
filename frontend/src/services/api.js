import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

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
export const createOrder = (amount) => API.post('/payment/create-order', { amount });
export const verifyPayment = (data) => API.post('/payment/verify', data);