import "./Navbar.css";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-logo">MeterFlow</span>
          <div className="navbar-right">
            <span className="navbar-user">
              {user?.name} —{" "}
              <span className="navbar-plan">
                {user?.plan ? user.plan : "free"} plan
              </span>
            </span>
            <button onClick={handleLogoutClick} className="navbar-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-text">Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirm(false)}
                className="navbar-logout"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="navbar-logout-confirm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
