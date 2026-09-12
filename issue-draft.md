## Summary

React 19.3.0 ships the `<ViewTransition>` component, and the Next.js 16.3.4 official guide (`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) documents two usage patterns for it:

- `name="..."` (shared-element morph) — **works** during App Router client-side navigation.
- `enter="..." exit="..." default="none"` (the guide's "loading states" / "directional navigation" pattern, Step 2/3) — **never activates** during App Router client-side navigation.

With the class-based pattern, `document.startViewTransition` is **never called** (verified by monkey-patching it with a counter). The failure is completely silent: no errors, no warnings in the console. Adding `<Link transitionTypes={['nav-forward']}>`, as the guide's "directional motion" section instructs, does **not** help — reproduced on both React 19.3.0 stable and the latest canary.

The guide explicitly claims "route navigations are transitions, so `<ViewTransition>` animations activate automatically during navigation", so the documented pattern silently doing nothing looks like either a bug or a documentation gap.

## Repro

Minimal Next.js 16.3.4 + React 19.3.0 App Router app (files below). A `Probe` client component monkey-patches `document.startViewTransition` with a counter and displays it in a corner overlay. Navigate from `/` to `/other` via a plain `<Link>`:

- With the wrapper `<ViewTransition enter="page-roll" exit="page-roll" default="none">` on the destination page, the counter stays `0`.
- Swapping that same wrapper to `<ViewTransition name="page-block">` makes the counter `1`, and `::view-transition-group(page-block)` / `::view-transition-old(page-block)` / `::view-transition-new(page-block)` pseudo-elements appear during the navigation.

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Probe } from './probe'

export const metadata: Metadata = { title: 'React ViewTransition repro' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Probe />
        {children}
      </body>
    </html>
  )
}
```

```tsx
// app/page.tsx
import Link from 'next/link'
import { ViewTransition } from 'react'

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Home</h1>
      <ViewTransition name="page-block">
        <div style={{ margin: '16px 0', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          Wrapped in <code>{'<ViewTransition name="page-block">'}</code> — this works.
        </div>
      </ViewTransition>
      <Link href="/other" transitionTypes={['nav-forward']}>Go to /other</Link>
    </main>
  )
}
```

```tsx
// app/other/page.tsx
import Link from 'next/link'
import { ViewTransition } from 'react'

export default function Other() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Other</h1>
      <ViewTransition enter="page-roll" exit="page-roll" default="none">
        <div style={{ margin: '16px 0', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          Wrapped in <code>{'<ViewTransition enter="page-roll" exit="page-roll" default="none">'}</code> — this never fires.
        </div>
      </ViewTransition>
      <Link href="/" style={{ color: '#06c' }}>Back home</Link>
    </main>
  )
}
```

```tsx
// app/probe.tsx
'use client'
import { useEffect, useState } from 'react'

export function Probe() {
  const [count, setCount] = useState<number | null>(null)
  const [path, setPath] = useState('')

  useEffect(() => {
    const w = window as unknown as { __vtProbePatched?: boolean; __vtProbeCount?: number }
    if (!w.__vtProbePatched) {
      w.__vtProbePatched = true
      w.__vtProbeCount = 0
      const orig = document.startViewTransition.bind(document)
      document.startViewTransition = function patched(...args: Parameters<typeof document.startViewTransition>) {
        ;(w.__vtProbeCount as number)++
        return (orig as unknown as (...a: unknown[]) => unknown).apply(null, args)
      }
    }
    const read = () => { setCount(w.__vtProbeCount ?? 0); setPath(location.pathname) }
    read()
    const iv = window.setInterval(read, 250)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 8, right: 8, background: '#111', color: '#fff', padding: '6px 10px', fontSize: 12, fontFamily: 'ui-monospace, monospace', zIndex: 9999, borderRadius: 4 }}>
      pathname: {path || '…'} · startViewTransition calls: {count}
    </div>
  )
}
```

## Environment

- next 16.3.4, react 19.3.0, react-dom 19.3.0 (also tested: react/react-dom 19.3.0-canary-019019be-20260911)
- Chromium 147 (stable), Windows 11
- Observed in both `next dev` and `next start` (production build)

## Expected

Per the Next.js guide, the `enter`/`exit` class-based pattern should activate a view transition during client-side route navigation — at minimum when the navigation carries a transition type via `<Link transitionTypes={['nav-forward']}>`, as documented in the guide's "directional motion" section.

## Actual

`document.startViewTransition` is never called for the `enter`/`exit`/`default="none"` pattern, with or without `transitionTypes`, on stable or canary. Only the `name` prop pattern fires it.

## Additional observations (may be relevant)

1. `default="none"` is documented as "deactivates the view transition name" when the component is merely mounted with no same-name element being deleted. During a route navigation the old page's wrapper is unmounted and the new page's wrapper mounts, so the `default` condition is plausibly the active one — with `default="none"` the whole component is deactivated, which would explain why nothing fires. If that is the intended semantics, the docs should warn loudly: the recommended pattern silently does nothing during route navigation unless a matching transition type is present — and even then it did not fire in our tests.
2. Navigating from `/` into a dynamic segment (`/zh`, i.e. a layout-tree change) did not fire even the `name`-based pattern.

## Question for maintainers

Is the class-based (`enter`/`exit`) mode expected to work with App Router client-side navigation in Next.js 16 + React 19.3? If yes, this looks like a bug (silent no-op). If no, the Next.js guide's Step 2/3 examples are misleading and should be corrected or annotated.
