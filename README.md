# React ViewTransition repro (Next.js 16 App Router)

Minimal repro for: `<ViewTransition>` **enter/exit (class-based) pattern never fires** during Next.js 16 App Router client-side navigation, while the `name` (morph) pattern works.

See the full report: https://github.com/react/react/issues/37614

## Reproduce

```bash
npm install
npm run dev
```

Open http://localhost:3001. The page auto-navigates from `/` to `/other` after 1.2s (disable with `?autonav=0`).

A `Probe` overlay in the top-right corner monkey-patches `document.startViewTransition` and shows the call count:

- **`/other`** wraps its block in `<ViewTransition enter="page-roll" exit="page-roll" default="none">` → counter stays **0**.
- **`/`** wraps its block in `<ViewTransition name="page-block">` → counter becomes **1** during navigation, with `::view-transition-group(page-block)` pseudo-elements visible.

## Environment

- next 16.3.4, react/react-dom 19.3.0 (also tested: 19.3.0-canary-019019be-20260911)
- Chromium 147, Windows 11
- Reproduced in both `next dev` and `next start`
