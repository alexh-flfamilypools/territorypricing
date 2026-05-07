import { MousePointer2, PenTool, Square, CornerUpLeft, CornerUpRight, Search, Save, Lock, Unlock } from 'lucide-react';

const TOOLS = [
  { id: 'select',    Icon: MousePointer2, label: 'Select (V)' },
  { id: 'polygon',   Icon: PenTool,       label: 'Draw polygon (P)' },
  { id: 'rectangle', Icon: Square,        label: 'Draw rectangle (R)' },
];

export default function Toolbar({ tool, setTool, query, setQuery, onSave, onUndo, onRedo, dirty, isEditor, onToggleEdit }) {
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

      {isEditor && (
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
      )}

      <div className="fp-toolbar-right">
        {isEditor && (
          <>
            {dirty && <div className="fp-save-state"><span className="fp-dot dirty" /> Unsaved changes</div>}
            <button className="fp-btn fp-btn-primary" onClick={onSave}>
              <Save /> Save
            </button>
          </>
        )}
        <button className="fp-btn fp-btn-secondary fp-lock-btn" onClick={onToggleEdit}>
          {isEditor ? <><Unlock size={15} /> Editing</> : <><Lock size={15} /> View only</>}
        </button>
      </div>
    </div>
  );
}
