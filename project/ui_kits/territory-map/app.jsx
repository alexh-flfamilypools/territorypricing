// app.jsx — Family Pools Pricing Map shell
const { useState: useSA, useEffect: useEA, useMemo: useMA, useRef: useRA } = React;

function loadStored() {
  try {
    const raw = localStorage.getItem(window.TERRITORY_STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
function saveStored(territories) {
  try { localStorage.setItem(window.TERRITORY_STORE_KEY, JSON.stringify(territories)); } catch {}
}

function App() {
  const [territories, setTerritories] = useSA(() => loadStored());
  const [selectedId, setSelectedId] = useSA(null);
  const [tool, setTool] = useSA('select');
  const [query, setQuery] = useSA('');
  const [savedAt, setSavedAt] = useSA(null);
  const [dirty, setDirty] = useSA(false);
  const [toast, setToast] = useSA(null);

  // History for undo / redo
  const histRef = useRA({ past: [], future: [] });

  useEA(() => { setTimeout(() => window.lucide && window.lucide.createIcons(), 0); });

  function pushHistory(prev) {
    histRef.current.past.push(JSON.stringify(prev));
    if (histRef.current.past.length > 50) histRef.current.past.shift();
    histRef.current.future = [];
  }
  function commit(next, { history = true } = {}) {
    if (history) pushHistory(territories);
    setTerritories(next);
    setDirty(true);
  }

  function onCreate(paths) {
    const id = 't_' + Date.now().toString(36);
    const palette = window.DEFAULT_PALETTE;
    const color = palette[territories.length % palette.length];
    const next = [...territories, { id, name: '', price: '', color, paths, notes: '' }];
    commit(next);
    setSelectedId(id);
    setTool('select');
  }

  function onUpdatePaths(id, paths) {
    commit(territories.map(t => t.id === id ? { ...t, paths } : t));
  }

  function onChangeTerritory(next) {
    commit(territories.map(t => t.id === next.id ? next : t));
  }

  function onDelete(id) {
    commit(territories.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function onAdd() { setTool('polygon'); }

  function onSave() {
    saveStored(territories);
    setDirty(false);
    setSavedAt('just now');
    setToast('Saved. ' + territories.length + ' area' + (territories.length===1?'':'s') + '.');
    setTimeout(() => setToast(null), 2000);
  }

  function onUndo() {
    const h = histRef.current;
    if (!h.past.length) return;
    h.future.push(JSON.stringify(territories));
    const prev = JSON.parse(h.past.pop());
    setTerritories(prev);
    setDirty(true);
  }
  function onRedo() {
    const h = histRef.current;
    if (!h.future.length) return;
    h.past.push(JSON.stringify(territories));
    const next = JSON.parse(h.future.pop());
    setTerritories(next);
    setDirty(true);
  }

  // Keyboard
  useEA(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); onSave(); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); onUndo(); }
      else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); onRedo(); }
      else if (e.key === 'Escape') { setSelectedId(null); setTool('select'); }
      else if (e.key === 'p') setTool('polygon');
      else if (e.key === 'r') setTool('rectangle');
      else if (e.key === 'v') setTool('select');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selected = useMA(() => territories.find(t => t.id === selectedId), [territories, selectedId]);

  return (
    <div className="fp-app">
      <Toolbar
        tool={tool} setTool={setTool}
        query={query} setQuery={setQuery}
        savedAt={savedAt} dirty={dirty} onSave={onSave}
        onUndo={onUndo} onRedo={onRedo}
      />
      <div className="fp-stage">
        <TerritoryList
          territories={territories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={onAdd}
          onDelete={onDelete}
          query={query}
        />
        <main className="fp-main">
          <MapCanvas
            territories={territories}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={onCreate}
            onUpdatePaths={onUpdatePaths}
            tool={tool}
            query={query}
          />
          <Legend territories={territories}/>
        </main>
        <Inspector
          territory={selected}
          onChange={onChangeTerritory}
          onClose={() => setSelectedId(null)}
          onDelete={onDelete}
        />
      </div>
      {toast && <div className="fp-toast ok">{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
