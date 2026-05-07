import { Trash2, Plus } from 'lucide-react';

export default function TerritoryList({ territories, selectedId, onSelect, onAdd, onDelete, query, isEditor }) {
  const filtered = territories.filter(t => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (t.name || '').toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q);
  });

  return (
    <aside className="fp-list">
      <div className="fp-list-head">
        <div className="fp-list-title">Priced areas</div>
        <div className="fp-list-count">{territories.length}</div>
      </div>

      <div className="fp-list-body">
        {filtered.length === 0 && (
          <div className="fp-list-empty">
            {territories.length === 0
              ? isEditor
                ? 'No areas yet. Pick a drawing tool and trace a neighborhood on the map.'
                : 'No areas added yet.'
              : 'Nothing matches that search.'}
          </div>
        )}
        {filtered.map(t => {
          const selected = t.id === selectedId;
          return (
            <button
              key={t.id}
              className={'fp-list-item' + (selected ? ' selected' : '')}
              onClick={() => onSelect(t.id)}
            >
              <div className="fp-list-item-bar" style={{ background: t.color }} />
              <div className="fp-list-item-body">
                <div className="fp-list-item-name">{t.name || 'Untitled area'}</div>
                <div className="fp-list-item-price">
                  {t.price
                    ? '$' + Number(t.price).toLocaleString()
                    : <span style={{ color: 'var(--fg-4)' }}>No price set</span>}
                </div>
              </div>
              {isEditor && (
                <button
                  className="fp-list-item-del"
                  onClick={e => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${t.name || 'this area'}"?`)) onDelete(t.id);
                  }}
                  title="Delete"
                >
                  <Trash2 />
                </button>
              )}
            </button>
          );
        })}
      </div>

      {isEditor && (
        <button className="fp-btn fp-btn-secondary fp-list-add" onClick={onAdd}>
          <Plus /> New priced area
        </button>
      )}
    </aside>
  );
}
