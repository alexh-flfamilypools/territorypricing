# Family Pools — Design System

An internal design system for **Family Pools**, a Florida-based custom pool construction company. This system supports both Family Pools' brand identity and the **Territory Pricing Map** — an interactive sales tool that overlays pricing tiers, neighborhood notes, and territory ownership across Southwest and Central Florida (Naples → Tampa → Parrish → Orlando).

> _Drafted from the Family Pools logo and a stub `pricing-territories-2026-05-05.json` (empty territories array, v1 schema). All other foundations were derived by reading the brand mark and inferring conventions appropriate for a regional construction-trade SaaS tool._

## Sources

- `uploads/Family-Pools-logo-600.png` — primary brand mark (logo + wordmark)
- `uploads/pricing-territories-2026-05-05.json` — territories scaffold (empty, version: 1)

If you have additional materials (printed marketing, the live website, screenshots of in-field tools, sales-team Loom walkthroughs), drop them in `uploads/` and ask the agent to extend this system — the foundations here are intentionally conservative so they can stretch to fit.

---

## What Family Pools builds (product context)

- **Custom in-ground pools and spas**, built across SW and Central Florida.
- The crew operates a **Territory Pricing Map** — a sales tool, not a customer-facing product. The sales manager defines and maintains it; account executives consult it before quoting a job.
- Pricing varies **per neighborhood**, not per zip code. Two HOAs across the street from each other can have very different base prices because of pool-equipment access, deed restrictions, permit fees, soil, and historical close-rate.
- The map covers a long ribbon of coast and inland: **Naples, Bonita Springs, Estero, Fort Myers, Cape Coral, Port Charlotte, Punta Gorda, Sarasota, Bradenton, Parrish, Tampa, St. Pete, Lakeland, Orlando**.
- Sales managers need to: draw territory polygons, set tiered pricing, attach neighborhood notes, log who owns what, draw freeform annotations on the map.

---

## Index — files in this system

| Path | What it is |
| --- | --- |
| `README.md` | You are here. Brand context, content rules, visual rules, iconography. |
| `SKILL.md` | Cross-compatible skill definition for Claude Code / agent skills. |
| `colors_and_type.css` | All color, type, spacing, radius, shadow, motion tokens. |
| `fonts/` | Web fonts (loaded via Google Fonts CDN — see Type Substitution below). |
| `assets/` | Logos, marks, map markers, icons. |
| `preview/` | Small HTML cards that populate the Design System review tab. |
| `ui_kits/territory-map/` | The Territory Pricing Map — interactive recreation. |

---

## Brand in one paragraph

Family Pools is **family-run, sun-soaked, and clear-eyed about cost**. The voice is plainspoken and confident — the way a foreman talks to a homeowner standing in a future backyard, not the way a marketing agency talks to a prospect. The brand mark balances four colored swimmers around a pool of water, so we lean on **pool-water blue as the hero color**, with coral / sun / palm-teal as accents used sparingly for category and tier. We avoid corporate gradients, stock-photo polish, and emoji. Everything should feel like **a paper map a sales manager would actually mark up with a Sharpie** — but rendered crisply on a screen.

---

## Content fundamentals

**Voice:** confident, direct, helpful. No marketing fluff. Sentences are short. The reader is a teammate, not a stranger.

**Casing:**
- Buttons and primary actions use **Sentence case** ("Save changes", "New territory"), not Title Case.
- Section labels (eyebrows, table headers, kicker text) use **UPPERCASE with letter-spacing** — sparingly, only where hierarchy calls for it.
- Page and section titles use Sentence case.
- Place names are written exactly as a local would say them: "Cape Coral", "Punta Gorda", "St. Pete" (not "Saint Petersburg" in UI).

**Person:**
- Speak to the user as **you** when giving instructions ("Drop a pin to add a note").
- Speak about the company as **we** when explaining behavior ("We charge a 10% premium for west-of-McGregor jobs").
- Avoid **I** — no chat-app warmth in a sales tool.

**Numbers and money:**
- Prices use whole dollars where possible: `$78,500`, not `$78,500.00`.
- Ranges use an en-dash with no spaces: `$72k–$95k`.
- Tier labels are short and human: **Standard, Preferred, Premium, Coastal, White-glove**. Avoid "Tier 1 / Tier 2 / Tier 3" in user-facing copy unless paired with the human label.
- Coordinates and IDs are mono-spaced.

