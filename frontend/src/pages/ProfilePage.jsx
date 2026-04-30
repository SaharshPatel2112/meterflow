import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useAuthStore from "../store/authStore";
import { updateProfile } from "../services/api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await updateProfile(form);
      setAuth(res.data.user, token);
      setMessage("Profile updated successfully!");
      setForm({ ...form, currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-layout">
        <Sidebar />
        <div className="profile-content">
          <h2 className="profile-title">My Profile</h2>

          <div className="profile-card">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.name}</p>
              <p className="profile-email">{user?.email}</p>
              <span className="profile-plan">{user?.plan} plan</span>
            </div>
          </div>

          <div className="profile-form-card">
            <h3 className="profile-form-title">Update Profile</h3>

            {message && <div className="profile-success">{message}</div>}
            {error && <div className="profile-error">{error}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Display Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <hr className="profile-divider" />
              <p className="profile-section-label">
                Change Password (optional)
              </p>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  placeholder="Min 6 characters"
                />
              </div>

              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
