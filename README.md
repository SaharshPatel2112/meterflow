# MeterFlow ⚡

A full-stack, usage-based API billing and metering platform for SaaS monetization.

## 🌐 Live Demo

- **Frontend:** https://meterflow-alpha.vercel.app
- **Backend:** https://meterflow-qghd.onrender.com
---

## 🎯 Features

- **API Gateway** — Proxies requests, validates keys, and forwards traffic to target APIs.
- **Automated Billing Engine** — Enforces usage-based pricing models (Free and Pro tiers) and tracks pending dues.
- **Integrated Payments** — Secure server-side Razorpay order creation and cryptographic signature verification.
- **Usage Analytics** — Real-time dashboards displaying request volumes, error rates, and average latency.
- **Role-Based Access** — Distinct experiences and permissions for Admins, API Owners, and Consumers.
- **Key Management** — Instantly generate, rotate, and revoke cryptographically secure API keys.
- **Rate Limiting** — Sub-millisecond checks and request blocking using Serverless Redis.
---

## 💼 Use Cases

MeterFlow is designed for real-world scenarios where API traffic needs to be monitored, controlled, and monetized:

* **SaaS API Monetization:** A startup building a weather or financial data API can use MeterFlow to distribute keys and automatically bill customers based on their usage volume.
* **AI Service Billing:** AI companies offering image generation or text completion can charge users per API call (e.g., ₹1 per 10 requests) without building custom billing logic.
* **Internal API Management:** Large organizations can issue API keys to different internal teams with strict rate limits (e.g., 50 requests/min) to prevent a single service from overloading internal microservices.
* **Developer Sandboxes:** Offer frictionless "Free Tiers" to developers with hard rate limits, automatically prompting them to upgrade to a Pro plan when they exceed their allowance.

---

## 🏭 Industry Value

The API economy is one of the fastest-growing segments in software, with companies generating billions purely from usage-based APIs. MeterFlow directly addresses the complex infrastructure challenges associated with this model by providing:

* **Instant Monetization:** Eliminates the need to manually build payment gateways and invoice calculators.
* **Infrastructure Protection:** The built-in API gateway and Redis-backed rate limiting prevent abuse, DDoS attacks, and server overloads.
* **Observability:** Provides immediate visibility into API performance, error rates, and latency.
* **Architectural Pattern:** Demonstrates the exact Gateway pattern used by enterprise tools like AWS API Gateway, Kong, and Apigee.

---

## 👥 Roles & Access Levels

MeterFlow features a secure, multi-tenant architecture with three distinct user roles:

### 🔴 Admin (Platform Owner)
* Accesses a secure, isolated Admin Dashboard.
* Monitors platform-wide traffic, total registered users, and system health.
* Tracks aggregated revenue (collected vs. pending) and views complete, cross-user request logs.

### 🟡 API Owner (Developer)
* The primary user of the platform.
* Registers target APIs and generates, rotates, or revokes secure API keys.
* Accesses personalized analytics (request volume, error rates, latency).
* Manages billing plans and pays outstanding invoices via Razorpay.

### 🟢 Consumer (End User)
* The client application or developer using the provided API keys.
* Routes requests through the MeterFlow Gateway.
* Subject to rate limits, receiving `429 Too Many Requests` when exceeding plan allowances.

---

## 📊 Flow Charts

### 1. The API Gateway Pipeline
How an incoming request is processed in real-time without adding significant latency:
```text
Client Request  →  [ x-api-key: mf_abc123... ]
       │
       ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Key Validation: Check MongoDB for key status        │
 │    (Active / Revoked / Not Found)                      │
 ├────────────────────────────────────────────────────────┤
 │ 2. Rate Limiting: Check Upstash Redis counter          │
 │    (Free: 10/day | Pro: 50/min) → Blocks with 429     │
 ├────────────────────────────────────────────────────────┤
 │ 3. Async Logging: Fire-and-forget log to MongoDB       │
 │    (Records latency, status code, endpoint)            │
 ├────────────────────────────────────────────────────────┤
 │ 4. Forwarding: Route to Target API & return response   │
 └────────────────────────────────────────────────────────┘
       │
       ▼
Target API Server (e.g., your microservice)
```
### 2. Automated Billing Flow
How usage is converted into revenue:
```text
End of Billing Cycle
       │
       ▼
1. Aggregate total requests logged in MongoDB for the user
2. Subtract 'Free Tier' allowance (e.g., 10 requests)
3. Calculate billable amount (e.g., Billable Requests / 10 * ₹1)
4. Generate pending invoice
       │
       ▼
User clicks "Pay Now" on Dashboard
       │
       ▼
1. Backend creates secure Razorpay Order
2. Frontend opens Razorpay Checkout UI
3. User completes payment
4. Backend verifies HMAC-SHA256 Cryptographic Signature
5. Invoice marked as 'Paid', UI updates instantly

```

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
