import { useState, useEffect, useMemo, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import Toolbar from './components/Toolbar.jsx';
import TerritoryList from './components/TerritoryList.jsx';
import MapCanvas from './components/MapCanvas.jsx';
import Legend from './components/Legend.jsx';
import Inspector from './components/Inspector.jsx';
import PinPrompt from './components/PinPrompt.jsx';
import { DEFAULT_PALETTE } from './data/territory-data.js';

const SESSION_ID = Math.random().toString(36).slice(2);
const MAP_DOC = doc(db, 'map', 'territories');

export default function App() {
  const [territories, setTerritories] = useState([]);
  const territoriesRef = useRef([]);   // always mirrors state, safe in callbacks

  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [isEditor, setIsEditor] = useState(false); // always start in view-only mode
  const [showPin, setShowPin] = useState(false);
  const histRef = useRef({ past: [], future: [] });

  function applyTerritories(next) {
    territoriesRef.current = next;
    setTerritories(next);
  }

  // Subscribe to Firestore for real-time updates across all viewers.
  useEffect(() => {
    const unsub = onSnapshot(MAP_DOC, snap => {
      setLoaded(true);
      if (!snap.exists()) { applyTerritories([]); return; }
      const data = snap.data();
      if (data.updatedBy === SESSION_ID) return; // skip echoes of our own saves
      applyTerritories(fromFirestore(data.territories));
      setDirty(false);
    }, err => {
      console.error('Firestore:', err);
      setLoaded(true);
    });
    return unsub;
  }, []);

  function toFirestore(territories) {
    return territories.map(t => ({
      ...t,
      rings: (t.paths || []).map(ring => ({ points: ring })),
      paths: null,
    }));
  }

  function fromFirestore(territories) {
    return (territories || []).map(t => ({
      ...t,
      paths: (t.rings || []).map(r => r.points || []),
      rings: null,
    }));
  }

  async function persistToFirestore(terrs) {
    try {
      await setDoc(MAP_DOC, { territories: toFirestore(terrs), updatedAt: Date.now(), updatedBy: SESSION_ID });
      setDirty(false);
      showToast(`Saved · ${terrs.length} area${terrs.length === 1 ? '' : 's'}`);
    } catch (err) {
      showToast(`Save failed: ${err.message}`, true);
    }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  }

  function pushHistory(prev) {
    histRef.current.past.push(JSON.stringify(prev));
    if (histRef.current.past.length > 50) histRef.current.past.shift();
    histRef.current.future = [];
  }

  // commit: update local state only. User must click Save to push to Firestore.
  function commit(next, { history = true } = {}) {
    if (history) pushHistory(territoriesRef.current);
    applyTerritories(next);
    setDirty(true);
  }

  function onCreate(paths) {
    const id = 't_' + Date.now().toString(36);
    const current = territoriesRef.current;
    const color = DEFAULT_PALETTE[current.length % DEFAULT_PALETTE.length];
    commit([...current, { id, name: '', price: '', color, paths, notes: '' }]);
    setSelectedId(id);
    setTool('select');
    showToast('Area added — set a name and price, then Save.');
  }

  function onUpdatePaths(id, paths) {
    commit(territoriesRef.current.map(t => t.id === id ? { ...t, paths } : t));
  }

  function onChangeTerritory(next) {
    commit(territoriesRef.current.map(t => t.id === next.id ? next : t));
  }

  function onDelete(id) {
    commit(territoriesRef.current.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function onSave() {
    persistToFirestore(territoriesRef.current);
  }

  function onUndo() {
    const h = histRef.current;
    if (!h.past.length) return;
    h.future.push(JSON.stringify(territoriesRef.current));
    applyTerritories(JSON.parse(h.past.pop()));
    setDirty(true);
  }

  function onRedo() {
    const h = histRef.current;
    if (!h.future.length) return;
    h.past.push(JSON.stringify(territoriesRef.current));
    applyTerritories(JSON.parse(h.future.pop()));
    setDirty(true);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); onSave(); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); onUndo(); }
      else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); onRedo(); }
      else if (e.key === 'Escape') { setSelectedId(null); setTool('select'); }
      else if (!isEditor) return;
      else if (e.key === 'p') setTool('polygon');
      else if (e.key === 'r') setTool('rectangle');
      else if (e.key === 'v') setTool('select');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function onUnlockEditor() {
    setIsEditor(true);
    setShowPin(false);
  }

  function onLockEditor() {
    setIsEditor(false);
    setTool('select');
  }

  const selected = useMemo(() => territories.find(t => t.id === selectedId), [territories, selectedId]);
  const activeTool = isEditor ? tool : 'select';

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--fg-3)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
        Loading map…
      </div>
    );
  }

  return (
    <div className="fp-app">
      {showPin && <PinPrompt onSuccess={onUnlockEditor} onClose={() => setShowPin(false)} />}
      <Toolbar
        tool={activeTool}
        setTool={isEditor ? setTool : () => {}}
        query={query} setQuery={setQuery}
        dirty={dirty}
        onSave={onSave} onUndo={onUndo} onRedo={onRedo}
        isEditor={isEditor}
        onToggleEdit={isEditor ? onLockEditor : () => setShowPin(true)}
      />
      <div className="fp-stage">
        <TerritoryList
          territories={territories}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={() => setTool('polygon')}
          onDelete={onDelete}
          query={query}
          isEditor={isEditor}
        />
        <main className="fp-main">
          <MapCanvas
            territories={territories}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={isEditor ? onCreate : null}
            onUpdatePaths={isEditor ? onUpdatePaths : null}
            tool={activeTool}
            query={query}
          />
          <Legend territories={territories} />
        </main>
        <Inspector
          territory={selected}
          onChange={isEditor ? onChangeTerritory : null}
          onClose={() => setSelectedId(null)}
          onDelete={isEditor ? onDelete : null}
          isEditor={isEditor}
        />
      </div>
      {toast && <div className={'fp-toast' + (toast.isError ? ' error' : '')}>{toast.msg}</div>}
    </div>
  );
}