**Tone examples:**

| Don't | Do |
| --- | --- |
| "Optimize your territorial revenue strategy" | "Set the price for this neighborhood" |
| "Click here to leverage neighborhood insights" | "Open notes for Pelican Landing" |
| "Successfully saved! 🎉" | "Saved. 14 territories updated." |
| "Premium territory unlocked!" | "Coastal premium applies — adds 12%." |

**Emoji:** **No.** Not in UI, not in tooltips, not in notes. The map markers and tier swatches do all the visual labelling we need.

**Unicode characters that _are_ allowed:** the en-dash (`–`), em-dash (`—`), the multiplication sign for dimensions (`14′ × 28′`), the prime symbol for feet (`14′`), and the degree symbol for compass bearings.

---

## Visual foundations

### Color
- **Hero color is pool-water blue (`--fp-pool` / #2BA8E0)** — the same blue as the wordmark in the logo. Used for primary actions, selected territories, and links.
- Coral, sun, and palm-teal come from the four swimmers in the logo. Use them as **categorical accents only** — never as primary buttons, never in gradients with each other.
- Backgrounds are white or **`--fp-canvas` (#F4F7FA)** — never pure gray. Recessed surfaces shift toward `--fp-canvas-2` (#E9EFF4) with a faint cool tint.
- Text is **deep navy** (`--fp-ink` / #0E2233), never pure black. This keeps the brand from feeling sterile.
- The pricing-tier scale is **cool → warm**: light blue (Standard) → deep blue → orange → coral red (Premium) → purple (White-glove). Quantitative + intuitive: warmer means more expensive.

### Type
- **Display & headings:** Poppins (700/800). Geometric, rounded, friendly — closely matches the wordmark's character.
- **Body & UI:** Inter (400/500/600). High legibility at small sizes for dense map UIs.
- **Numerals & coordinates:** JetBrains Mono with tabular figures for prices and lat/lng.

### Spacing & layout
- **4px base grid.** Most rhythm lives at 8 / 12 / 16 / 24 / 32.
- The map view is **chrome-light**: a left rail (territory list), a top toolbar (search + drawing tools), and a right inspector (notes + price). Map fills the rest, full-bleed.
- **Fixed elements:** top toolbar (56px), right inspector (360px when open), left rail (320px collapsible to 56px). The map is always king.

### Backgrounds & imagery
- No full-bleed photography in the tool itself — it would fight the map. Photography belongs on dashboards, exports, and reports.
- **No gradients across hue** (no blue→purple). The only acceptable gradient is a soft pool-water gradient (`--fp-pool-tint` → `--fp-pool`) used as a header wash.
- **No hand-drawn illustrations.** No textures. The aesthetic is "clean cartographer," not "beach-house brochure."

### Borders & corners
- **Hairlines (1px) in `--fp-line`** for everything that needs separation. No 2px borders anywhere except focus rings.
- **Radii:** 6px for inputs and small chips, 10px for cards and panels, 14px for modals and large surfaces, full pill (999px) for tier badges and filter chips.

### Shadows / elevation
- Shadows use a **deep-navy ink with low opacity**, never pure gray-black. Five steps:
  - `--shadow-1` for raised inputs.
  - `--shadow-2` for cards.
  - `--shadow-3` for menus and popovers.
  - `--shadow-4` for modals.
  - `--shadow-pool` — branded blue glow for active states on map markers.

### Hover & press
- **Hover:** background shifts one notch (e.g., transparent → `--fp-canvas`); brand buttons darken 6% (CSS `filter: brightness(0.94)`).
- **Press:** scale 0.98 with a 120ms ease-out, plus brightness 0.9. Never rely on color alone.
- **Focus ring:** 2px `--fp-pool` outline with a 2px white inset, both rounded to match the element. Always visible — keyboard sales managers exist.

### Motion
- All transitions use **`--ease-out` (0.2, 0.8, 0.2, 1)** at **120–200ms** durations.
- No bounces, no spring overshoots, no parallax. The map already moves; the chrome should feel quiet.
- The exception: a one-time pulse on a freshly-saved territory marker (200ms scale 1 → 1.08 → 1).

### Transparency & blur
- Used **only** for the right-inspector backdrop (4% white overlay, 8px blur) when the map is dragging beneath it. Otherwise opaque.

### Cards
- White surface, 1px `--fp-line` border, 10px radius, `--shadow-2`. **No glow, no gradient borders, no left-stripe accents.**
- The exception: a selected territory card uses a 2px `--fp-pool` left border to indicate selection — this is the only place we use an accent stripe.

---

## Iconography

**Approach:** lightweight, line-based, 1.75px stroke, square cap, round joins. Icons are **never colored** — they inherit `currentColor` from the element they're inside. Tier color and ownership color come from swatches and badges, not icons.

**Library:** [**Lucide**](https://lucide.dev) (the actively-maintained fork of Feather). It is loaded from CDN — see `assets/icons/README.md`. Lucide is a substitution choice — we picked it because Family Pools doesn't have a documented icon library yet and Lucide's stroke style is the closest match to the rounded geometry of the logo. **Flag for the user:** if Family Pools has an existing icon kit, replace the CDN reference with the real source.

**Map markers:** custom SVGs in `assets/markers/` — pin, pool-drop, dollar-tag, sharpie-X. These _are_ colored (using tier colors) and live separately from the icon system.

**Logo:** `assets/logo-full.png` for marketing surfaces. For the in-app top bar, we use a small monogram pulled from the wordmark — see `assets/logo-mark.svg`.

**No emoji. No flags. No country/state shields.** Place names are typeset, not iconified.

---

## Type substitution flag

⚠️ Family Pools does not (yet) have a documented type system, so I picked the closest Google-Fonts match to the wordmark and the in-field tone:

- **Poppins** (display) — closest geometric-rounded-sans match to the "FAMILY POOLS" wordmark.
- **Inter** (body/UI) — neutral, high-legibility default.
- **JetBrains Mono** (numerals) — tabular figures for pricing.

If Family Pools has a brand standard that calls for **Proxima Nova, Nunito, or DM Sans**, drop the .ttf/.woff files into `fonts/` and update `colors_and_type.css`'s `@import` and `--font-display` / `--font-body` variables.

---

## UI Kits

| Kit | What's in it |
| --- | --- |
| `ui_kits/territory-map/` | The full Territory Pricing Map — sidebar, toolbar, map canvas, inspector, drawing tools, tier legend, notes editor. Click-through prototype. |

---

## Sales team

Sales reps in Family Pools don't have hard territory assignments — pricing is the focus, ownership is informational:

| Rep | Focus |
| --- | --- |
| **Joe** | Pulte builder accounts |
| **Chris** | Airbnb / short-term-rental owners |
| **Earl & Julie** | Commercial pools |
| **Anne** | No defined territory |
| **Zach** | No defined territory |
| **Ken** | No defined territory |

The point of the tool is **accurate per-neighborhood pricing for any rep to quote against** — not territory turf-management.

## Production: use Google Maps

The current prototype draws a stylized Florida coastline in SVG so the design language is reviewable offline. **Production should use the Google Maps JavaScript API:**

- Base map: Google Maps with a custom muted style (low-saturation roads, hidden POI clutter) so neighborhood color fills read clearly.
- Polygons: `google.maps.Polygon` per neighborhood, fill colored by tier, click handler opens the inspector.
- Search: `google.maps.places.Autocomplete` on the toolbar search field — typing "Pelican Landing" zooms + highlights.
- Drawing: `google.maps.drawing.DrawingManager` for the polygon / rectangle / freehand tools.
- Geocoding: when the manager adds a new neighborhood by name, Google Geocoding returns the bounds.

Swap `MapCanvas.jsx` for a Google-Maps-backed component; the inspector, list, legend, and tokens stay as-is. You will need an API key with **Maps JavaScript, Places, Geocoding, and Drawing** enabled. Lock the key to your `family-pools` domain.

## Caveats

- The territories JSON was empty, so I generated ~30 realistic-but-fictional neighborhoods. **Replace with real data on first use.**
- Polygons are positioned on a stylized canvas — production swaps to Google Maps (see above).
- Type and icon library are educated substitutions (see flags above).
