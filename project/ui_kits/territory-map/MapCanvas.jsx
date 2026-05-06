// MapCanvas.jsx — Google Maps surface
//
// Loads the Google Maps JavaScript API (with Drawing + Places libraries).
// Falls back to a stylized SVG of the Florida west coast if no API key is set
// in localStorage `fp:googleMapsApiKey` — so reviewers can see the layout
// without an account. The fallback supports the same draw/edit/select flow.
//
// State is fully owned by the parent App; this component is "controlled".
const { useEffect: useEMC, useRef: useRMC, useState: useSMC } = React;

// ---------- API key plumbing ----------
const KEY_STORE = 'fp:googleMapsApiKey';
function getStoredKey() {
  try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; }
}
function setStoredKey(k) {
  try { k ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE); } catch {}
}

// Loads the Maps JS once. Returns a promise that resolves to window.google.
let _mapsPromise = null;
function loadGoogleMaps(apiKey) {
  if (_mapsPromise) return _mapsPromise;
  _mapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(window.google); return; }
    const cb = '__fpGmReady_' + Date.now();
    window[cb] = () => resolve(window.google);
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=drawing,places&v=weekly&callback=${cb}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error('Failed to load Google Maps. Check your API key + the Maps JavaScript API + Places + Drawing are enabled.'));
    document.head.appendChild(s);
  });
  return _mapsPromise;
}

// =====================================================================
// Google-backed map (when a key is present)
// =====================================================================
function GoogleMap({ apiKey, territories, selectedId, onSelect, onCreate, onUpdatePaths, tool, query }) {
  const hostRef = useRMC(null);
  const mapRef = useRMC(null);
  const drawingMgrRef = useRMC(null);
  const polysRef = useRMC(new Map());        // id -> google.maps.Polygon
  const autocompleteRef = useRMC(null);
  const [error, setError] = useSMC(null);
  const [ready, setReady] = useSMC(false);

  // Init map once
  useEMC(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey).then(google => {
      if (cancelled) return;
      const map = new google.maps.Map(hostRef.current, {
        center: window.MAP_DEFAULT.center,
        zoom: window.MAP_DEFAULT.zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: FP_MAP_STYLE,
      });
      mapRef.current = map;

      const dm = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: drawOptions(),
        rectangleOptions: drawOptions(),
      });
      dm.setMap(map);
      drawingMgrRef.current = dm;

      google.maps.event.addListener(dm, 'overlaycomplete', (ev) => {
        let paths = [];
        if (ev.type === 'polygon') {
          paths = [ev.overlay.getPath().getArray().map(ll => ({ lat: ll.lat(), lng: ll.lng() }))];
        } else if (ev.type === 'rectangle') {
          const b = ev.overlay.getBounds();
          const ne = b.getNorthEast(), sw = b.getSouthWest();
          paths = [[
            { lat: ne.lat(), lng: sw.lng() },
            { lat: ne.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: sw.lng() },
          ]];
        }
        ev.overlay.setMap(null);
        dm.setDrawingMode(null);
        onCreate(paths);
      });

      // Wire Places autocomplete to the toolbar's search input
      const input = document.getElementById('fp-search-input');
      if (input) {
        const ac = new google.maps.places.Autocomplete(input, { fields: ['geometry'] });
        ac.bindTo('bounds', map);
        ac.addListener('place_changed', () => {
          const p = ac.getPlace();
          if (p.geometry?.viewport) map.fitBounds(p.geometry.viewport);
          else if (p.geometry?.location) { map.setCenter(p.geometry.location); map.setZoom(13); }
        });
        autocompleteRef.current = ac;
      }

      setReady(true);
    }).catch(err => { setError(err.message || String(err)); });
    return () => { cancelled = true; };
  }, []);

  // Set drawing tool
  useEMC(() => {
    const dm = drawingMgrRef.current;
    if (!dm || !window.google) return;
    const dt = window.google.maps.drawing.OverlayType;
    dm.setDrawingMode(
      tool === 'polygon' ? dt.POLYGON :
      tool === 'rectangle' ? dt.RECTANGLE :
      tool === 'pin' ? dt.MARKER :
      null
    );
  }, [tool, ready]);

  // Sync territories -> polygons
  useEMC(() => {
    if (!ready || !mapRef.current || !window.google) return;
    const map = mapRef.current;
    const live = polysRef.current;
    const seen = new Set();

    for (const t of territories) {
      seen.add(t.id);
      let poly = live.get(t.id);
      const isSelected = t.id === selectedId;
      const opts = {
        paths: t.paths,
        fillColor: t.color,
        fillOpacity: isSelected ? 0.6 : 0.4,
        strokeColor: isSelected ? '#0E2233' : t.color,
        strokeWeight: isSelected ? 2.5 : 1.5,
        strokeOpacity: 0.95,
        editable: isSelected && tool === 'select',
        draggable: false,
        zIndex: isSelected ? 100 : 1,
      };
      if (!poly) {
        poly = new window.google.maps.Polygon(opts);
        poly.setMap(map);
        poly.addListener('click', () => onSelect(t.id));
        const persist = () => {
          const newPaths = poly.getPaths().getArray().map(p => p.getArray().map(ll => ({ lat: ll.lat(), lng: ll.lng() })));
          onUpdatePaths(t.id, newPaths);
        };
        poly.getPaths().forEach((p) => {
          window.google.maps.event.addListener(p, 'set_at', persist);
          window.google.maps.event.addListener(p, 'insert_at', persist);
          window.google.maps.event.addListener(p, 'remove_at', persist);
        });
        live.set(t.id, poly);
      } else {
        poly.setOptions(opts);
      }
    }

    for (const [id, poly] of live.entries()) {
      if (!seen.has(id)) { poly.setMap(null); live.delete(id); }
    }
  }, [territories, selectedId, tool, ready]);

  if (error) {
    return <ApiKeyPrompt error={error} onSubmit={(k) => { setStoredKey(k); _mapsPromise = null; window.location.reload(); }}/>;
  }

  return (
    <div className="fp-map">
      <div ref={hostRef} className="fp-map-host"></div>
      {!ready && <div className="fp-map-loading">Loading Google Maps…</div>}
    </div>
  );
}

