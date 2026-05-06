// Inspector.jsx — right panel: edit name, price, color, notes for selected area
window.Inspector = function Inspector({ territory, onChange, onClose, onDelete }) {
  if (!territory) {
    return (
      <aside className="fp-inspector empty">
        <div className="fp-inspector-empty">
          <div className="fp-inspector-empty-icon">
            <i data-lucide="map-pin"></i>
          </div>
          <div className="fp-inspector-empty-title">Pick an area</div>
          <div className="fp-inspector-empty-body">
            Draw a new area with the polygon tool, or tap an existing one on the map to set its price and notes.
          </div>
        </div>
      </aside>
    );
  }

  function update(patch) { onChange({ ...territory, ...patch }); }

  return (
    <aside className="fp-inspector">
      <div className="fp-inspector-head">
        <input
          className="fp-inspector-name"
          placeholder="Area name (e.g. Pelican Landing)"
          value={territory.name || ''}
          onChange={e => update({ name: e.target.value })}
          autoFocus={!territory.name}
        />
        <button className="fp-inspector-close" onClick={onClose} aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>

      <div className="fp-inspector-body">
        <section>
          <div className="fp-section-label">Base price</div>
          <div className="fp-price-row">
            <span className="fp-price-prefix">$</span>
            <input
              className="fp-price-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={territory.price ? Number(territory.price).toLocaleString() : ''}
              onChange={e => {
                const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                update({ price: isNaN(v) ? '' : v });
              }}
            />
          </div>
          <div className="fp-price-meta">Starting estimate for this area.</div>
        </section>

        <section>
          <div className="fp-section-label">Map color</div>
          <div className="fp-color-row">
            {window.DEFAULT_PALETTE.map(c => (
              <button
                key={c}
                className={"fp-color-sw" + (territory.color === c ? " on" : "")}
                style={{ background: c }}
                onClick={() => update({ color: c })}
                title={c}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="fp-section-label">Notes</div>
          <textarea
            className="fp-notes"
            placeholder="HOA quirks, permit office, soil notes, anything that affects the quote…"
            value={territory.notes || ''}
            onChange={e => update({ notes: e.target.value })}
            rows={6}
          />
        </section>

        <section className="fp-inspector-footer">
          <button className="fp-btn fp-btn-danger" onClick={() => {
            if (confirm(`Delete "${territory.name || 'this area'}"?`)) onDelete(territory.id);
          }}>
            <i data-lucide="trash-2"></i> Delete area
          </button>
        </section>
      </div>
    </aside>
  );
};
