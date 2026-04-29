import "./StatCard.css";

export default function StatCard({ title, value, subtitle, color = "blue" }) {
  return (
    <div className="stat-card">
      <p className="stat-card-title">{title}</p>
      <p className={`stat-card-value stat-${color}`}>{value}</p>
      {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
    </div>
  );
}