function drawOptions() {
  return {
    fillColor: '#2BA8E0',
    fillOpacity: 0.4,
    strokeColor: '#2BA8E0',
    strokeOpacity: 0.95,
    strokeWeight: 2,
    editable: false,
    draggable: false,
    clickable: true,
  };
}

// Muted Google Maps style — quiet roads, hidden POI clutter so polygons read.
const FP_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F4F7FA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5A6D80' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D9F0FA' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1E7BC2' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#ECF1F5' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#DDE5EC' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E5F1E8' }, { visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#DDE5EC' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F4F7FA' }] },
];

// =====================================================================
// Fallback: stylized SVG map (when no API key — prototype review mode)
// =====================================================================
function FallbackMap({ territories, selectedId, onSelect, onCreate, onUpdatePaths, tool, onConfigureKey }) {
  const svgRef = useRMC(null);
  const [view, setView] = useSMC({ x: 0, y: 0, scale: 1 });
  const [draft, setDraft] = useSMC(null); // { paths: [[ {lat,lng} ]] } while drawing
  const dragRef = useRMC(null);

  // Bounds matching MAP_DEFAULT roughly: Naples (~26.0, -82.0) → Tampa (~28.0, -82.6) → Orlando (~28.5, -81.3)
  // We'll fake lat/lng↔px on a 1700×1080 canvas covering lat 25.7..28.7, lng -82.6..-81.0
  const LAT_MIN = 25.7, LAT_MAX = 28.7;
  const LNG_MIN = -82.7, LNG_MAX = -80.9;
  const W = 1700, H = 1080;
  function ll2xy(ll) {
    const x = ((ll.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
    const y = ((LAT_MAX - ll.lat) / (LAT_MAX - LAT_MIN)) * H;
    return [x, y];
  }
  function xy2ll(x, y) {
    return {
      lat: LAT_MAX - (y / H) * (LAT_MAX - LAT_MIN),
      lng: LNG_MIN + (x / W) * (LNG_MAX - LNG_MIN),
    };
  }
  function evtXY(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    return [(x - view.x) / view.scale, (y - view.y) / view.scale];
  }

  function onCanvasClick(e) {
    if (tool === 'polygon') {
      const [x, y] = evtXY(e);
      const ll = xy2ll(x, y);
      setDraft(d => {
        if (!d) return { points: [ll] };
        return { points: [...d.points, ll] };
      });
    }
  }
  function onCanvasDblClick() {
    if (tool === 'polygon' && draft && draft.points.length >= 3) {
      onCreate([draft.points]);
      setDraft(null);
    }
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setView(v => ({ ...v, scale: Math.max(0.6, Math.min(4, v.scale * (1 + delta))) }));
  }
  function onMouseDown(e) {
    if (tool !== 'select' && tool !== 'pin') return;
    if (e.button !== 0) return;
    if (e.target.tagName.toLowerCase() === 'polygon') return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
  }
  function onMouseMove(e) {
    if (!dragRef.current) return;
    const d = dragRef.current;
    setView(v => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
  }
  function onMouseUp() { dragRef.current = null; }

  return (
    <div className="fp-map">
      <div className="fp-map-fallback-banner">
        Preview mode — no Google Maps API key.&nbsp;
        <button onClick={onConfigureKey}>Connect Google Maps</button>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="fp-map-svg"
        style={{ cursor: tool === 'polygon' ? 'crosshair' : (dragRef.current ? 'grabbing' : 'grab') }}
        onClick={onCanvasClick}
        onDoubleClick={onCanvasDblClick}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}>
          {/* Gulf */}
          <defs>
            <pattern id="grid-fb" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20,90,147,0.05)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="gulf-fb" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B7DCEE"/>
              <stop offset="100%" stopColor="#D9F0FA"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#gulf-fb)"/>
          <path d="
            M 1700 0 L 1700 1080 L 50 1080
            L 80 1000 L 130 950 L 160 900 L 150 850 L 200 800
            L 230 760 L 220 700 L 280 650 L 320 600 L 360 580
            L 420 530 L 500 500 L 600 470 L 680 420 L 700 380
            L 720 320 L 750 270 L 820 220 L 900 200 L 1000 180
            L 1100 200 L 1200 220 L 1300 240 L 1400 260
            L 1500 270 L 1600 280 L 1700 290 Z
          " fill="#F4F7FA" stroke="#DDE5EC" strokeWidth="2"/>
          <rect x="0" y="0" width={W} height={H} fill="url(#grid-fb)" pointerEvents="none"/>

          {/* City pins for orientation */}
          {[
            ['Naples', 26.14, -81.79],
            ['Fort Myers', 26.64, -81.87],
            ['Sarasota', 27.34, -82.53],
            ['Bradenton', 27.50, -82.57],
            ['Parrish', 27.59, -82.42],
            ['Tampa', 27.95, -82.46],
            ['St. Pete', 27.77, -82.64],
            ['Lakeland', 28.04, -81.95],
            ['Orlando', 28.54, -81.38],
            ['Punta Gorda', 26.93, -82.05],
          ].map(([name, lat, lng]) => {
            const [x, y] = ll2xy({lat, lng});
            return (
              <g key={name} pointerEvents="none">
                <circle cx={x} cy={y} r="4" fill="#0E2233"/>
                <text x={x + 8} y={y + 5} fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#0E2233">{name}</text>
              </g>
            );
          })}

          {/* Existing polygons */}
          {territories.map(t => (
            (t.paths || []).map((path, i) => {
              const isSelected = t.id === selectedId;
              const pts = path.map(ll => ll2xy(ll).join(',')).join(' ');
              return (
                <polygon
                  key={t.id + '-' + i}
                  points={pts}
                  fill={t.color}
                  fillOpacity={isSelected ? 0.65 : 0.45}
                  stroke={isSelected ? '#0E2233' : t.color}
                  strokeWidth={isSelected ? 3 : 1.5}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); onSelect(t.id); }}
                />
              );
            })
          ))}

          {/* Draft polygon while drawing */}
          {draft && (
            <g pointerEvents="none">
              <polyline
                points={draft.points.map(ll => ll2xy(ll).join(',')).join(' ')}
                fill="none" stroke="#2BA8E0" strokeWidth="2.5" strokeDasharray="6 4"
              />
              {draft.points.map((ll, i) => {
                const [x, y] = ll2xy(ll);
                return <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#2BA8E0" strokeWidth="2"/>;
              })}
            </g>
          )}
        </g>
      </svg>

      {tool === 'polygon' && (
        <div className="fp-map-help">
          Click to add points · double-click to finish · {draft ? draft.points.length + ' points' : 'no points yet'}
        </div>
      )}

      {/* Zoom */}
      <div className="fp-map-zoom">
        <button onClick={() => setView(v => ({ ...v, scale: Math.min(4, v.scale * 1.25) }))}>+</button>
        <button onClick={() => setView(v => ({ ...v, scale: Math.max(0.6, v.scale / 1.25) }))}>−</button>
        <button onClick={() => setView({ x: 0, y: 0, scale: 1 })} title="Reset">⌂</button>
      </div>
    </div>
  );
}

