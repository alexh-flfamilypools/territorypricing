import { MousePointer2, PenTool, Square, MapPin, CornerUpLeft, CornerUpRight, Search, Save } from 'lucide-react';

const TOOLS = [
  { id: 'select',    Icon: MousePointer2, label: 'Select & edit (V)' },
  { id: 'polygon',   Icon: PenTool,       label: 'Draw polygon (P)' },
  { id: 'rectangle', Icon: Square,        label: 'Draw rectangle (R)' },
  { id: 'pin',       Icon: MapPin,        label: 'Drop a pin' },
];

export default function Toolbar({ tool, setTool, query, setQuery, savedAt, onSave, onUndo, onRedo, dirty }) {
  return (
    <div className="fp-toolbar">
      <div className="fp-toolbar-left">
        <div className="fp-brand">
          <img src="/logo-mark.svg" alt="" width="28" height="28" />
          <div className="fp-brand-text">
            <div className="fp-brand-name">Family Pools</div>
            <div className="fp-brand-sub">Pricing map</div>
          </div>
        </div>
        <div className="fp-search">
          <Search className="fp-search-icon" />
          <input
            id="fp-search-input"
            placeholder="Search a neighborhood, city or address…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="fp-tools">
        {TOOLS.map(({ id, Icon, label }) => (
          <button
            key={id}
            className={'fp-tool' + (tool === id ? ' on' : '')}
            onClick={() => setTool(id)}
            title={label}
          >
            <Icon />
          </button>
        ))}
        <span className="fp-tool-divider" />
        <button className="fp-tool" onClick={onUndo} title="Undo (Ctrl+Z)"><CornerUpLeft /></button>
        <button className="fp-tool" onClick={onRedo} title="Redo (Ctrl+Y)"><CornerUpRight /></button>
      </div>

      <div className="fp-toolbar-right">
        <div className="fp-save-state">
          <span className={'fp-dot' + (dirty ? ' dirty' : '')} />
          {dirty ? 'Unsaved changes' : (savedAt ? `Saved ${savedAt}` : 'Up to date')}
        </div>
        <button className="fp-btn fp-btn-primary" onClick={onSave}>
          <Save /> Save
        </button>
      </div>
    </div>
  );
}
