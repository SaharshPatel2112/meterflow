import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === "admin";

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/apis", label: "My APIs", icon: "🔌" },
    ...(!isAdmin ? [{ to: "/billing", label: "Billing", icon: "💳" }] : []),
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
