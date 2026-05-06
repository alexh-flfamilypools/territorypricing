export default function Legend({ territories }) {
  const byColor = new Map();
  for (const t of territories) {
    if (!t.color) continue;
    const arr = byColor.get(t.color) || [];
    if (t.price) arr.push(t.price);
    byColor.set(t.color, arr);
  }
  if (byColor.size === 0) return null;

  const entries = [...byColor.entries()].map(([color, prices]) => {
    const sorted = prices.slice().sort((a, b) => a - b);
    let label = '—';
    if (sorted.length === 1) label = '$' + sorted[0].toLocaleString();
    else if (sorted.length > 1) label = '$' + sorted[0].toLocaleString() + ' – $' + sorted.at(-1).toLocaleString();
    return { color, count: prices.length, label };
  });

  return (
    <div className="fp-legend">
      <div className="fp-legend-head">
        <span>Legend</span>
        <span className="fp-legend-hint">auto-built from your areas</span>
      </div>
      {entries.map(e => (
        <div key={e.color} className="fp-legend-row">
          <span className="fp-legend-sw" style={{ background: e.color }} />
          <span className="fp-legend-name">{e.label}</span>
          <span className="fp-legend-count">{e.count}</span>
        </div>
      ))}
    </div>
  );
}