// =====================================================================
// API key prompt
// =====================================================================
function ApiKeyPrompt({ error, onSubmit }) {
  const [val, setVal] = useSMC('');
  return (
    <div className="fp-map fp-map-error">
      <div className="fp-key-card">
        <div className="fp-key-title">Connect Google Maps</div>
        <div className="fp-key-body">
          {error
            ? <>Couldn't load the map: <code>{error}</code></>
            : <>Paste your Google Maps API key. Enable <b>Maps JavaScript</b>, <b>Places</b>, and <b>Drawing</b> on the key.</>}
        </div>
        <input className="fp-key-input" placeholder="AIza…" value={val} onChange={e => setVal(e.target.value)}/>
        <button className="fp-btn fp-btn-primary" onClick={() => onSubmit(val.trim())} disabled={!val.trim()}>
          Connect
        </button>
        <div className="fp-key-foot">Stored locally in your browser only — not sent to anyone.</div>
      </div>
    </div>
  );
}

// =====================================================================
// Public component
// =====================================================================
window.MapCanvas = function MapCanvas(props) {
  const [apiKey, setApiKey] = useSMC(getStoredKey());
  const [showPrompt, setShowPrompt] = useSMC(false);

  if (showPrompt) {
    return <ApiKeyPrompt onSubmit={(k) => { setStoredKey(k); setApiKey(k); setShowPrompt(false); _mapsPromise = null; }}/>;
  }
  if (apiKey) {
    return <GoogleMap apiKey={apiKey} {...props}/>;
  }
  return <FallbackMap {...props} onConfigureKey={() => setShowPrompt(true)}/>;
};
