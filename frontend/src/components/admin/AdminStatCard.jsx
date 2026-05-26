function AdminStatCard({ icon, label, value }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </article>
  );
}

export default AdminStatCard;
