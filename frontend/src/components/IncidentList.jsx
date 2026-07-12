export default function IncidentList({ incidents, selectedId, onSelect }) {
  if (incidents.length === 0) {
    return <p className="empty-text">표시할 신고가 없습니다.</p>;
  }

  return (
    <div className="incident-list">
      {incidents.map((incident) => (
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
