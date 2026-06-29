const riskRank = {
  높음: 3,
  중간: 2,
  낮음: 1,
};

export default function IncidentList({ incidents, selectedId, onSelect }) {
  const sortedIncidents = [...incidents].sort(
    (a, b) => (riskRank[b.risk_level] || 0) - (riskRank[a.risk_level] || 0)
  );

  return (
    <div className="incident-list">
      {sortedIncidents.map((incident) => (
        <button
          className={`incident-item ${selectedId === incident.id ? 'is-active' : ''}`}
          type="button"
          key={incident.id}
          onClick={() => onSelect(incident.id)}
        >
          <span className={`risk-pill risk-${incident.risk_level}`}>{incident.risk_level}</span>
          <strong>{incident.address}</strong>
          <small>{incident.fire_floor} / {incident.status}</small>
        </button>
      ))}
    </div>
  );
}
