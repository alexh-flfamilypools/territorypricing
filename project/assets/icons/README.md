# Icons — Family Pools

We use **[Lucide](https://lucide.dev)** loaded from CDN as our icon system. Lucide is the actively-maintained fork of Feather Icons; its 1.5–2px-stroke geometric line style matches the rounded character of the Family Pools wordmark.

## Usage

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<i data-lucide="map-pin" style="width:20px;height:20px;stroke-width:1.75;color:var(--fp-ink-2)"></i>
<script>lucide.createIcons();</script>
```

## Conventions

- **Stroke width:** `1.75` — slightly heavier than Lucide's default 2 looks too bold against Inter at 13–15px.
- **Default size:** 20px in toolbars, 16px inline with text, 14px in dense table rows.
- **Color:** always `currentColor`. Inherit from the parent element. Never use a hard-coded hex on a Lucide icon.
- **Map markers** are NOT Lucide — they're custom SVGs in `assets/markers/` and they DO use brand colors directly.

## Icons used in the Territory Pricing Map

| Concept | Lucide name |
| --- | --- |
| Search | `search` |
| Drawing tool — polygon | `pen-tool` |
| Drawing tool — pin | `map-pin` |
| Drawing tool — freehand | `edit-3` |
| Drawing tool — rectangle | `square` |
| Eraser | `eraser` |
| Layers | `layers` |
| Notes | `file-text` |
| Pricing | `dollar-sign` |
| Owner | `user` |
| Filter | `sliders-horizontal` |
| Save | `save` |
| Undo / Redo | `corner-up-left` / `corner-up-right` |
| Settings | `settings` |
| Close | `x` |

## Substitution flag

⚠️ Family Pools may have an existing icon set we don't have access to. If so, replace this CDN reference with the real source and update the table above.
