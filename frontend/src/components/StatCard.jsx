export default function StatCard({ value, label }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
