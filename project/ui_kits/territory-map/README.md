# Territory Pricing Map — UI Kit

A high-fidelity interactive recreation of Family Pools' internal **Territory Pricing Map**. The sales manager uses it to define pricing per neighborhood, attach notes, assign owners, and draw freeform annotations across SW + Central Florida.

## What's in this kit

- `index.html` — full app, click-through prototype.
- `territory-data.js` — seed data: ~30 neighborhoods from Naples to Orlando.
- `app.jsx` — App shell + state management.
- `MapCanvas.jsx` — the interactive map: SVG-based, pan + zoom, polygon hit-testing.
- `TerritoryList.jsx` — left rail, searchable + filterable.
- `Inspector.jsx` — right panel: pricing, owner, notes, tags.
- `Toolbar.jsx` — top-bar with drawing tools, layers, save state.
- `Legend.jsx` — bottom-right pricing-tier legend with filter.
- `MarkerLayer.jsx` — neighborhood markers on top of the polygons.
- `DrawingLayer.jsx` — freeform annotations (Sharpie-style).

## Interactions modeled

- Click a territory → select it; details load in the right inspector.
- Click in empty space with the polygon tool → draw a new territory polygon.
- Switch display mode (Tier / Owner / Margin) → re-color the map without changing data.
- Edit price or notes inline → live update + "saved" toast.
- Toggle a tier in the legend → hide territories at that tier.
- Search a city in the left rail → filter list + zoom map to result.

## Caveats

- The base map is a **stylized representation** of the Florida west coast for layout purposes — it is not a real geographic projection. In production this would be a MapLibre tile layer.
- All data is fake. The schema mirrors the production JSON contract:
  ```json
  { "id": "...", "name": "...", "city": "...", "tier": "premium",
    "basePrice": 95000, "owner": "...", "polygon": [[x,y], ...],
    "notes": "...", "tags": [...] }
  ```
