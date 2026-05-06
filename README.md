# MeterFlow ⚡

A full-stack, usage-based API billing and metering platform for SaaS monetization.

## 🌐 Live Demo

- **Frontend:** https://meterflow-alpha.vercel.app
- **Backend:** https://meterflow-qghd.onrender.com

## 🎯 Features

- **API Gateway** — Proxies requests, validates keys, and forwards traffic to target APIs.
- **Automated Billing Engine** — Enforces usage-based pricing models (Free and Pro tiers) and tracks pending dues.
- **Integrated Payments** — Secure server-side Razorpay order creation and cryptographic signature verification.
- **Usage Analytics** — Real-time dashboards displaying request volumes, error rates, and average latency.
- **Role-Based Access** — Distinct experiences and permissions for Admins, API Owners, and Consumers.
- **Key Management** — Instantly generate, rotate, and revoke cryptographically secure API keys.
- **Rate Limiting** — Sub-millisecond checks and request blocking using Serverless Redis.

## 🛠️ Tech Stack

### Frontend

- React
- Zustand (State Management)
- Tailwind CSS
- Recharts (Analytics)
- React Router v6

### Backend

- Node.js + Express.js
- Custom Gateway Middleware
- MongoDB + Mongoose
- Razorpay SDK

### Infrastructure & Caching

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
- Rate Limiting/Cache → Upstash (Serverless Redis)

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- npm v9+

### Frontend
```bash
cd frontend
npm install
# Create a .env file and add: VITE_API_URL=http://localhost:5000/api
npm run dev
```

### Backend
```bash
cd backend
npm install
# Create a .env file and add your MongoDB, JWT, Upstash, and Razorpay keys
npm run dev
```

## 📁 Project Structure

```
meterflow/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/# Reusable UI components and charts
│   │   ├── pages/     # Dashboard, Billing, Admin, and Profile pages
│   │   ├── store/     # Zustand global state management
│   │   └── styles/    # Per-component CSS files
└── backend/           # Express server and API Gateway
    ├── controllers/   # Business logic for auth, billing, etc.
    ├── middleware/    # Gateway pipeline, rate-limiting, auth checks
    ├── models/        # Mongoose database schemas
    └── routes/        # API endpoint definitions
```
