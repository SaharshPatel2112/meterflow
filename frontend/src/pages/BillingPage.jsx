import "./BillingPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useAuthStore from "../store/authStore";
import {
  getCurrentBilling,
  getBillingHistory,
  upgradePlan,
} from "../services/api";
import { createOrder, verifyPayment } from "../services/api";

export default function BillingPage() {
  const { token, user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billingRes, historyRes] = await Promise.all([
        getCurrentBilling(),
        getBillingHistory(),
      ]);
      setBilling(billingRes.data.billing);
      setHistory(historyRes.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setUpgrading(true);
    try {
      const res = await upgradePlan(plan);
      setAuth(res.data.user, token);
      fetchData();
      alert(`Plan changed to ${plan}!`);
    } catch {
      alert("Failed to change plan");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading billing...</div>;
  }

  const handlePayment = async (totalDue) => {
    if (!totalDue || totalDue <= 0) {
      alert("No pending amount due!");
      return;
    }

    try {
      const res = await createOrder(totalDue);
      const { orderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "MeterFlow",
        description: "Total pending dues",
        order_id: orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("Payment successful!");
            fetchData();
          } catch {
            alert("Payment verification failed");
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed: " + error.message);
    }
  };

  return (
    <div className="billing-page">
      <Navbar />
      <div className="billing-layout">
        <Sidebar />
        <div className="billing-content">
          <h2 className="billing-page-title">Billing</h2>

          {/* Plans */}
          <div className="plans-grid">
            <div
              className={`plan-card ${user?.plan === "free" ? "active-plan" : ""}`}
            >
              <div className="plan-header">
                <div>
                  <h3 className="plan-name">Free</h3>
                  <p className="plan-tagline">For testing & small projects</p>
                </div>
                <span className="plan-price">₹0</span>
              </div>
              <ul className="plan-features">
                <li>
                  <span className="check">✓</span> 10 requests/day
                </li>
                <li>
                  <span className="check">✓</span> Basic analytics
                </li>
                <li>
                  <span className="check">✓</span> API key management
                </li>
              </ul>
              {user?.plan === "free" ? (
                <button className="btn-plan-secondary" disabled>
                  Current Plan
                </button>
              ) : (
                <button
                  className="btn-plan-secondary"
                  onClick={() => handleUpgrade("free")}
                  disabled={upgrading}
                >
                  Downgrade to Free
                </button>
              )}
            </div>

            <div
              className={`plan-card ${user?.plan === "pro" ? "active-plan" : ""}`}
            >
              <div className="plan-header">
                <div>
                  <h3 className="plan-name">Pro</h3>
                  <p className="plan-tagline">For production apps</p>
                </div>
                <div>
                  <span className="plan-price">₹1</span>
                  <span className="plan-price-note">per 10 req</span>
                </div>
              </div>
              <ul className="plan-features">
                <li>
                  <span className="check">✓</span> 10 free + ₹1/10 after
                </li>
                <li>
                  <span className="check">✓</span> 50 req/min rate limit
                </li>
                <li>
                  <span className="check">✓</span> Advanced analytics
                </li>
                <li>
                  <span className="check">✓</span> Priority support
                </li>
              </ul>
              {user?.plan === "pro" ? (
                <button className="btn-plan-primary" disabled>
                  Current Plan
                </button>
              ) : (
                <button
                  className="btn-plan-primary"
                  onClick={() => handleUpgrade("pro")}
                  disabled={upgrading}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {billing && (
            <div className="current-billing-card">
              <h3 className="current-billing-title">
                Current Period — {billing.period}
              </h3>
              <div className="billing-stats-grid">
                <div>
                  <p className="billing-stat-label">Total Requests</p>
                  <p className="billing-stat-val">{billing.totalRequests}</p>
                </div>
                <div>
                  <p className="billing-stat-label">Free Requests</p>
                  <p className="billing-stat-val green">
                    {billing.freeRequests}
                  </p>
                </div>
                <div>
                  <p className="billing-stat-label">Billable Requests</p>
                  <p className="billing-stat-val yellow">
                    {billing.billableRequests}
                  </p>
                </div>
                <div>
                  <p className="billing-stat-label">This Month</p>
                  <p className="billing-stat-val">₹{billing.amount}</p>
                </div>
              </div>

              {/* Total Due Till Date */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#0f172a",
                  borderRadius: "0.5rem",
                  border: "1px solid #334155",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Total Due Till Date
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#ffffff",
                    }}
                  >
                    ₹
                    {history
                      .filter((h) => h.status === "pending" && h.amount > 0)
                      .reduce((sum, h) => sum + h.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    textAlign: "right",
                  }}
                >
                  {
                    history.filter(
                      (h) => h.status === "pending" && h.amount > 0,
                    ).length
                  }{" "}
                  unpaid period(s)
                </div>
              </div>

              {/* Pay Section */}
              {(() => {
                const totalDue = history
                  .filter((h) => h.status === "pending" && h.amount > 0)
                  .reduce((sum, h) => sum + h.amount, 0);

                if (totalDue <= 0) {
                  return (
                    <div className="payment-success">
                      <span>✓</span>
                      <span>No pending dues — you're all clear!</span>
                    </div>
                  );
                }

                return (
                  <div className="pay-section">
                    <div className="pay-section-label">
                      <span className="pay-section-title">
                        Total due till date
                      </span>
                      <span className="pay-section-amount">
                        ₹{totalDue.toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="btn-pay"
                      onClick={() => handlePayment(totalDue)}
                    >
                      <span>💳</span>
                      <span>Pay ₹{totalDue.toFixed(2)} Now</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* History */}
          <div className="history-card">
            <h3 className="history-title">Billing History</h3>
            {history.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                No billing history yet
              </p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Requests</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id}>
                      <td>{h.period}</td>
                      <td>{h.totalRequests}</td>
                      <td className="history-amount">₹{h.amount}</td>
                      <td>
                        <span
                          className={
                            h.status === "paid"
                              ? "status-paid"
                              : "status-pending"
                          }
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
