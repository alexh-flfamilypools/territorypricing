// Toolbar.jsx — top bar with logo, search, drawing tools, save state
window.Toolbar = function Toolbar({ tool, setTool, query, setQuery, savedAt, onSave, onUndo, onRedo, dirty }) {
  const tools = [
    { id: 'select',    icon: 'mouse-pointer-2', label: 'Select & edit' },
    { id: 'polygon',   icon: 'pen-tool',        label: 'Draw polygon' },
    { id: 'rectangle', icon: 'square',          label: 'Draw rectangle' },
    { id: 'pin',       icon: 'map-pin',         label: 'Drop a pin' },
  ];

  return (
    <div className="fp-toolbar">
      <div className="fp-toolbar-left">
        <div className="fp-brand">
          <img src="../../assets/logo-mark.svg" alt="" width="28" height="28"/>
          <div className="fp-brand-text">
            <div className="fp-brand-name">Family Pools</div>
            <div className="fp-brand-sub">Pricing map</div>
          </div>
        </div>
        <div className="fp-search">
          <i data-lucide="search" className="fp-search-icon"></i>
          <input
            id="fp-search-input"
            placeholder="Search a neighborhood, city or address…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="fp-tools">
        {tools.map(t => (
          <button
            key={t.id}
            className={"fp-tool" + (tool === t.id ? " on" : "")}
            onClick={() => setTool(t.id)}
            title={t.label}
          >
            <i data-lucide={t.icon}></i>
          </button>
        ))}
        <span className="fp-tool-divider"></span>
        <button className="fp-tool" onClick={onUndo} title="Undo"><i data-lucide="corner-up-left"></i></button>
        <button className="fp-tool" onClick={onRedo} title="Redo"><i data-lucide="corner-up-right"></i></button>
      </div>

      <div className="fp-toolbar-right">
        <div className="fp-save-state">
          <span className={"fp-dot" + (dirty ? " dirty" : "")}></span>
          {dirty ? 'Unsaved changes' : (savedAt ? `Saved ${savedAt}` : 'Up to date')}
        </div>
        <button className="fp-btn fp-btn-primary" onClick={onSave}>
          <i data-lucide="save"></i>
          Save
        </button>
      </div>
    </div>
  );
};
