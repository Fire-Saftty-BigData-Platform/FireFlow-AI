export default function ResultCard({ title, children, tone = 'default' }) {
  return (
    <section className={`result-card result-card-${tone}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
