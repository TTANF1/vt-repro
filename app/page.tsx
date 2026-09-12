import Link from 'next/link'
import { ViewTransition } from 'react'

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Home</h1>
      <ViewTransition name="page-block">
        <div
          style={{
            margin: '16px 0',
            padding: 16,
            border: '1px solid #ccc',
            borderRadius: 8,
          }}
        >
          This block is wrapped in <code>{'<ViewTransition name="page-block">'}</code>.
          Click the link below: if the React integration works, the old/new page
          snapshots should crossfade (a <code>document.startViewTransition</code> call).
        </div>
      </ViewTransition>
      <Link
        href="/other"
        style={{ color: '#06c', marginRight: 16 }}
        transitionTypes={['nav-forward']}
      >
        Go to /other (transitionTypes)
      </Link>
      <Link href="/zh" style={{ color: '#06c' }}>
        Go to /zh ([locale] demo)
      </Link>
    </main>
  )
}
