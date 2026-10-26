// vincent-ux v1.4.3 · components/react/TableScroll.tsx
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

// 保留原生表格与业务列；只在确有溢出时进入键盘顺序，避免撑开整个页面。
export function TableScroll({ label, children, minWidth = 640 }: { label: string; children: ReactNode; minWidth?: number }) {
  const region = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)
  useLayoutEffect(() => {
    const el = region.current
    if (!el) return
    const measure = () => setOverflow(el.scrollWidth > el.clientWidth + 1)
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    for (const child of el.children) observer.observe(child)
    measure()
    return () => observer.disconnect()
  }, [children])
  return <div ref={region} className="vx-table-scroll" role="region" aria-label={label} tabIndex={overflow ? 0 : undefined}
    style={{ '--table-min-width': `${minWidth}px` } as CSSProperties}>{children}</div>
}
