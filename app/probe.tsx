'use client'

import { useEffect, useState } from 'react'

/**
 * 探针：给 document.startViewTransition 打桩计数，
 * 用于验证 React <ViewTransition> 组件是否真的触发了浏览器过渡。
 * 页面右上角实时显示：当前 pathname + 打桩调用计数。
 */
export function Probe() {
  const [count, setCount] = useState<number | null>(null)
  const [path, setPath] = useState('')

  useEffect(() => {
    const w = window as unknown as {
      __vtProbePatched?: boolean
      __vtProbeCount?: number
    }
    if (!w.__vtProbePatched) {
      w.__vtProbePatched = true
      w.__vtProbeCount = 0
      const orig = document.startViewTransition.bind(document)
      document.startViewTransition = function patched(
        ...args: Parameters<typeof document.startViewTransition>
      ) {
        ;(w.__vtProbeCount as number)++
        // eslint-disable-next-line prefer-spread
        return (orig as unknown as (...a: unknown[]) => unknown).apply(
          null,
          args,
        )
      }
    }

    const read = () => {
      setCount(w.__vtProbeCount ?? 0)
      setPath(location.pathname)
    }
    read()
    const iv = window.setInterval(read, 250)

    // 自动导航：默认开启（评审者打开页面即可复现）；?autonav=0 关闭以便手动分步测试
    const autoNav = !new URLSearchParams(location.search).has('autonav')
    if (!autoNav) {
      return () => {
        clearInterval(iv)
      }
    }

    // 自动导航：挂载 1.2s 后模拟点击 Link（App Router 客户端导航）
    const t = setTimeout(() => {
      const link = document.querySelector<HTMLAnchorElement>(
        'a[href="/other"]',
      )
      if (link) link.click()
    }, 1200)

    return () => {
      clearTimeout(t)
      clearInterval(iv)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        background: '#111',
        color: '#fff',
        padding: '6px 10px',
        fontSize: 12,
        fontFamily: 'ui-monospace, monospace',
        zIndex: 9999,
        borderRadius: 4,
      }}
    >
      pathname: {path || '…'} · startViewTransition calls: {count}
    </div>
  )
}
