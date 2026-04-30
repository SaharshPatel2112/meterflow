import "./AdminDashboard.css";
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
import useAuthStore from "../store/authStore";
import {
  getAdminStats,
  getAdminChart,
  getAdminUsers,
  getAdminLogs,
  getAdminRevenue,
} from "../services/api";

export default function AdminDashboard() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!token) return navigate("/login");
    if (user?.role !== "admin") return navigate("/dashboard");
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, chartRes, usersRes, logsRes, revenueRes] =
        await Promise.all([
          getAdminStats(),
          getAdminChart(),
          getAdminUsers(),
          getAdminLogs(),
          getAdminRevenue(),
        ]);
      setStats(statsRes.data.stats);
      setChartData(chartRes.data.chartData);
      setUsers(usersRes.data.users);
      setLogs(logsRes.data.logs);
      setRevenue(revenueRes.data.billings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-page">
      {/* Admin Navbar */}
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-navbar-left">
            <span className="admin-logo">MeterFlow</span>
            <span className="admin-badge">Admin</span>
          </div>
          <div className="admin-navbar-right">
            <span className="admin-nav-user">👤 {user?.name}</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-container">
        {/* Tabs */}
        <div className="admin-tabs">
          {["overview", "users", "logs", "revenue"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Users</p>
                <p className="admin-stat-value blue">
                  {stats?.totalUsers ?? 0}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total APIs</p>
                <p className="admin-stat-value purple">
                  {stats?.totalApis ?? 0}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Requests</p>
                <p className="admin-stat-value blue">
                  {stats?.totalRequests ?? 0}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Requests Today</p>
                <p className="admin-stat-value green">
                  {stats?.requestsToday ?? 0}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Errors</p>
                <p className="admin-stat-value red">
                  {stats?.totalErrors ?? 0}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Avg Latency</p>
                <p className="admin-stat-value yellow">
                  {stats?.avgLatency ?? 0}ms
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Active Keys</p>
                <p className="admin-stat-value purple">
                  {stats?.activeKeys ?? 0}
                </p>
              </div>
              <div className="admin-stat-card highlight">
                <p className="admin-stat-label">Total Revenue</p>
                <p className="admin-stat-value green">
                  ₹{stats?.totalRevenue ?? 0}
                </p>
              </div>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Pending Revenue</p>
                <p className="admin-stat-value yellow">
                  ₹{stats?.pendingRevenue ?? 0}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="admin-card">
              <h3 className="admin-card-title">
                Platform Traffic — Last 7 Days
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
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
                <div className="admin-no-data">No traffic data yet</div>
              )}
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="admin-card">
            <h3 className="admin-card-title">All Users ({users.length})</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>APIs</th>
                    <th>Keys</th>
                    <th>Requests</th>
                    <th>Amount Due</th>
                    <th>Billing</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="td-name">{u.name}</td>
                      <td className="td-email">{u.email}</td>
                      <td>
                        <span className={`plan-badge ${u.plan}`}>{u.plan}</span>
                      </td>
                      <td className="td-num">{u.totalApis}</td>
                      <td className="td-num">{u.activeKeys}</td>
                      <td className="td-num">{u.totalRequests}</td>
                      <td className="td-amount">₹{u.amountDue}</td>
                      <td>
                        <span className={`billing-badge ${u.billingStatus}`}>
                          {u.billingStatus}
                        </span>
                      </td>
                      <td className="td-date">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="admin-no-data">No users yet</p>
              )}
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === "logs" && (
          <div className="admin-card">
            <h3 className="admin-card-title">
              Recent Requests — All Users (last 50)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
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
                      <td className="td-email">{log.userId?.email || "N/A"}</td>
                      <td className="td-name">{log.apiId?.name || "N/A"}</td>
                      <td className="td-ep">{log.endpoint}</td>
                      <td>
                        <span className="method-badge">{log.method}</span>
                      </td>
                      <td>
                        <span
                          className={
                            log.statusCode < 400 ? "status-ok" : "status-err"
                          }
                        >
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="td-lat">{log.latency}ms</td>
                      <td className="td-date">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <p className="admin-no-data">No logs yet</p>
              )}
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === "revenue" && (
          <div className="admin-card">
            <div className="revenue-summary">
              <div className="revenue-box green">
                <p className="revenue-label">Total Collected</p>
                <p className="revenue-amount">₹{stats?.totalRevenue ?? 0}</p>
              </div>
              <div className="revenue-box yellow">
                <p className="revenue-label">Pending</p>
                <p className="revenue-amount">₹{stats?.pendingRevenue ?? 0}</p>
              </div>
            </div>
            <h3 className="admin-card-title" style={{ marginTop: "1.5rem" }}>
              Billing Records
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Period</th>
                    <th>Plan</th>
                    <th>Requests</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((b) => (
                    <tr key={b._id}>
                      <td className="td-name">{b.userId?.name || "N/A"}</td>
                      <td className="td-email">{b.userId?.email || "N/A"}</td>
                      <td className="td-date">{b.period}</td>
                      <td>
                        <span className={`plan-badge ${b.userId?.plan}`}>
                          {b.userId?.plan}
                        </span>
                      </td>
                      <td className="td-num">{b.totalRequests}</td>
                      <td className="td-amount">₹{b.amount}</td>
                      <td>
                        <span className={`billing-badge ${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {revenue.length === 0 && (
                <p className="admin-no-data">No billing records yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
