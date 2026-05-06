import { useState, useEffect, useMemo, useRef } from 'react';
import Toolbar from './components/Toolbar.jsx';
import TerritoryList from './components/TerritoryList.jsx';
import MapCanvas from './components/MapCanvas.jsx';
import Legend from './components/Legend.jsx';
import Inspector from './components/Inspector.jsx';
import { TERRITORY_STORE_KEY, DEFAULT_PALETTE } from './data/territory-data.js';

function loadStored() {
  try {
    const raw = localStorage.getItem(TERRITORY_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveStored(territories) {
  try { localStorage.setItem(TERRITORY_STORE_KEY, JSON.stringify(territories)); } catch {}
}

export default function App() {
  const [territories, setTerritories] = useState(loadStored);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [query, setQuery] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const histRef = useRef({ past: [], future: [] });

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
    const color = DEFAULT_PALETTE[territories.length % DEFAULT_PALETTE.length];
    commit([...territories, { id, name: '', price: '', color, paths, notes: '' }]);
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

  function onSave() {
    saveStored(territories);
    setDirty(false);
    setSavedAt('just now');
    setToast(`Saved. ${territories.length} area${territories.length === 1 ? '' : 's'}.`);
    setTimeout(() => setToast(null), 2000);
  }

  function onUndo() {
    const h = histRef.current;
    if (!h.past.length) return;
    h.future.push(JSON.stringify(territories));
    setTerritories(JSON.parse(h.past.pop()));
    setDirty(true);
  }

  function onRedo() {
    const h = histRef.current;
    if (!h.future.length) return;
    h.past.push(JSON.stringify(territories));
    setTerritories(JSON.parse(h.future.pop()));
    setDirty(true);
  }

  useEffect(() => {
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

  const selected = useMemo(() => territories.find(t => t.id === selectedId), [territories, selectedId]);

  return (
    <div className="fp-app">
      <Toolbar
        tool={tool} setTool={setTool}
        query={query} setQuery={setQuery}
        savedAt={savedAt} dirty={dirty}
        onSave={onSave} onUndo={onUndo} onRedo={onRedo}
      />
      <div className="fp-stage">
        <TerritoryList
          territories={territories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={() => setTool('polygon')}
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
          <Legend territories={territories} />
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
