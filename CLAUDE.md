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

Two HTML pages share a single stylesheet and a common navbar/footer pattern:

- `index.html` — landing page (hero, solutions, individuals, contact form)
- `research.html` — privacy research page (paper cards)
- `styles.css` — all styles; design tokens in `:root` CSS custom properties
- `script.js` — loaded only by `index.html`; handles navbar scroll state, scroll-reveal, halftone canvas, and contact form submission
- `assets/halftone-data.js` — pre-computed dot data (`window.HALFTONE`) consumed by the canvas renderer in `script.js`

### Halftone canvas

The hero's animated handshake image is not a raster image — it is a canvas driven by dot data in `assets/halftone-data.js`. Each entry in `HALFTONE.dots` is `[nx, ny, rf, r, g, b]` (normalised x/y position, radius fraction, RGB). `script.js` maps those onto the canvas at render time and adds idle shimmer and mouse-repulsion effects. Regenerating the dot data requires re-running whatever image-to-halftone preprocessing produced `halftone-data.js` from the source image (`assets/human2robot.png`).

### Design tokens

All colours, radii, and the gradient are CSS custom properties on `:root` in `styles.css`. Touch those variables first before changing any hardcoded values.

### Contact form

The form POSTs to Formspree. The endpoint is a placeholder constant at the top of `script.js`:

```js
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```

Replace `YOUR_FORM_ID` with a real Formspree form ID to activate submissions.
