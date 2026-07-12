export default function MapPlaceholder({ label = 'MAP PLACEHOLDER', incidents = [], selectedIncident = null }) {
  const visibleIncidents = incidents.slice(0, 4);

  return (
    <section className="map-placeholder" aria-label={label}>
      <div className="map-panel">
        <span>REAL-TIME SPATIAL MAPPING ENGINE</span>
        <strong>{label}</strong>
        {selectedIncident && (
          <p>{selectedIncident.address} / {selectedIncident.fire_floor} / {selectedIncident.risk_level}</p>
        )}
      </div>
      {visibleIncidents.map((incident, index) => (
        <button
          className={`map-pin map-pin-${index + 1} ${selectedIncident?.id === incident.id ? 'is-selected' : ''}`}
          type="button"
          key={incident.id}
          aria-label={`${incident.address} ${incident.risk_level}`}
          title={`${incident.address} / ${incident.risk_level}`}
        >
          {incident.id}
        </button>
      ))}
    </section>
  );
}
