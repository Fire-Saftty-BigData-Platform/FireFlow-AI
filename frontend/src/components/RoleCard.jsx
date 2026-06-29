export default function RoleCard({ label, mode, description, onClick }) {
  return (
    <button className="role-card" type="button" onClick={onClick}>
      <span className="mode-badge">{mode}</span>
      <strong>{label}</strong>
      <p>{description}</p>
      <span className="card-action">INITIALIZE MODE</span>
    </button>
  );
}
