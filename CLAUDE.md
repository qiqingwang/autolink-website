# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AutoLink is a pure static marketing website — no build step, no package manager, no framework. Open `index.html` directly in a browser or serve with any static file server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

There are no lint, test, or CI commands.

## Architecture

Four HTML pages share a single stylesheet (`styles.css`) and a common navbar/footer:

| File | Purpose |
|---|---|
| `index.html` | Landing page — hero, solutions, individuals sections |
| `team.html` | Team page — 6 member cards with circular photos |
| `research.html` | Research page — paper list table (4 papers) |
| `contact.html` | Contact page — Web3Forms submission form |
| `styles.css` | All styles; design tokens in `:root` |
| `script.js` | Loaded by `index.html` and `contact.html`; handles navbar scroll, scroll-reveal, halftone canvas, contact form |
| `assets/halftone-data.js` | Pre-computed dot data for the hero canvas animation |
| `team/` | Team member photos (JPEGs, filenames encode name + role) |
| `partners/` | Partner logo images used in footer marquee |

### Navbar

All pages share the same nav: `Solutions → team.html → research.html → Contact (button → contact.html)`. The active page adds `is-active` to its nav link. Secondary pages (`team`, `research`, `contact`) hardcode `is-scrolled` on the `<header>` since they have no scroll-based trigger.

### Footer

Every page has an identical footer block:
- Left: AutoLink logo + "Built in Singapore. Designed for the World." + inline scrolling partner logo marquee (`footer__brand-marquee`)
- Right: nav links (`footer__nav`)
- Bottom bar: copyright

The partner marquee uses CSS `animation: marquee-scroll` and duplicates all logos once in the HTML to create a seamless loop. Logos use `filter: grayscale(1) invert(1)` so JPEG logos with white backgrounds display correctly on the dark page (white bg → black/invisible, dark logo → white/visible).

### Halftone canvas

The hero animated image is a `<canvas>` driven by `assets/halftone-data.js`. Each dot entry is `[nx, ny, rf, r, g, b]` (normalised position, radius fraction, RGB). The canvas renderer in `script.js` adds idle shimmer and mouse-repulsion effects. Regenerating the dot data requires re-running the image-to-halftone preprocessing against `assets/human2robot.png`.

### Design tokens

All colours, radii, and the gradient are CSS custom properties on `:root` in `styles.css`. No coloured text anywhere — all text is white (`#fff`, `var(--text)`, `var(--text-dim)`, or `var(--text-faint)`). Gradient backgrounds on buttons and card hover borders are the only use of `--grad` / `--coral` / `--purple` tokens.

### Contact form

`contact.html` uses [Web3Forms](https://web3forms.com). The access key is a hidden input in the form:

```html
<input type="hidden" name="access_key" value="2372e0a4-..." />
```

`script.js` POSTs to `https://api.web3forms.com/submit` with `Accept: application/json` to get a JSON response instead of a redirect. Submissions go to `qiqing.wang@u.nus.edu`.

---

## Changelog

### 2026-06-10
- **Typography**: Removed all gradient/coloured text. All headings and body copy now use white-family tokens only. Buttons retain gradient backgrounds; decorative card hover borders retain subtle colour.
- **Team page** (`team.html`): New dedicated page. 6 members displayed as 3-column grid with 96 px circular photos (`object-fit: cover`, `object-position: top center`). Order: CEO, CTO, COO (row 1) → Chaopeng Tan (Technical Advisor), Product Lead, Technical Lead (row 2).
- **Contact page** (`contact.html`): Extracted from `index.html` into its own page. Integrated Web3Forms (replaces Formspree placeholder).
- **Research page** (`research.html`): Replaced card-based layout with a clean table list. Columns: Date · Title + Authors · Category · Arrow. Added 3 new papers (2 × arXiv 2026, 1 × Transportation Research Part C 2024). Papers sorted newest-first.
- **Footer**: Replaced two-column brand/contact layout with brand + inline partner logo marquee (left) and nav links (right). Removed email address. Removed traction stat counts. Partner logos use `grayscale(1) invert(1)` filter fix.
- **Navigation**: Added Team and Contact to all pages; removed embedded `#join` and `#team` anchors from main page.
- **Directories**: Renamed `Team/` → `team/` and `Partners/` → `partners/` for Linux/GitHub Pages case-sensitivity compatibility.
