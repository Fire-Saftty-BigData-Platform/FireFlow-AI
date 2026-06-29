export default function MapPlaceholder({ label = 'MAP PLACEHOLDER' }) {
  return (
    <section className="map-placeholder" aria-label={label}>
      <div>
        <span>REAL-TIME SPATIAL MAPPING ENGINE</span>
        <strong>{label}</strong>
      </div>
    </section>
  );
}
