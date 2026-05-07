import { MapPin, X, Trash2 } from 'lucide-react';
import { DEFAULT_PALETTE } from '../data/territory-data.js';

export default function Inspector({ territory, onChange, onClose, onDelete, isEditor }) {
  if (!territory) {
    return (
      <aside className="fp-inspector empty">
        <div className="fp-inspector-empty">
          <div className="fp-inspector-empty-icon"><MapPin /></div>
          <div className="fp-inspector-empty-title">Pick an area</div>
          <div className="fp-inspector-empty-body">
            {isEditor
              ? 'Draw a new area with the polygon tool, or click an existing one to set its price and notes.'
              : 'Click an area on the map to view its pricing and notes.'}
          </div>
        </div>
      </aside>
    );
  }

  function update(patch) { if (onChange) onChange({ ...territory, ...patch }); }

  return (
    <aside className="fp-inspector">
      <div className="fp-inspector-head">
        {isEditor ? (
          <input
            className="fp-inspector-name"
            placeholder="Area name (e.g. Pelican Landing)"
            value={territory.name || ''}
            onChange={e => update({ name: e.target.value })}
            autoFocus={!territory.name}
          />
        ) : (
          <div className="fp-inspector-name-view">{territory.name || 'Untitled area'}</div>
        )}
        <button className="fp-inspector-close" onClick={onClose} aria-label="Close"><X /></button>
      </div>

      <div className="fp-inspector-body">
        <section>
          <div className="fp-section-label">Base price</div>
          {isEditor ? (
            <>
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
            </>
          ) : (
            <div className="fp-price-view">
              {territory.price
                ? <div className="fp-price-display">${Number(territory.price).toLocaleString()}</div>
                : <div style={{ color: 'var(--fg-4)', fontSize: '15px', padding: '4px 0' }}>No price set</div>}
              <div className="fp-price-meta">Starting estimate for this area.</div>
            </div>
          )}
        </section>

        {isEditor && (
          <section>
            <div className="fp-section-label">Map color</div>
            <div className="fp-color-row">
              {DEFAULT_PALETTE.map(c => (
                <button
                  key={c}
                  className={'fp-color-sw' + (territory.color === c ? ' on' : '')}
                  style={{ background: c }}
                  onClick={() => update({ color: c })}
                  title={c}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="fp-section-label">Notes</div>
          {isEditor ? (
            <textarea
              className="fp-notes"
              placeholder="HOA quirks, permit office, soil notes, anything that affects the quote…"
              value={territory.notes || ''}
              onChange={e => update({ notes: e.target.value })}
              rows={6}
            />
          ) : (
            <div className="fp-notes-view">
              {territory.notes || <span style={{ color: 'var(--fg-4)' }}>No notes.</span>}
            </div>
          )}
        </section>

        {isEditor && (
          <section className="fp-inspector-footer">
            <button
              className="fp-btn fp-btn-danger"
              onClick={() => {
                if (window.confirm(`Delete "${territory.name || 'this area'}"?`)) onDelete(territory.id);
              }}
            >
              <Trash2 /> Delete area
            </button>
          </section>
        )}
      </div>
    </aside>
  );
}
