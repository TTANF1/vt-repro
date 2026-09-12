'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ViewTransition } from 'react'

/**
 * [locale] 动态段页面：模拟 yao.me 的中英双语路由（/zh ↔ /en）。
 * 提供两种触发方式做对照：
 *  - 纯 Link（Next 客户端导航，无 preventDefault）
 *  - preventDefault + router.push（部分应用的实现方式）
 */
export default function LocalePage() {
  const pathname = usePathname()
  const router = useRouter()
  const other = pathname.startsWith('/en') ? '/zh' : '/en'

  return (
    <main style={{ padding: 32 }}>
      <h1>[locale] page · current: {pathname}</h1>
      <ViewTransition name="locale-block">
        <div
          style={{
            margin: '16px 0',
            padding: 16,
            border: '1px solid #ccc',
            borderRadius: 8,
          }}
        >
          Wrapped in <code>{'<ViewTransition name="locale-block">'}</code>.
        </div>
      </ViewTransition>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Link href={other} style={{ color: '#06c' }}>
          [pure Link] switch to {other}
        </Link>
        <button
          type="button"
          style={{ color: '#06c', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={(e) => {
            e.preventDefault()
            router.push(other)
          }}
        >
          [preventDefault + router.push] switch to {other}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/" style={{ color: '#06c' }}>
          Back to static demo
        </Link>
      </div>
    </main>
  )
}
