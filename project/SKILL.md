---
name: family-pools-design
description: Use this skill to generate well-branded interfaces and assets for Family Pools (a Florida custom pool construction company), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components — including the Territory Pricing Map sales tool — for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key files:
- `README.md` — brand context, content rules, visual rules, iconography
- `colors_and_type.css` — all design tokens (colors, type, spacing, radii, shadows, motion)
- `assets/` — logos, map markers, icons
- `preview/` — small specimen cards for each foundation + component
- `ui_kits/territory-map/` — the Territory Pricing Map sales tool, full interactive recreation

Notes:
- Hero color is pool-water blue (`#2BA8E0` / `--fp-pool`). Use sparingly — do not flood UIs with it.
- Voice is plainspoken, direct, no marketing fluff. **No emoji.**
- Type is Poppins (display) + Inter (UI) + JetBrains Mono (numbers), all from Google Fonts.
- Iconography is Lucide via CDN at 1.75 stroke-width.
- The pricing tier scale is **labelled but priceless by default** — actual dollar amounts are set by the sales manager inside the tool.
