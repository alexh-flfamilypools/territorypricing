export default function Legend({ territories }) {
  const visible = territories.filter(t => t.name || t.price);
  if (visible.length === 0) return null;

  return (
    <div className="fp-legend">
      <div className="fp-legend-head">
        <span>Legend</span>
      </div>
      {visible.map(t => (
        <div key={t.id} className="fp-legend-row">
          <span className="fp-legend-sw" style={{ background: t.color }} />
          <span className="fp-legend-name">{t.name || 'Unnamed'}</span>
          {t.price && <span className="fp-legend-price">${Number(t.price).toLocaleString()}</span>}
        </div>
      ))}
    </div>
  );
}
