import "./ApisPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useAuthStore from "../store/authStore";
import {
  getMyApis,
  createApi,
  deleteApi,
  generateKey,
  revokeKey,
  rotateKey,
} from "../services/api";

export default function ApisPage() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", baseUrl: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const res = await getMyApis();
      setApis(res.data.apis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createApi(form);
      setForm({ name: "", description: "", baseUrl: "" });
      setShowForm(false);
      fetchApis();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create API");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this API and all its keys?")) return;
    await deleteApi(id);
    fetchApis();
  };

  const handleGenerateKey = async (apiId) => {
    const name = prompt("Key name:", "New Key");
    if (!name) return;
    await generateKey(apiId, { name });
    fetchApis();
  };

  const handleRevoke = async (keyId) => {
    if (!confirm("Revoke this key?")) return;
    await revokeKey(keyId);
    fetchApis();
  };

  const handleRotate = async (keyId) => {
    if (!confirm("Rotate this key? Old key will stop working.")) return;
    await rotateKey(keyId);
    fetchApis();
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    alert("Key copied!");
  };

  return (
    <div className="apis-page">
      <Navbar />
      <div className="apis-layout">
        <Sidebar />
        <div className="apis-content">
          <div className="apis-header">
            <h2 className="apis-title">My APIs</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              + New API
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <h3 className="form-card-title">Create New API</h3>
              {error && <div className="form-error">{error}</div>}
              <form onSubmit={handleCreate} className="create-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>API Name</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Weather API"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Base URL</label>
                    <input
                      className="form-input"
                      placeholder="https://api.example.com"
                      value={form.baseUrl}
                      onChange={(e) =>
                        setForm({ ...form, baseUrl: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    className="form-input"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Create API
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading...</p>
          ) : apis.length === 0 ? (
            <div className="empty-state">
              <p>No APIs yet</p>
              <span>Create your first API to get started</span>
            </div>
          ) : (
            <div className="apis-list">
              {apis.map((api) => (
                <div key={api._id} className="api-card">
                  <div className="api-card-header">
                    <div>
                      <h3 className="api-name">{api.name}</h3>
                      <p className="api-desc">{api.description}</p>
                      <p className="api-url">{api.baseUrl}</p>
                    </div>
                    <div className="api-actions">
                      <button
                        onClick={() => handleGenerateKey(api._id)}
                        className="btn-secondary"
                      >
                        + New Key
                      </button>
                      <button
                        onClick={() => handleDelete(api._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="keys-label">
                    API Keys ({api.keys?.length || 0})
                  </p>
                  <div className="keys-list">
                    {api.keys?.map((k) => (
                      <div key={k._id} className="key-row">
                        <div className="key-left">
                          <span
                            className={
                              k.status === "active"
                                ? "badge-active"
                                : "badge-revoked"
                            }
                          >
                            {k.status}
                          </span>
                          <span className="key-value">
                            {k.key.slice(0, 20)}...
                          </span>
                          <span className="key-name">{k.name}</span>
                        </div>
                        <div className="key-right">
                          <span className="key-count">
                            {k.requestCount} reqs
                          </span>
                          <button
                            onClick={() => copyKey(k.key)}
                            className="key-btn-copy"
                          >
                            Copy
                          </button>
                          {k.status === "active" && (
                            <>
                              <button
                                onClick={() => handleRevoke(k._id)}
                                className="key-btn-revoke"
                              >
                                Revoke
                              </button>
                              <button
                                onClick={() => handleRotate(k._id)}
                                className="key-btn-rotate"
                              >
                                Rotate
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
