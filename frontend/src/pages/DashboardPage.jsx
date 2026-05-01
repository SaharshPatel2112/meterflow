import "./DashboardPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import useAuthStore from "../store/authStore";
import {
  getUsageStats,
  getUsageChart,
  getUsageLogs,
  getCurrentBilling,
} from "../services/api";

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/login");
    if (user?.role === "admin") return navigate("/admin");
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, chartRes, logsRes, billingRes] = await Promise.all([
        getUsageStats(),
        getUsageChart(),
        getUsageLogs(),
        getCurrentBilling(),
      ]);
      setStats(statsRes.data.stats);
      setChartData(chartRes.data.chartData);
      setLogs(logsRes.data.logs);
      setBilling(billingRes.data.billing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <h2 className="dashboard-title">Dashboard</h2>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              title="Total Requests"
              value={stats?.totalRequests ?? 0}
              color="blue"
            />
            <StatCard
              title="Today"
              value={stats?.requestsToday ?? 0}
              color="green"
            />
            <StatCard
              title="Errors"
              value={stats?.totalErrors ?? 0}
              color="red"
            />
            <StatCard
              title="Avg Latency"
              value={`${stats?.avgLatency ?? 0}ms`}
              color="yellow"
            />
            <StatCard
              title="Active Keys"
              value={stats?.activeKeys ?? 0}
              color="purple"
            />
            <StatCard
              title="Total APIs"
              value={stats?.totalApis ?? 0}
              color="blue"
            />
          </div>

          {/* Chart + Billing */}
          <div className="middle-grid">
            <div className="card">
              <h3 className="card-title">Requests — Last 7 Days</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">
                  No data yet — hit the gateway to see charts
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="card-title">Current Billing</h3>
              {billing ? (
                <>
                  <div className="billing-row">
                    <span className="billing-label">Plan</span>
                    <span className="billing-value plan">{billing.plan}</span>
                  </div>
                  <div className="billing-row">
                    <span className="billing-label">Period</span>
                    <span className="billing-value">{billing.period}</span>
                  </div>
                  <div className="billing-row">
                    <span className="billing-label">Total Requests</span>
                    <span className="billing-value">
                      {billing.totalRequests}
                    </span>
                  </div>
                  <div className="billing-row">
                    <span className="billing-label">Free Requests</span>
                    <span className="billing-value free">
                      {billing.freeRequests}
                    </span>
                  </div>
                  <div className="billing-row">
                    <span className="billing-label">Billable</span>
                    <span className="billing-value yellow">
                      {billing.billableRequests}
                    </span>
                  </div>
                  <hr className="billing-divider" />
                  <div className="billing-amount-row">
                    <span className="billing-amount-label">Amount Due</span>
                    <span className="billing-amount">₹{billing.amount}</span>
                  </div>
                  <div className={`billing-status ${billing.status}`}>
                    {billing.status.toUpperCase()}
                  </div>
                </>
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                  No billing data yet
                </p>
              )}
            </div>
          </div>

          {/* Logs */}
          <div className="card">
            <div className="logs-header">
              <h3 className="card-title" style={{ margin: 0 }}>
                Recent Requests
              </h3>
              {logs.length > 3 && (
                <button
                  className="btn-see-more"
                  onClick={() => setShowAllLogs(true)}
                >
                  See All ({logs.length})
                </button>
              )}
            </div>

            {logs.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>API</th>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Latency</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 3).map((log) => (
                      <tr key={log._id}>
                        <td className="log-api">{log.apiId?.name || "N/A"}</td>
                        <td className="log-ep">{log.endpoint}</td>
                        <td>
                          <span className="log-method">{log.method}</span>
                        </td>
                        <td>
                          <span
                            className={
                              log.statusCode < 400
                                ? "log-status-ok"
                                : "log-status-err"
                            }
                          >
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="log-lat">{log.latency}ms</td>
                        <td className="log-time">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                No requests yet — test your gateway!
              </p>
            )}
          </div>

          {/* All Logs Modal */}
          {showAllLogs && (
            <div
              className="logs-modal-overlay"
              onClick={() => setShowAllLogs(false)}
            >
              <div className="logs-modal" onClick={(e) => e.stopPropagation()}>
                <div className="logs-modal-header">
                  <h3 className="logs-modal-title">
                    All Requests ({logs.length})
                  </h3>
                  <button
                    className="logs-modal-close"
                    onClick={() => setShowAllLogs(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="logs-modal-body">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>API</th>
                        <th>Endpoint</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Latency</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id}>
                          <td className="log-api">
                            {log.apiId?.name || "N/A"}
                          </td>
                          <td className="log-ep">{log.endpoint}</td>
                          <td>
                            <span className="log-method">{log.method}</span>
                          </td>
                          <td>
                            <span
                              className={
                                log.statusCode < 400
                                  ? "log-status-ok"
                                  : "log-status-err"
                              }
                            >
                              {log.statusCode}
                            </span>
                          </td>
                          <td className="log-lat">{log.latency}ms</td>
                          <td className="log-time">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
