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
  // Ref always mirrors state — callbacks use this to avoid stale closures.
  const territoriesRef = useRef([]);

  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [query, setQuery] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [isEditor, setIsEditor] = useState(() => localStorage.getItem('fp:editor') === '1');
  const [showPin, setShowPin] = useState(false);
  const histRef = useRef({ past: [], future: [] });
  const saveTimerRef = useRef(null);

  function applyTerritories(next) {
    territoriesRef.current = next;
    setTerritories(next);
  }

  // Subscribe to Firestore — real-time updates for all viewers.
  useEffect(() => {
    const unsub = onSnapshot(MAP_DOC, snap => {
      setLoaded(true);
      if (!snap.exists()) { applyTerritories([]); return; }
      const data = snap.data();
      if (data.updatedBy === SESSION_ID) return; // skip our own writes
      applyTerritories(data.territories || []);
      setDirty(false);
    }, err => {
      console.error('Firestore error:', err);
      setLoaded(true);
    });
    return unsub;
  }, []);

  async function persistToFirestore(terrs) {
    try {
      await setDoc(MAP_DOC, { territories: terrs, updatedAt: Date.now(), updatedBy: SESSION_ID });
      setSavedAt('just now');
      setDirty(false);
      setToast(`Saved · ${terrs.length} area${terrs.length === 1 ? '' : 's'}`);
    } catch (err) {
      setToast(`Save failed: ${err.message}`);
    }
    setTimeout(() => setToast(null), 3500);
  }

  function scheduleAutoSave(terrs) {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => persistToFirestore(terrs), 1500);
  }

  function pushHistory(prev) {
    histRef.current.past.push(JSON.stringify(prev));
    if (histRef.current.past.length > 50) histRef.current.past.shift();
    histRef.current.future = [];
  }

  function commit(next, { history = true } = {}) {
    if (history) pushHistory(territoriesRef.current);
    applyTerritories(next);
    setDirty(true);
    scheduleAutoSave(next);
  }

  function onCreate(paths) {
    const id = 't_' + Date.now().toString(36);
    // Use ref so we always append to the latest list, never a stale snapshot.
    const current = territoriesRef.current;
    const color = DEFAULT_PALETTE[current.length % DEFAULT_PALETTE.length];
    commit([...current, { id, name: '', price: '', color, paths, notes: '' }]);
    setSelectedId(id);
    setTool('select');
    setToast('Area drawn! Give it a name and price in the panel →');
    setTimeout(() => setToast(null), 3000);
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
    clearTimeout(saveTimerRef.current);
    persistToFirestore(territoriesRef.current);
  }

  function onUndo() {
    const h = histRef.current;
    if (!h.past.length) return;
    h.future.push(JSON.stringify(territoriesRef.current));
    const prev = JSON.parse(h.past.pop());
    applyTerritories(prev);
    setDirty(true);
    scheduleAutoSave(prev);
  }

  function onRedo() {
    const h = histRef.current;
    if (!h.future.length) return;
    h.past.push(JSON.stringify(territoriesRef.current));
    const next = JSON.parse(h.future.pop());
    applyTerritories(next);
    setDirty(true);
    scheduleAutoSave(next);
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
    localStorage.setItem('fp:editor', '1');
    setShowPin(false);
  }

  function onLockEditor() {
    setIsEditor(false);
    localStorage.removeItem('fp:editor');
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
        savedAt={savedAt} dirty={dirty}
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
      {toast && <div className={'fp-toast' + (toast.startsWith('Save failed') ? ' error' : '')}>{toast}</div>}
    </div>
  );
}
