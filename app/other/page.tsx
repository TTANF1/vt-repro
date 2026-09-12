import Link from 'next/link'
import { ViewTransition } from 'react'

export default function Other() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Other</h1>
      <ViewTransition enter="page-roll" exit="page-roll" default="none">
        <div
          style={{
            margin: '16px 0',
            padding: 16,
            border: '1px solid #ccc',
            borderRadius: 8,
          }}
        >
          Same <code>{'<ViewTransition enter="page-roll" exit="page-roll" default="none">'}</code>{' '}
          wrapper on the destination page.
        </div>
      </ViewTransition>
      <Link href="/" style={{ color: '#06c' }}>
        Back home
      </Link>
    </main>
  )
}
