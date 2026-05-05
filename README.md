# SW Florida Territory Pricing Map

An interactive Google Maps application for managing and pricing service territories across Southwest Florida.

## Features

- **8 pre-built territories** covering Naples, North Naples, Marco Island, Bonita Springs, Estero, Fort Myers, Cape Coral, and Lehigh Acres
- **Draw new territories** using Google Maps polygon drawing tools
- **Edit territory shapes** by dragging polygon vertices directly on the map
- **Per-territory pricing** – set a base price, price per sq ft, and zone classification
- **Persistent storage** – changes are saved to browser `localStorage` automatically
- **Reset to defaults** – restore original territory boundaries and pricing at any time

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Google Maps API key

```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

Your Google Maps API key needs the following APIs enabled:
- **Maps JavaScript API**
- **Drawing Library** (part of Maps JS API)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

| Action | How |
|---|---|
| Select a territory | Click it on the map or in the sidebar list |
| Edit pricing / name | Click a territory, then edit in the right panel |
| Reshape a territory | Select it — polygon vertices become draggable |
| Add a new territory | Click **+ Draw Territory**, draw on the map |
| Delete a territory | Select it, click **Delete** in the edit panel |
| Reset to defaults | Click the **Reset** button |

## Territory Zones

| Zone | Description |
|---|---|
| Zone A – Premium | High-demand coastal areas (Naples Core, Marco Island) |
| Zone B – Standard | Established suburban markets |
| Zone C – Extended | Slightly farther from core service area |
| Zone D – Outlying | Edge of service area |
| Zone E – Custom | Custom pricing arrangements |
